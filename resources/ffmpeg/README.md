# FFmpeg with Extended Codec Support

Bu klasöre özel FFmpeg DLL dosyası yerleştirilmelidir.

## Neden Gerekli?

Electron'un varsayılan FFmpeg'i şu codec'leri **desteklemiyor**:
- AC3 (Dolby Digital)
- EAC3 (Dolby Digital Plus)
- HEVC/H.265
- DTS

## Nasıl Elde Edilir?

### Seçenek 1: Hazır İndir
1. https://github.com/nicksay/electron-media-codecs/releases adresinden indirin
2. Electron versiyonunuza uygun `ffmpeg.dll` dosyasını bu klasöre kopyalayın

### Seçenek 2: Kendiniz Derleyin
1. https://github.com/nicksay/electron-media-codecs reposunu klonlayın
2. Build talimatlarını takip edin

## Dosya Yapısı

```
resources/
└── ffmpeg/
    └── ffmpeg.dll    <-- Bu dosyayı buraya koyun
```

## Build Süreci

`npm run electron-build` çalıştırıldığında:
1. `electron-builder-hooks.js` bu klasördeki `ffmpeg.dll`'i kontrol eder
2. Bulursa, Electron'un varsayılan ffmpeg.dll'ini bununla değiştirir
3. Bulamazsa, varsayılan ile devam eder (bazı codec'ler çalışmaz)
