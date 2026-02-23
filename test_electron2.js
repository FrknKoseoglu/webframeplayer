try {
  const { MpvRenderer } = require('./build/Release/mpv_renderer.node');
  const mpv = new MpvRenderer();
  mpv.initialize();
  require('fs').writeFileSync('electron_success.txt', 'Initialized successfully!');
} catch (err) {
  require('fs').writeFileSync('electron_err.txt', err.stack || err.message || String(err));
}
process.exit();
