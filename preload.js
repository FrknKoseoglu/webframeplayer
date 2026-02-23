const { contextBridge } = require('electron');
const path = require('path');
const fs = require('fs');

let mpv = null;
let pixelArray = null;
let initError = null;

try {
  // Yolu Next.js build sonrası ve dev ortamı için ayarla
  // Try multiple paths to ensure we find it regardless of where Electron is launched from
  const possiblePaths = [
    path.join(__dirname, 'build', 'Release', 'mpv_renderer.node'),
    path.join(process.cwd(), 'build', 'Release', 'mpv_renderer.node'),
    path.resolve('build/Release/mpv_renderer.node')
  ];

  let nativePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      nativePath = p;
      break;
    }
  }

  if (nativePath) {
    const { MpvRenderer } = require(nativePath);
    mpv = new MpvRenderer();
    mpv.initialize();
    
    // Canvas ImageData için SharedArrayBuffer
    const sharedBuffer = new SharedArrayBuffer(1920 * 1080 * 4);
    pixelArray = new Uint8Array(sharedBuffer); // MUST BE Uint8Array for C++ layer
    console.log('[Preload] Native MPV module initialized successfully from:', nativePath);
  } else {
    initError = `Native module NOT FOUND in any of: ${possiblePaths.join(', ')}`;
    console.error(`[Preload] ${initError}`);
  }
} catch (e) {
  initError = e.message || String(e);
  console.error('[Preload] Failed to load native mpv module:', e);
}

window.mpv = {
  isAvailable: () => mpv !== null,
  getError: () => initError,
  load: (url) => mpv && mpv.load(url),
  play: () => mpv && mpv.play(),
  pause: () => mpv && mpv.pause(),
  seek: (seconds) => mpv && mpv.seek(seconds),
  stop: () => mpv && mpv.stop(),
  getProperty: (name) => mpv ? mpv.getProperty(name) : undefined,
  setProperty: (name, value) => mpv && mpv.setProperty(name, value),
  command: (cmdArgs) => mpv && mpv.command(cmdArgs),
  
  // Render loop control
  startRendering: (canvasId, onFirstFrame) => {
    if (!mpv || !pixelArray) {
      throw new Error("MPV modülü preload içinde başlatılamadı.");
    }
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas elementi bulunamadı: ${canvasId}`);
    }
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error("Canvas 2d context alınamadı.");
    }

    let isActive = true;
    let animationFrameId;
    let frameCount = 0;
    
    // Pre-allocate ImageData ONCE. This is an ArrayBuffer (not SharedArrayBuffer) memory struct.
    const imageData = new ImageData(1920, 1080);

    const renderLoop = () => {
      if (!isActive) return;
      try {
        // C++ tarafında 'render' fonksiyonu Uint8Array veya uyumlu TypedArray bekliyor
        mpv.render(1920, 1080, pixelArray);
        
        // Pikselleri Canvas'a aktar (Hızlı Bellek Kopyalama)
        imageData.data.set(pixelArray);
        ctx.putImageData(imageData, 0, 0);
        
        frameCount++;
        if (frameCount === 60 && onFirstFrame) {
            // Give it about 1 second of frames to definitely have non-black data, then trigger
            // (or we can just check pixel data, but 60 frames is a safe bet for stream initialization)
            let sum = 0;
            for(let i=0; i<1000; i++) sum += pixelArray[i];
            if(sum > 0) {
               onFirstFrame();
            } else {
               // If still black, wait for frame 120
               frameCount = 0;
            }
        }
        
        animationFrameId = requestAnimationFrame(renderLoop);
      } catch (err) {
        console.error('[Preload] Render loop error:', err);
        isActive = false;
      }
    };

    renderLoop();

    // Cleanup function'ı frontend'e geri dön
    return () => {
      isActive = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }
};
