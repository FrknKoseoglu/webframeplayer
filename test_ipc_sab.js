const { app, BrowserWindow, ipcMain } = require('electron');
app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  
  const sab = new SharedArrayBuffer(1024);
  ipcMain.handle('get-sab', () => sab);

  win.loadURL('data:text/html,<script>const {ipcRenderer} = require("electron"); ipcRenderer.invoke("get-sab").then(res => console.log(res)).catch(err => require("fs").writeFileSync("sab_err.txt", err.message));</script>');
  
  setTimeout(() => app.quit(), 2000);
});
