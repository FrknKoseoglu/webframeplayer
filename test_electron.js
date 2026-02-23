try {
  require('./build/Release/mpv_renderer.node');
  require('fs').writeFileSync('electron_success.txt', 'Loaded successfully!');
} catch (err) {
  require('fs').writeFileSync('electron_err.txt', err.stack || err.message || String(err));
}
process.exit();
