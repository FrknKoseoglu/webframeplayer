const { app, BrowserWindow } = require('electron');
const path = require('path');
app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: { preload: path.join(__dirname, 'test_preload_sab.js') }
  });
  win.loadURL('data:text/html,<script>window.api.getSAB()</script>');
  setTimeout(() => app.quit(), 2000);
});
