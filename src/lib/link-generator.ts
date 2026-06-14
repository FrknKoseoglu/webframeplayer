/**
 * Magic Code Generator — Serverless, client-side only
 * 
 * Compresses link data using lz-string for short URLs.
 * All data lives in the URL hash, no database needed.
 */

import LZString from 'lz-string';

// ─── Minified Key Mapping ───────────────────────────────────────
// Full key → Short key (saves bytes in compressed URL)
const KEY_MAP = {
  m3uUrl: 'u',
  xtreamHost: 'h',
  xtreamUser: 'n',
  xtreamPassword: 'p',
  serviceName: 's',
  message: 'm',
  logoUrl: 'l',
  supportUrl: 't',
  expireDate: 'e',
  adFree: 'x',
} as const;

// Reverse mapping: Short key → Full key
const REVERSE_KEY_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([full, short]) => [short, full])
) as Record<string, string>;

// ─── Types ──────────────────────────────────────────────────────

export interface MagicLinkData {
  // Connection (one of these groups is required)
  m3uUrl?: string;
  xtreamHost?: string;
  xtreamUser?: string;
  xtreamPassword?: string;
  // Branding (optional)
  serviceName?: string;
  message?: string;
  logoUrl?: string;
  supportUrl?: string;
  // Settings
  expireDate?: number; // Unix timestamp (seconds)
  adFree?: boolean;
}

// ─── Compress ───────────────────────────────────────────────────

/**
 * Compress link data into a URL-safe hash string.
 * Uses extreme minification (short keys) + lz-string compression.
 */
export function compressLinkData(data: MagicLinkData): string {
  // Build minified object (only include truthy values)
  const mini: Record<string, string | number> = {};

  if (data.m3uUrl) mini[KEY_MAP.m3uUrl] = data.m3uUrl;
  if (data.xtreamHost) mini[KEY_MAP.xtreamHost] = data.xtreamHost;
  if (data.xtreamUser) mini[KEY_MAP.xtreamUser] = data.xtreamUser;
  if (data.xtreamPassword) mini[KEY_MAP.xtreamPassword] = data.xtreamPassword;
  if (data.serviceName) mini[KEY_MAP.serviceName] = data.serviceName;
  if (data.message) mini[KEY_MAP.message] = data.message;
  if (data.logoUrl) mini[KEY_MAP.logoUrl] = data.logoUrl;
  if (data.supportUrl) mini[KEY_MAP.supportUrl] = data.supportUrl;
  if (data.expireDate) mini[KEY_MAP.expireDate] = data.expireDate;
  if (data.adFree) mini[KEY_MAP.adFree] = 1;

  const json = JSON.stringify(mini);
  return LZString.compressToEncodedURIComponent(json);
}

// ─── Decompress ─────────────────────────────────────────────────

/**
 * Decompress a hash string back into full link data.
 * Returns null if decompression/parsing fails.
 */
export function decompressLinkData(hash: string): MagicLinkData | null {
  try {
    // Try lz-string first
    const json = LZString.decompressFromEncodedURIComponent(hash);
    if (json) {
      const mini = JSON.parse(json) as Record<string, string | number>;
      return expandKeys(mini);
    }

    // Fallback: try legacy Base64 (atob) for backward compatibility
    const decoded = atob(hash);
    const legacy = JSON.parse(decoded) as Record<string, string>;
    return mapLegacyKeys(legacy);
  } catch {
    return null;
  }
}

/**
 * Expand minified keys back to full keys.
 */
function expandKeys(mini: Record<string, string | number>): MagicLinkData {
  const data: MagicLinkData = {};

  for (const [shortKey, value] of Object.entries(mini)) {
    const fullKey = REVERSE_KEY_MAP[shortKey];
    if (!fullKey) continue;

    switch (fullKey) {
      case 'expireDate':
        data.expireDate = Number(value);
        break;
      case 'adFree':
        data.adFree = value === 1 || value === '1';
        break;
      default:
        (data as Record<string, unknown>)[fullKey] = String(value);
    }
  }

  return data;
}

/**
 * Map legacy Base64-encoded keys (from old /m/ magic codes) to new format.
 * Supports both old plain URL param names and new minified keys.
 */
function mapLegacyKeys(obj: Record<string, string>): MagicLinkData {
  const data: MagicLinkData = {};

  // Legacy key mapping (old format → new)
  if (obj.importUrl) data.m3uUrl = obj.importUrl;
  if (obj.host) data.xtreamHost = obj.host;
  if (obj.user) data.xtreamUser = obj.user;
  if (obj.password) data.xtreamPassword = obj.password;
  if (obj.serviceName) data.serviceName = obj.serviceName;
  if (obj.supportUrl) data.supportUrl = obj.supportUrl;
  if (obj.logoUrl) data.logoUrl = obj.logoUrl;
  if (obj.xrkad === '1') data.adFree = true;

  // Decode Base64 message if present
  if (obj.message) {
    try {
      data.message = decodeURIComponent(escape(atob(obj.message)));
    } catch {
      data.message = obj.message;
    }
  }

  return data;
}

// ─── URL Builder ────────────────────────────────────────────────

/**
 * Build a full magic code URL from data.
 * Uses window.location.origin as the base URL.
 */
export function buildMagicUrl(data: MagicLinkData): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const hash = compressLinkData(data);
  return `${baseUrl}/?d=${hash}`;
}

// ─── Expiry Check ───────────────────────────────────────────────

/**
 * Check if link data has expired.
 */
export function isLinkExpired(data: MagicLinkData): boolean {
  if (!data.expireDate) return false;
  return Date.now() / 1000 > data.expireDate;
}
