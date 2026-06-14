const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const dirs = ['src', 'design'];
let allFiles = [];
dirs.forEach(d => {
    if (fs.existsSync(d)) {
        allFiles = allFiles.concat(walkSync(d));
    }
});
allFiles.push('main.js');
allFiles.push('package.json');

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.json'];
allFiles = allFiles.filter(f => extensions.some(ext => f.endsWith(ext)));

let changesCount = 0;

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // "Magic Link" -> "Magic Code"
    content = content.replace(/Magic Link/g, 'Magic Code');
    content = content.replace(/magic link/g, 'magic code');
    content = content.replace(/Sihirli Bağlantı/g, 'Sihirli Kod');
    
    // Route paths
    content = content.replace(/magic-link/g, 'magic-code');

    // "Müşteri" -> "Kullanıcı"
    content = content.replace(/Müşteri/g, 'Kullanıcı');
    content = content.replace(/müşteri/g, 'kullanıcı');

    // "satış" -> "içerik sağlama"
    content = content.replace(/Kanal satışı/g, 'Kanal veya içerik sağlama');
    
    // "Hizmet Sağlayıcı" -> "Yönetici"
    content = content.replace(/Hizmet Sağlayıcı/g, 'Yönetici');
    content = content.replace(/hizmet sağlayıcı/g, 'yönetici');

    // IPTV -> Media/FRAME
    content = content.replace(/IPTV Player/g, 'FRAME Player');
    content = content.replace(/IPTV/g, 'Yayın');
    
    // Specifically fix css variables back
    content = content.replace(/--Yayın-/g, '--frame-');
    content = content.replace(/--iptv-/g, '--frame-');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changesCount++;
        console.log('Updated:', file);
    }
});

console.log(`Done. Updated ${changesCount} files.`);
