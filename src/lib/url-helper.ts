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
    // Check if it looks like IP:port or localhost:port or hostname:port
    const hostPortPattern = /^([\w.-]+)(:\d+)?$/;
    if (hostPortPattern.test(trimmed)) {
      return true; // Valid hostname/IP format
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
  
  // Add http:// for hostnames/IPs
  return `http://${trimmed}`;
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
 * 
 * Logic:
 * 1. If custom proxy is enabled and valid → use custom proxy
 * 2. Otherwise → return direct URL (no auto-proxy)
 * 
 * @param targetUrl - The original stream URL to proxy
 * @returns Proxied URL if custom proxy enabled, or direct URL
 */
export function getStreamUrl(targetUrl: string): string {
  const { enableCustomProxy, customProxyUrl } = usePlayerStore.getState();
  
  // Only use proxy if custom proxy is explicitly enabled and valid
  if (enableCustomProxy && customProxyUrl && validateProxyUrl(customProxyUrl)) {
    const normalizedProxyUrl = normalizeProxyUrl(customProxyUrl);
    return `${normalizedProxyUrl}${encodeURIComponent(targetUrl)}`;
  }
  
  // No proxy - return direct URL
  return targetUrl;
}

/**
 * Test proxy connection by attempting to fetch a simple resource
 * Uses GET request (more compatible than HEAD with free proxies)
 * 
 * @param proxyUrl - The proxy URL to test
 * @returns Promise<boolean> - true if connection successful
 */
export async function testProxyConnection(proxyUrl: string): Promise<boolean> {
  if (!validateProxyUrl(proxyUrl)) {
    console.warn('Invalid proxy URL format');
    return false;
  }
  
  try {
    // Test with a simple public resource that returns quickly
    // Using httpbin which is designed for testing
    const testUrl = 'https://httpbin.org/get?test=1';
    const normalizedProxyUrl = normalizeProxyUrl(proxyUrl);
    const proxiedUrl = `${normalizedProxyUrl}${encodeURIComponent(testUrl)}`;
    
    console.log('Testing proxy connection:', proxiedUrl);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      // Use GET instead of HEAD - many proxies don't support HEAD
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache',
        // Don't follow redirects - we just want to know if proxy responds
        redirect: 'follow',
      });
      
      clearTimeout(timeoutId);
      
      console.log('Proxy test response:', response.status, response.ok);
      
      // Check if response is successful (2xx or 3xx)
      return response.ok || (response.status >= 300 && response.status < 400);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Check if it's a timeout
      if (fetchError.name === 'AbortError') {
        console.warn('Proxy test timed out');
        return false;
      }
      
      // CORS error - the proxy itself might be blocking
      // This is a common issue with free proxies
      console.warn('Proxy test failed:', fetchError.message);
      return false;
    }
  } catch (error: any) {
    console.error('Proxy test failed:', error);
    return false;
  }
}
