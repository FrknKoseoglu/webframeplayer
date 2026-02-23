#include <napi.h>
#include <mpv/client.h>
#include <mpv/render.h>
#include <iostream>
#include <vector>
#include <string>
#include <windows.h>

typedef char* (*mpv_get_property_string_fn)(mpv_handle *ctx, const char *name);
typedef void (*mpv_free_fn)(void *data);

class MpvRenderer : public Napi::ObjectWrap<MpvRenderer> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports) {
        Napi::Function func = DefineClass(env, "MpvRenderer", {
            InstanceMethod("initialize", &MpvRenderer::Initialize),
            InstanceMethod("load", &MpvRenderer::Load),
            InstanceMethod("render", &MpvRenderer::Render),
            InstanceMethod("setOption", &MpvRenderer::SetOption),
            InstanceMethod("play", &MpvRenderer::Play),
            InstanceMethod("pause", &MpvRenderer::Pause),
            InstanceMethod("seek", &MpvRenderer::Seek),
            InstanceMethod("stop", &MpvRenderer::Stop),
            InstanceMethod("getProperty", &MpvRenderer::GetProperty),
            InstanceMethod("setProperty", &MpvRenderer::SetProperty),
            InstanceMethod("command", &MpvRenderer::Command),
        });

        Napi::FunctionReference* constructor = new Napi::FunctionReference();
        *constructor = Napi::Persistent(func);
        env.SetInstanceData(constructor);

        exports.Set("MpvRenderer", func);
        return exports;
    }

    MpvRenderer(const Napi::CallbackInfo& info) : Napi::ObjectWrap<MpvRenderer>(info) {
        handle = mpv_create();
        if (!handle) {
            Napi::Error::New(info.Env(), "Failed to create mpv handle").ThrowAsJavaScriptException();
        }
    }

    ~MpvRenderer() {
        if (render_ctx) mpv_render_context_free(render_ctx);
        if (handle) mpv_terminate_destroy(handle);
    }

private:
    mpv_handle* handle = nullptr;
    mpv_render_context* render_ctx = nullptr;
    mpv_get_property_string_fn fn_get_property_string = nullptr;
    mpv_free_fn fn_free = nullptr;

    Napi::Value Initialize(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        
        // Dynamically load missing functions from libmpv-2.dll to bypass LNK2001 build errors
        HMODULE hMpv = GetModuleHandleW(L"libmpv-2.dll");
        if (!hMpv) hMpv = LoadLibraryW(L"libmpv-2.dll");
        if (hMpv) {
            fn_get_property_string = (mpv_get_property_string_fn)GetProcAddress(hMpv, "mpv_get_property_string");
            fn_free = (mpv_free_fn)GetProcAddress(hMpv, "mpv_free");
        }
        
        // Force software decoding and route video strictly to our renderer (not a standalone window)
        mpv_set_option_string(handle, "vo", "libmpv");
        mpv_set_option_string(handle, "hwdec", "no");
        mpv_set_option_string(handle, "video-output-levels", "full");
        
        // Network options for IPTV streams (bypass bot blocks and SSL cert errors)
        mpv_set_option_string(handle, "user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        mpv_set_option_string(handle, "tls-verify", "no");
        mpv_set_option_string(handle, "network-timeout", "15");
        
        // Enable terminal logging for debugging
        mpv_set_option_string(handle, "msg-level", "all=v");

        if (mpv_initialize(handle) < 0) {
            return Napi::Boolean::New(env, false);
        }

        mpv_render_param params[] = {
            {MPV_RENDER_PARAM_API_TYPE, (void*)MPV_RENDER_API_TYPE_SW},
            {MPV_RENDER_PARAM_INVALID, nullptr}
        };

        if (mpv_render_context_create(&render_ctx, handle, params) < 0) {
            return Napi::Boolean::New(env, false);
        }
        
        // Critical: libmpv software renderer often stalls unless an update callback is registered
        mpv_render_context_set_update_callback(render_ctx, [](void* ctx) {
            // We just need to register it. We are polling via requestAnimationFrame anyway.
            // In a blocking setup we would wake up the JS thread here.
        }, nullptr);

        return Napi::Boolean::New(env, true);
    }

    Napi::Value SetOption(const Napi::CallbackInfo& info) {
        std::string name = info[0].As<Napi::String>();
        std::string value = info[1].As<Napi::String>();
        mpv_set_option_string(handle, name.c_str(), value.c_str());
        return info.Env().Undefined();
    }

    Napi::Value Load(const Napi::CallbackInfo& info) {
        std::string url = info[0].As<Napi::String>();
        const char* cmd[] = {"loadfile", url.c_str(), nullptr};
        mpv_command(handle, cmd);
        return info.Env().Undefined();
    }

    Napi::Value Play(const Napi::CallbackInfo& info) {
        mpv_set_property_string(handle, "pause", "no");
        return info.Env().Undefined();
    }

    Napi::Value Pause(const Napi::CallbackInfo& info) {
        mpv_set_property_string(handle, "pause", "yes");
        return info.Env().Undefined();
    }

    Napi::Value Seek(const Napi::CallbackInfo& info) {
        double seconds = info[0].As<Napi::Number>().DoubleValue();
        std::string sec_str = std::to_string(seconds);
        const char* cmd[] = {"seek", sec_str.c_str(), "absolute", nullptr};
        mpv_command(handle, cmd);
        return info.Env().Undefined();
    }

    Napi::Value Stop(const Napi::CallbackInfo& info) {
        const char* cmd[] = {"stop", nullptr};
        mpv_command(handle, cmd);
        return info.Env().Undefined();
    }

    Napi::Value GetProperty(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        if (info.Length() < 1 || !info[0].IsString() || !fn_get_property_string || !fn_free) {
            return env.Undefined();
        }
        std::string name = info[0].As<Napi::String>();
        char* value = fn_get_property_string(handle, name.c_str());
        if (!value) return env.Undefined();
        Napi::String str = Napi::String::New(env, value);
        fn_free(value);
        return str;
    }

    Napi::Value SetProperty(const Napi::CallbackInfo& info) {
        if (info.Length() >= 2 && info[0].IsString() && info[1].IsString()) {
            std::string name = info[0].As<Napi::String>();
            std::string value = info[1].As<Napi::String>();
            mpv_set_property_string(handle, name.c_str(), value.c_str());
        }
        return info.Env().Undefined();
    }

    Napi::Value Command(const Napi::CallbackInfo& info) {
        if (info.Length() < 1 || !info[0].IsArray()) return info.Env().Undefined();
        
        Napi::Array arr = info[0].As<Napi::Array>();
        std::vector<std::string> args;
        for (uint32_t i = 0; i < arr.Length(); i++) {
            args.push_back(arr.Get(i).ToString().Utf8Value());
        }
        
        std::vector<const char*> cmd;
        for (const auto& s : args) {
            cmd.push_back(s.c_str());
        }
        cmd.push_back(nullptr);
        
        mpv_command(handle, cmd.data());
        return info.Env().Undefined();
    }

    Napi::Value Render(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        int width = info[0].As<Napi::Number>();
        int height = info[1].As<Napi::Number>();
        
        // Safety check to prevent fatal C++ aborts when exceptions are disabled
        if (!info[2].IsTypedArray()) {
            return Napi::Boolean::New(env, false);
        }
        
        Napi::Uint8Array buffer = info[2].As<Napi::Uint8Array>();

        int size[] = { width, height };
        size_t stride = width * 4;
        
        // Extract raw byte pointer
        uint8_t* rawBuffer = reinterpret_cast<uint8_t*>(buffer.Data());

        mpv_render_param params[] = {
            {MPV_RENDER_PARAM_SW_SIZE, size},
            {MPV_RENDER_PARAM_SW_FORMAT, (void*)"rgba"},
            {MPV_RENDER_PARAM_SW_STRIDE, &stride},
            {MPV_RENDER_PARAM_SW_POINTER, buffer.Data()},
            {MPV_RENDER_PARAM_INVALID, nullptr}
        };

        mpv_render_context_render(render_ctx, params);

        return Napi::Boolean::New(env, true);
    }
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return MpvRenderer::Init(env, exports);
}

NODE_API_MODULE(mpv_renderer, Init)
