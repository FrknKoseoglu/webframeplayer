---
name: MPV Player Expert
description: Guidelines and instructions for working with the MPV player C++ addon in this Electron + React project.
---

# MPV Player Kuralları ve Yönergesi

Bu proje, video oynatımı (IPTV/VOD) ve performans gerektiren akışlar için yerel bir C++ eklentisi (Node-addon-api) aracılığıyla **libmpv** kullanmaktadır. Bu skill (yetenek), MPV entegrasyonuyla ilgili sorunları çözerken veya yeni özellikler eklerken izlenmesi gereken yolları tanımlar.

## 1. Mimari ve Dosya Yapısı
- **`binding.gyp`**: node-gyp aracılığıyla C++ eklentisinin nasıl derleneceğini belirtir. Kütüphane yolları, include dizinleri ve bağımlılıklar burada yapılandırılır.
- **`libmpv-2.dll`**: Projede kullanılan önceden derlenmiş MPV Windows kütüphanesidir. (Çalışma dizininde veya derlenmiş uygulamanın kök dizininde yer almalıdır, aksi takdirde uygulama sessizce çöker).
- **`renderer.cpp` (veya benzeri `.cpp` dosyaları)**: `libmpv` C kütüphanesi fonksiyonlarını (ör. `mpv_get_property`, `mpv_command`, `mpv_wait_event`) N-API kullanarak JavaScript nesnelerine (Node.js modülüne) bağlar.
- **`src/types/mpv.d.ts`**: JavaScript modülüne bağlanan MPV C++ metodlarının ve olaylarının TypeScript tarafındaki tip (type) tanımlarını içerir.

## 2. MPV Temel Konseptleri
- **Özellikler (Properties)**: Sesi değiştirmek (volume), oynatma hızını ayarlamak (speed), veya geçerli zamanı okumak (time-pos) için kullanılır. `mpv_set_property_string` gibi fonksiyonlarla manipüle edilir.
- **Komutlar (Commands)**: Dosya yüklemek (loadfile), oynatmayı durdurmak (stop), döngüye almak gibi anlık eylemler için `mpv_command` çağrılır.
- **Olaylar (Events)**: Video bittiğinde (MPV_EVENT_END_FILE), metadata okunduğunda veya bir buffer sorunu yaşandığında Node.js tarafına asenkron olarak tetiklenmelidir. Bu, tipik olarak özel bir `ThreadSafeFunction` üzerinden yapılır, çünkü MPV kendi iş parçacığında (thread) çalışırken, Node.js ana iş parçacığında `callback` bekler.

## 3. Electron Entegrasyonu ve Pencere (HWND) Yönetimi
- MPV, görüntüyü çizebilmek için bir işletim sistemi pencere tanıtıcısına (Windows'ta `HWND`) ihtiyaç duyar.
- Genellikle, HTML DOM üzerinde özel bir bölge render edilmez. Bunun yerine, MPV doğrudan bir pencere ID'si (WID - Window ID) üzerinden Electron'un `BrowserWindow` elementine (ya da BrowserWindow'un içindeki bir view'a) görüntüyü yansıtır.
- Electron'un `browserWindow.getNativeWindowHandle()` fonksiyonuyla elde edilen Buffer (HWND verisi), C++ addon'una gönderilir ve `mpv_set_option_string(ctx, "wid", hwnd_string)` şeklinde yapılandırılır.

## 4. Sorun Giderme (Gıcık Davranışlar)
- **Modül Bulunamadı (Cannot find module) veya `require` Hatası**: C++ eklentisi derlenmemiş demektir. Çözüm: `node-gyp rebuild` komutu çalıştırılmalı ve DLL dosyalarının konumu doğrulanmalıdır.
- **Uygulamanın Aniden Kapanması (Crash)**: C++ kısmında bir pointer (işaretçi) hatası, hafıza sızıntısı (memory leak) ya da ana dizinde `libmpv-2.dll` dosyasının bulunmaması sebebiyledir. Try-catch bloğu burada işe yaramaz.
- **Siyah Ekran / Ses Var Görüntü Yok**: HWND değerinin C++ tarafına yanlış iletilmesi (örneğin little-endian/big-endian dönüşüm sorunu) veya donanım hızlandırmasının (hwdec) hedef bilgisayarda desteklenmemesi durumudur. Donanım hızlandırma modlarını (`d3d11va`, `dxva2` vb.) fall-back (ikame) olarak deneyerek çözülebilir.

## 5. Yeni Özellik Geliştirme Akışı Yönergesi
Eğer MPV'ye yeni bir yetenek eklenecekse (ör: alt yazı (subtitle) gecikmesini ayarlama):
1. **Araştır**: https://mpv.io/manual/master/ adresinden ilgili MPV propertysini (ör: `sub-delay`) bul.
2. **C++ Addon Güncellemesi**: N-API kullanarak (ör. `renderer.cpp` içinde) property'i okuyacak/yazacak bir fonksiyon sarmalayıcısı (wrapper) tanımla. Modül dışa aktarmalarına (exports) ekle. C++ `rebuild` at.
3. **Tipleri Güncelle**: `src/types/mpv.d.ts` içerisine bu yeni fonksiyonun tip tanımını gir.
4. **Electron IPC**: Electron Main process'te bu fonksiyonu sarmalayarak (wrap) `ipcMain.handle` dinleyicilerine bağla.
5. **React Entegrasyonu**: Renderer thread'de, React hook'ları üzerinden (örneğin `window.electron.mpvSetSubDelay(1.5)`) bu fonksiyonu React UI arayüzü bileşenlerine ekle.
