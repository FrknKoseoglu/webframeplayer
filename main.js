const { app, BrowserWindow, Menu, session, dialog } = require('electron'); // 🚨 session ve dialog eklendi
const path = require('path');
const fs = require('fs');

// ============================================================================
// FILE LOGGING (debug için)
// ============================================================================
const logFile = path.join(app.getPath('userData'), 'electron-debug.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(logFile, line); } catch(e) {}
  console.log(msg);
}

process.on('uncaughtException', (error) => {
  log(`UNCAUGHT EXCEPTION: ${error.stack || error.message}`);
});
process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${reason}`);
});

log(`App starting... Log file: ${logFile}`);
log(`__dirname: ${__dirname}`);
log(`app.isPackaged: ${app.isPackaged}`);

// ============================================================================
// SSL/CERTIFICATE BYPASS (Mixed Content için gerekli)
// ============================================================================
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('no-sandbox');

log('Command line switches set');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Your live Vercel production URL - Update this with your actual domain
const PRODUCTION_URL = 'https://www.webframeplayer.com';

// Development server URL (Next.js dev server)
const DEV_URL = 'http://localhost:3000';

// ============================================================================
// APPLICATION MENU
// ============================================================================

function createApplicationMenu() {
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },);
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================================================
// MAIN WINDOW
// ============================================================================

function createWindow() {
  let windowShown = false;

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    icon: path.join(__dirname, 'public', 'web-app-manifest-512x512.png'),
    webPreferences: {
      webSecurity: false, // CORS kapalı
      allowRunningInsecureContent: true, // HTTP izinli
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
    title: 'FRAME IPTV Player',
  });

  // 🚨 YENİ EKLENEN 1: User-Agent Hilesi (Bot engelini aşar)
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  win.webContents.setUserAgent(userAgent);

  // 🚨 YENİ EKLENEN 2: CSP (Güvenlik) Başlıklarını Temizle
  // Siyah ekranın %99 çözümü burasıdır. Vercel'in "beni engelle" emrini siler.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src * \'unsafe-inline\' \'unsafe-eval\' data: blob:'], // Her şeye izin ver
        'X-Frame-Options': ['ALLOWALL'] // Frame engelini kaldır
      },
    });
  });

  const showWindowOnce = (source) => {
    if (!windowShown) {
      windowShown = true;
      console.log(`[Electron] Showing window via: ${source}`);
      win.show();
    }
  };

  win.once('ready-to-show', () => {
    showWindowOnce('ready-to-show event');
  });

  setTimeout(() => {
    showWindowOnce('FAILSAFE TIMEOUT (3s)');
  }, 3000);

  // URL yükleme - retry mekanizması ile
  const isPackaged = app.isPackaged;
  const loadUrl = (isPackaged ? PRODUCTION_URL : DEV_URL) + '?electron=1';
  
  console.log(`[Electron] Mode: ${isPackaged ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`[Electron] Loading URL: ${loadUrl}`);

  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  const showRetryPage = (errorMsg) => {
    const retryHTML = `
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;">
        <div style="text-align:center;max-width:400px;">
          <h2 style="color:#ff6b6b;margin-bottom:8px;">Bağlantı Hatası</h2>
          <p style="color:#888;font-size:14px;margin-bottom:24px;">${errorMsg}</p>
          <button onclick="location.href='${loadUrl}'" style="padding:12px 32px;background:linear-gradient(135deg,#667eea,#764ba2);border:none;border-radius:8px;color:#fff;font-size:16px;cursor:pointer;">
            Tekrar Dene
          </button>
        </div>
      </body>
      </html>`;
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(retryHTML));
  };

  const tryLoad = () => {
    win.loadURL(loadUrl).catch((error) => {
      retryCount++;
      console.error(`[Electron] Load attempt ${retryCount}/${MAX_RETRIES} failed: ${error.message}`);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`[Electron] Retrying in ${RETRY_DELAY}ms...`);
        setTimeout(tryLoad, RETRY_DELAY);
      } else {
        console.error(`[Electron] All retries exhausted.`);
        showWindowOnce('all retries failed');
        showRetryPage(error.message);
      }
    });
  };

  tryLoad();

  if (!isPackaged) {
    console.log(`[Electron] Opening DevTools...`);
    win.webContents.openDevTools();
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron] LOAD FAILED: ${errorDescription} (${errorCode})`);
    showWindowOnce('did-fail-load event');
  });

  win.webContents.on('did-finish-load', () => {
    console.log(`[Electron] Page loaded successfully!`);
  });

  // 🚨 Sertifika hatalarını bypass et (HTTP IPTV streamleri için)
  win.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    console.log(`[Electron] Certificate error bypassed for: ${url}`);
    event.preventDefault();
    callback(true); // Sertifika hatasını yoksay
  });
}

log('Waiting for app.whenReady()...');
app.whenReady().then(() => {
  log('App is ready! Creating window...');
  createApplicationMenu();
  createWindow();
  log('Window created successfully');
}).catch((err) => {
  log(`app.whenReady() FAILED: ${err.message}`);
});

app.on('render-process-gone', (event, webContents, details) => {
  log(`RENDER PROCESS GONE: ${JSON.stringify(details)}`);
});

app.on('child-process-gone', (event, details) => {
  log(`CHILD PROCESS GONE: ${JSON.stringify(details)}`);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});