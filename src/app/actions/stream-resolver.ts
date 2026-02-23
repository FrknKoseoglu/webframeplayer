'use server';

/**
 * Stream Resolver - Server Action
 * 
 * Handles IPTV stream URL resolution:
 * 1. Follows 301/302 redirects to get the real stream URL
 * 2. Uses VLC User-Agent to bypass provider restrictions
 * 3. Resolves load balancer endpoints to direct stream URLs
 */

export interface ResolveResult {
  success: boolean;
  url: string;
  originalUrl: string;
  wasRedirected: boolean;
  error?: string;
}

/**
 * Resolves an IPTV stream URL by following redirects server-side
 * 
 * @param url - The original stream URL (may be a redirect/API endpoint)
 * @returns ResolveResult with the final resolved URL
 * 
 * @example
 * Input: http://server.com:8080/get.php?username=user&password=pass&stream_id=5
 * Server Response: 302 Found -> Location: http://cdn.server.com/hls/token123/index.m3u8
 * Output: { success: true, url: "http://cdn.server.com/hls/token123/index.m3u8", wasRedirected: true }
 */
export async function resolveStreamUrl(url: string): Promise<ResolveResult> {
  const originalUrl = url;
  
  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      return {
        success: false,
        url: originalUrl,
        originalUrl,
        wasRedirected: false,
        error: 'Invalid URL provided',
      };
    }

    console.log('[StreamResolver] Resolving:', url);

    // Use HEAD to avoid downloading large VOD files (movies can be several GB)
    // HEAD returns headers (status, Content-Type, Location) without body
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*',
      },
      redirect: 'manual', // Don't auto-follow redirects
      signal: AbortSignal.timeout(10000),
    });

    console.log('[StreamResolver] Response status:', response.status);

    // Handle 301/302/303/307/308 redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('Location');
      
      if (location) {
        // Handle relative URLs
        let resolvedUrl = location;
        if (location.startsWith('/')) {
          const urlObj = new URL(url);
          resolvedUrl = `${urlObj.protocol}//${urlObj.host}${location}`;
        }
        
        console.log('[StreamResolver] Redirect found:', resolvedUrl);
        
        return {
          success: true,
          url: resolvedUrl,
          originalUrl,
          wasRedirected: true,
        };
      } else {
        console.warn('[StreamResolver] Redirect without Location header');
        return {
          success: true,
          url: originalUrl,
          originalUrl,
          wasRedirected: false,
        };
      }
    }

    // 200 OK - URL is likely the direct stream
    if (response.status === 200) {
      console.log('[StreamResolver] Direct stream URL (200):', url);
      return {
        success: true,
        url: originalUrl,
        originalUrl,
        wasRedirected: false,
      };
    }

    // Other status codes (4xx, 5xx)
    console.warn('[StreamResolver] Unexpected status:', response.status);
    return {
      success: false,
      url: originalUrl,
      originalUrl,
      wasRedirected: false,
      error: `Server returned ${response.status}`,
    };

  } catch (error: any) {
    console.error('[StreamResolver] Error:', error.message);
    
    // On error, return original URL so playback can still be attempted
    return {
      success: false,
      url: originalUrl,
      originalUrl,
      wasRedirected: false,
      error: error.message || 'Failed to resolve stream URL',
    };
  }
}

/**
 * Batch resolve multiple stream URLs
 * Useful for pre-resolving URLs for EPG or playlists
 */
export async function resolveMultipleUrls(urls: string[]): Promise<ResolveResult[]> {
  return Promise.all(urls.map(url => resolveStreamUrl(url)));
}
