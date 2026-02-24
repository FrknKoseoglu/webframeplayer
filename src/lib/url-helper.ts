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

/**
 * Generate a magic link for a given profile to be imported onto the desktop app
 */
export function generateMagicLink(profile: any): string {
  if (typeof window === 'undefined') return '';
  const baseUrl = window.location.origin;

  const payload: Record<string, any> = {
    serviceName: encodeURIComponent(profile.name),
  };

  if (profile.type === 'm3u' && profile.m3uUrl) {
    payload.importUrl = profile.m3uUrl;
  } else if (profile.type === 'xtream' && profile.credentials) {
    payload.importXtream = true;
    payload.host = profile.credentials.url;
    payload.user = profile.credentials.username;
    payload.password = profile.credentials.password;
  } else {
    return baseUrl;
  }

  if (profile.supportUrl) payload.supportUrl = profile.supportUrl;
  if (profile.logoUrl) payload.logoUrl = profile.logoUrl;
  if (profile.adFree) payload.xrkad = '1';

  try {
    const jsonString = JSON.stringify(payload);
    const encoded = btoa(jsonString);
    return `${baseUrl}/?d=${encoded}`;
  } catch (err) {
    console.error('Failed to generate magic link', err);
    return baseUrl;
  }
}

