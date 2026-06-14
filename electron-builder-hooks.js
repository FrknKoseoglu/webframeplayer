/**
 * Electron Builder - afterPack Hook
 * 
 * This script replaces Electron's default ffmpeg.dll with a version that supports
 * additional audio/video codecs (AC3, EAC3, HEVC, etc.)
 * 
 * Runs after electron-builder packs the application but before code signing.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// FFmpeg builds with proprietary codecs from community sources
// These are builds from the electron-build-tools or similar that include AC3/EAC3
const FFMPEG_SOURCES = {
  // From electron releases - check for latest version matching your Electron version
  win32: {
    url: 'https://github.com/nicksay/electron-media-codecs/releases/download/v1.0.0/ffmpeg-win32-x64.zip',
    fallbackUrl: null,
  }
};

/**
 * Download a file from URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading from: ${url}`);
    
    const file = fs.createWriteStream(destPath);
    
    const request = https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000 
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    
    request.on('error', (err) => {
      file.close();
      fs.unlinkSync(destPath);
      reject(err);
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Download timed out'));
    });
  });
}

/**
 * Extract ZIP file using PowerShell (Windows)
 */
function extractZip(zipPath, destDir) {
  console.log(`📦 Extracting: ${zipPath}`);
  
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, {
      stdio: 'inherit'
    });
  } else {
    execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'inherit' });
  }
}

/**
 * Get the path to ffmpeg library in packed Electron app
 */
function getFFmpegPath(appOutDir) {
  if (process.platform === 'win32') {
    return path.join(appOutDir, 'ffmpeg.dll');
  } else if (process.platform === 'darwin') {
    return path.join(
      appOutDir, 
      'Electron Framework.framework', 
      'Versions', 'A', 'Libraries', 
      'libffmpeg.dylib'
    );
  } else {
    return path.join(appOutDir, 'libffmpeg.so');
  }
}

/**
 * Check if custom ffmpeg is already in project
 */
function findLocalFFmpeg(projectRoot) {
  const localPaths = [
    path.join(projectRoot, 'resources', 'ffmpeg', 'ffmpeg.dll'),
    path.join(projectRoot, 'build-resources', 'ffmpeg.dll'),
    path.join(projectRoot, 'ffmpeg', 'ffmpeg.dll'),
  ];
  
  for (const localPath of localPaths) {
    if (fs.existsSync(localPath)) {
      return localPath;
    }
  }
  return null;
}

/**
 * Main afterPack hook
 */
exports.default = async function afterPack(context) {
  console.log('\n🎬 FFmpeg Codec Replacement Hook');
  console.log('================================');
  
  const { appOutDir, packager } = context;
  const platform = packager.platform.name;
  
  // Only process Windows for now
  if (platform !== 'windows') {
    console.log(`⏭️  Skipping FFmpeg replacement for ${platform} (not implemented)`);
    return;
  }
  
  const ffmpegDestPath = getFFmpegPath(appOutDir);
  const projectRoot = packager.projectDir;
  
  console.log(`📁 App Output Dir: ${appOutDir}`);
  console.log(`🎯 FFmpeg Target: ${ffmpegDestPath}`);
  
  // First, check for local ffmpeg.dll
  const localFFmpeg = findLocalFFmpeg(projectRoot);
  
  if (localFFmpeg) {
    console.log(`✅ Found local FFmpeg: ${localFFmpeg}`);
    
    // Backup original
    const backupPath = ffmpegDestPath + '.original';
    if (fs.existsSync(ffmpegDestPath) && !fs.existsSync(backupPath)) {
      fs.copyFileSync(ffmpegDestPath, backupPath);
      console.log(`💾 Backed up original to: ${backupPath}`);
    }
    
    // Replace with custom
    fs.copyFileSync(localFFmpeg, ffmpegDestPath);
    console.log(`✅ Replaced FFmpeg with custom build!`);
    return;
  }
  
  // If no local ffmpeg, try to download (this often fails due to availability)
  console.log('⚠️  No local FFmpeg found in resources/ffmpeg/ffmpeg.dll');
  console.log('');
  console.log('📋 To enable AC3/EAC3/HEVC codec support:');
  console.log('   1. Download a custom ffmpeg.dll with codec support');
  console.log('   2. Place it in: resources/ffmpeg/ffmpeg.dll');
  console.log('   3. Run electron-build again');
  console.log('');
  console.log('💡 You can get ffmpeg.dll from:');
  console.log('   - https://github.com/nicksay/electron-media-codecs/releases');
  console.log('   - Build your own: https://github.com/nicksay/electron-media-codecs');
  console.log('');
  
  // Continue without replacing - app will still work, just without extra codecs
  console.log('⏭️  Continuing with default FFmpeg (some codecs may not work)');
};
