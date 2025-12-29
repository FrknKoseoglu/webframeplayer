import parser from 'iptv-playlist-parser';
import type { ContentItem, Category } from '@/types/iptv';

interface M3UPlaylistItem {
  name: string;
  tvg: {
    id: string;
    name: string;
    logo: string;
    url: string;
    rec: string;
  };
  group: {
    title: string;
  };
  http: {
    referrer: string;
    'user-agent': string;
  };
  url: string;
  raw: string;
}

interface M3UPlaylist {
  header: {
    attrs: Record<string, string>;
    raw: string;
  };
  items: M3UPlaylistItem[];
}

// Sanitize string to prevent XSS/injection attacks
function sanitizeString(str: string | undefined): string {
  if (!str) return '';
  
  return str
    // Remove any script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (except for images)
    .replace(/data:(?!image\/)/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=/gi, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Trim whitespace
    .trim();
}

// Validate and sanitize URL
function sanitizeUrl(url: string | undefined): string {
  if (!url) return '';
  
  const trimmed = url.trim();
  
  // Only allow http, https, and rtmp protocols for streams
  if (!/^(https?|rtmp|rtsp):\/\//i.test(trimmed)) {
    console.warn('Invalid URL protocol, skipping:', trimmed.substring(0, 50));
    return '';
  }
  
  // Block javascript: and data: URLs
  if (/^(javascript|data):/i.test(trimmed)) {
    console.warn('Blocked potentially malicious URL');
    return '';
  }
  
  return trimmed;
}

// Sanitize logo URL - allow data:image for base64 logos
function sanitizeLogoUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  const trimmed = url.trim();
  
  // Allow data:image for logos
  if (/^data:image\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Otherwise, only allow http/https
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  return undefined;
}

// Fetch and parse M3U playlist
export async function fetchM3UPlaylist(url: string): Promise<M3UPlaylist> {
  // Validate URL before fetching
  const sanitizedUrl = sanitizeUrl(url);
  if (!sanitizedUrl) {
    throw new Error('Invalid playlist URL');
  }

  const response = await fetch(sanitizedUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.status}`);
  }

  const text = await response.text();
  
  // Basic validation that it's an M3U file
  if (!text.trim().startsWith('#EXTM3U')) {
    throw new Error('Invalid M3U playlist format');
  }

  return parser.parse(text) as M3UPlaylist;
}

// Convert M3U playlist to unified ContentItem array
export function convertM3UToContent(playlist: M3UPlaylist): ContentItem[] {
  const result: ContentItem[] = [];
  
  playlist.items.forEach((item, index) => {
    const streamUrl = sanitizeUrl(item.url);
    
    // Skip items with invalid URLs
    if (!streamUrl) {
      return;
    }

    result.push({
      id: `m3u_${index}_${(item.tvg?.id || item.name || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      name: sanitizeString(item.name || item.tvg?.name) || 'Unknown',
      group: sanitizeString(item.group?.title) || 'Uncategorized',
      groupId: (item.group?.title || 'uncategorized').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_'),
      logo: sanitizeLogoUrl(item.tvg?.logo),
      url: streamUrl,
      type: 'live' as const,
    });
  });

  return result;
}

// Extract unique categories from M3U playlist
export function extractCategoriesFromM3U(playlist: M3UPlaylist): Category[] {
  const groupSet = new Set<string>();
  
  playlist.items.forEach((item) => {
    const group = item.group?.title;
    if (group) {
      groupSet.add(group);
    }
  });

  return Array.from(groupSet).map((name) => ({
    id: name.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_'),
    name: sanitizeString(name),
    type: 'live' as const,
  }));
}

// Parse M3U content directly (for file upload)
export function parseM3UContent(content: string): M3UPlaylist {
  // Basic validation
  if (!content.trim().startsWith('#EXTM3U')) {
    throw new Error('Invalid M3U playlist format');
  }
  
  return parser.parse(content) as M3UPlaylist;
}

// Full M3U processing pipeline
export async function processM3UPlaylist(
  urlOrContent: string,
  isContent: boolean = false
): Promise<{ content: ContentItem[]; categories: Category[] }> {
  let playlist: M3UPlaylist;

  if (isContent) {
    playlist = parseM3UContent(urlOrContent);
  } else {
    playlist = await fetchM3UPlaylist(urlOrContent);
  }

  const content = convertM3UToContent(playlist);
  const categories = extractCategoriesFromM3U(playlist);

  return { content, categories };
}
