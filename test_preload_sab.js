const { contextBridge } = require('electron');
const fs = require('fs');
const sab = new SharedArrayBuffer(1024);
try {
  contextBridge.exposeInMainWorld('api', {
    getSAB: () => sab
  });
  fs.writeFileSync('sab_bridge.txt', 'Exposed successfully!');
} catch(e) {
  fs.writeFileSync('sab_bridge_err.txt', e.message);
}
