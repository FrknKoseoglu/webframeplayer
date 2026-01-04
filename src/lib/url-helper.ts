import { usePlayerStore } from '@/store/usePlayerStore';

/**
 * Validates and normalizes proxy URL
 * Supports:
 * - http://example.com or https://example.com
 * - http://192.168.1.1:8080
 * - 192.168.1.1:8080 (will auto-add http://)
 * - localhost:8080
 */
export function validateProxyUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;
  
  let trimmed = url.trim();
  
  // If doesn't start with http:// or https://, check if it's an IP:port or localhost:port
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    // Check if it looks like IP:port or localhost:port
    const ipPortPattern = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost)(:\d+)?$/;
    if (ipPortPattern.test(trimmed)) {
      return true; // Valid IP or localhost format
    }
    return false; // Invalid format
  }
  
  // Already has http:// or https://, it's valid
  return true;
}

/**
 * Ensures URL has http:// or https:// prefix
 */
function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  
  // Already has protocol
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Check if it's IP or localhost, add http://
  const ipPortPattern = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost)(:\d+)?$/;
  if (ipPortPattern.test(trimmed)) {
    return `http://${trimmed}`;
  }
  
  return trimmed;
}

/**
 * Smart URL normalization for custom proxy
 * Automatically adds /?url= query parameter if needed
 */
function normalizeProxyUrl(customProxyUrl: string): string {
  let normalized = ensureProtocol(customProxyUrl.trim());
  
  // Remove trailing slash
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  // Check if URL already has query params
  const hasQueryParams = normalized.includes('?');
  
  // Append appropriate query parameter
  if (!hasQueryParams) {
    normalized += '/?url=';
  } else if (!normalized.includes('url=')) {
    normalized += '&url=';
  }
  
  return normalized;
}

/**
 * Get stream URL with proxy based on user settings
 * @param targetUrl - The original stream URL to proxy
 * @returns Proxied URL if enabled, or direct URL if disabled
 */
export function getStreamUrl(targetUrl: string): string {
  const { enableCustomProxy, customProxyUrl } = usePlayerStore.getState();
  
  // If proxy is disabled, return direct URL (no proxy at all)
  if (!enableCustomProxy || !customProxyUrl || !validateProxyUrl(customProxyUrl)) {
    return targetUrl;
  }
  
  // Use custom proxy with smart normalization
  const normalizedProxyUrl = normalizeProxyUrl(customProxyUrl);
  return `${normalizedProxyUrl}${encodeURIComponent(targetUrl)}`;
}

/**
 * Test proxy connection by attempting to fetch a simple resource
 * @param proxyUrl - The proxy URL to test
 * @returns Promise<boolean> - true if connection successful
 */
export async function testProxyConnection(proxyUrl: string): Promise<boolean> {
  if (!validateProxyUrl(proxyUrl)) {
    console.warn('Invalid proxy URL format');
    return false;
  }
  
  try {
    // Test with a simple public resource (Google favicon)
    const testUrl = 'https://www.google.com/favicon.ico';
    const normalizedProxyUrl = normalizeProxyUrl(proxyUrl);
    const proxiedUrl = `${normalizedProxyUrl}${encodeURIComponent(testUrl)}`;
    
    console.log('Testing proxy connection:', proxiedUrl);
    
    // Create AbortController for timeout (more compatible than AbortSignal.timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(proxiedUrl, {
        method: 'HEAD', // HEAD request is faster
        signal: controller.signal,
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      
      console.log('Proxy test response:', response.status, response.ok);
      return response.ok;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Check if it's a timeout
      if (fetchError.name === 'AbortError') {
        console.warn('Proxy test timed out');
        return false;
      }
      
      // Check if it's a network/CORS error
      if (fetchError.message?.includes('fetch')) {
        console.warn('Proxy test failed - network/CORS error:', fetchError.message);
        return false;
      }
      
      throw fetchError; // Re-throw if it's something else
    }
  } catch (error: any) {
    console.error('Proxy test failed:', error);
    return false;
  }
}
