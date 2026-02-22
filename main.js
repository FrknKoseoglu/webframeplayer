const { app, BrowserWindow, Menu, session, dialog } = require('electron'); // 🚨 session ve dialog eklendi
const path = require('path');

// ============================================================================
// SSL/CERTIFICATE BYPASS (Mixed Content için gerekli)
// ============================================================================
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

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
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Electron';
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

  const loadUrl = app.isPackaged ? PRODUCTION_URL : DEV_URL;
  
  console.log(`[Electron] Mode: ${app.isPackaged ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`[Electron] Loading URL: ${loadUrl}`);
  
  win.loadURL(loadUrl).catch((error) => {
    console.error(`[Electron] CRITICAL LOAD ERROR: ${error.message}`);
    // Hata olsa bile pencereyi göster ki kullanıcı hatayı görsün
    showWindowOnce('loadURL catch');
    
    // Basit bir hata dialogu göster (opsiyonel)
    if(app.isPackaged) {
        dialog.showErrorBox('Bağlantı Hatası', `Sunucuya bağlanılamadı.\nURL: ${loadUrl}\nHata: ${error.message}`);
    }
  });

  console.log(`[Electron] Opening DevTools...`);
  win.webContents.openDevTools();

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

app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();
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