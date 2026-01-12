/**
 * Codec Detection & Support Utilities for Electron
 * 
 * Detects unsupported codecs and provides helpful user options
 */

// Check if running in Electron
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && 
         window.navigator.userAgent.toLowerCase().includes('electron');
};

// Common unsupported codec patterns in error messages
const HEVC_ERROR_PATTERNS = [
  'hevc',
  'h.265',
  'h265',
  'hvc1',
  'hev1',
  'codec not supported',
  'unsupported codec',
  'media_err_src_not_supported',
];

// File extension hints for unsupported formats
const POTENTIALLY_UNSUPPORTED_EXTENSIONS = ['.mkv', '.hevc', '.265'];

/**
 * Check if a URL might contain HEVC/unsupported content based on extension
 */
export function mightBeUnsupportedFormat(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return POTENTIALLY_UNSUPPORTED_EXTENSIONS.some(ext => lowerUrl.includes(ext));
}

/**
 * Analyze error message to determine if it's a codec issue
 */
export function isCodecError(error: Error | string | any): boolean {
  const errorMessage = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error?.message || error?.toString() || '').toLowerCase();
  
  return HEVC_ERROR_PATTERNS.some(pattern => errorMessage.includes(pattern));
}

/**
 * Check if the current environment might support HEVC
 * Windows 10+ users can install HEVC Video Extensions from Microsoft Store
 */
export function checkHEVCSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    
    // Check for HEVC codec support
    const hevcTypes = [
      'video/mp4; codecs="hvc1"',
      'video/mp4; codecs="hev1"',
      'video/mp4; codecs="hevc"',
    ];
    
    const isSupported = hevcTypes.some(type => 
      video.canPlayType(type) === 'probably' || video.canPlayType(type) === 'maybe'
    );
    
    resolve(isSupported);
  });
}

/**
 * Generate VLC protocol URL for a stream
 */
export function getVLCUrl(streamUrl: string): string {
  // VLC protocol: vlc://url
  return `vlc://${streamUrl}`;
}

/**
 * Generate download instructions text
 */
export function getPlaybackInstructions(streamUrl: string, title?: string): string {
  return `🎬 ${title || 'Stream'}\n\n📺 Stream URL:\n${streamUrl}\n\n` +
    `Oynatma Seçenekleri:\n` +
    `1. VLC Media Player ile açın\n` +
    `2. PotPlayer veya MPC-HC kullanın\n` +
    `3. İndirip lokal olarak izleyin`;
}

/**
 * Common codec-related media error codes
 */
export const MediaErrorCodes = {
  MEDIA_ERR_ABORTED: 1,
  MEDIA_ERR_NETWORK: 2,
  MEDIA_ERR_DECODE: 3,
  MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
} as const;

/**
 * Determine if a media error is likely codec-related
 */
export function isLikelyCodecError(mediaError: MediaError | null): boolean {
  if (!mediaError) return false;
  
  // MEDIA_ERR_DECODE (3) and MEDIA_ERR_SRC_NOT_SUPPORTED (4) often indicate codec issues
  return mediaError.code === MediaErrorCodes.MEDIA_ERR_DECODE || 
         mediaError.code === MediaErrorCodes.MEDIA_ERR_SRC_NOT_SUPPORTED;
}
