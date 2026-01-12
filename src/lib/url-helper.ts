/**
 * URL Helper for Stream URLs
 * Simplified for Direct URL mode (Desktop App First strategy)
 */

/**
 * Get stream URL - returns direct URL without any proxy
 * Desktop app handles CORS. Web users are warned about limitations.
 *
 * @param targetUrl - The original stream URL
 * @returns Direct URL
 */
export function getStreamUrl(targetUrl: string): string {
  return targetUrl;
}
