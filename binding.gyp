{
  "targets": [
    {
      "target_name": "mpv_renderer",
      "sources": [ "src/main/native/mpv_renderer.cpp" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "deps/mpv/include"
      ],
      "libraries": [
        "<(module_root_dir)/deps/mpv/lib/libmpv.lib"
      ],
      "msvs_settings": {
        "VCCLCompilerTool": { "ExceptionHandling": 1 },
        "VCLinkerTool": {
          "AdditionalLibraryDirectories": [
            "<(module_root_dir)/deps/mpv/lib"
          ]
        }
      },
      "conditions": [
        ["OS=='win'", {
          "defines": [ "_HAS_EXCEPTIONS=1", "NOMINMAX" ]
        }]
      ]
    }
  ]
}
