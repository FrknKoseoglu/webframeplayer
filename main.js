const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Your live Vercel production URL - Update this with your actual domain
const PRODUCTION_URL = 'https://webframeplayer.com';

// Development server URL (Next.js dev server)
const DEV_URL = 'http://localhost:3000';

// Check if we're running in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// ============================================================================
// APPLICATION MENU (Essential for keyboard shortcuts in wrapper mode)
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

  // macOS-specific menu adjustments
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
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================================================
// MAIN WINDOW
// ============================================================================

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    // App icon - uses 512x512 PNG for best quality
    icon: path.join(__dirname, 'public', 'web-app-manifest-512x512.png'),
    webPreferences: {
      // CRITICAL: Disable web security to bypass CORS restrictions for IPTV streams
      webSecurity: false,
      // Allow HTTP IPTV streams inside HTTPS Vercel wrapper
      allowRunningInsecureContent: true,
      // Security best practices for remote content wrappers
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Don't show until ready to prevent visual flash
    show: false,
    // Match app background color for smooth startup
    backgroundColor: '#0a0a0a',
    // Hide menu bar by default (still accessible via Alt key on Windows/Linux)
    autoHideMenuBar: true,
    title: 'FRAME IPTV Player',
  });

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Load URL based on environment
  const loadUrl = isDev ? DEV_URL : PRODUCTION_URL;
  
  console.log(`[Electron] Mode: ${isDev ? 'Development' : 'Production'}`);
  console.log(`[Electron] Loading URL: ${loadUrl}`);
  
  win.loadURL(loadUrl);

  // Open DevTools in development mode
  if (isDev) {
    win.webContents.openDevTools();
  }

  // Handle external links - open in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle navigation errors (e.g., when Vercel is down)
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`[Electron] Failed to load: ${errorDescription} (${errorCode})`);
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Recreate window when dock icon is clicked (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
