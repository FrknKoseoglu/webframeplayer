import type {
  XtreamAuthResponse,
  XtreamCategory,
  XtreamLiveStream,
  XtreamVodStream,
  XtreamSeries,
  ContentItem,
  Category,
  XtreamCredentials,
  XtreamEpgListing,
  XtreamShortEpgResponse,
  EpgProgram,
  XtreamSeriesInfo,
  Season,
  Episode,
} from '@/types/player';

// Helper to safely decode Base64 strings (utf-8 support)
function decodeBase64(str: string): string {
  try {
    if (!str) return '';
    // Check if it looks like base64 to avoid erroring on plain text
    // (Simple regex or just try/catch strategy)
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    // Return original string if decoding fails (not base64 or other error)
    return str;
  }
}

interface XmltvProgramme {
  start: string;
  stop: string;
  channel: string;
  title: string | { '#text': string };
  desc: string | { '#text': string };
}

interface XmltvResponse {
  tv: {
    programme: XmltvProgramme[];
  };
}

const API_BASE = '/api/xtream';

// Helper to make API calls through proxy
async function xtreamFetch<T>(
  credentials: XtreamCredentials,
  action?: string,
  params?: Record<string, string | number>
): Promise<T> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: credentials.url,
      username: credentials.username,
      password: credentials.password,
      action,
      ...params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

// Authenticate with Xtream server
export async function authenticateXtream(
  credentials: XtreamCredentials
): Promise<XtreamAuthResponse> {
  return xtreamFetch<XtreamAuthResponse>(credentials);
}

// Get categories
export async function getLiveCategories(
  credentials: XtreamCredentials
): Promise<XtreamCategory[]> {
  return xtreamFetch<XtreamCategory[]>(credentials, 'get_live_categories');
}

export async function getVodCategories(
  credentials: XtreamCredentials
): Promise<XtreamCategory[]> {
  return xtreamFetch<XtreamCategory[]>(credentials, 'get_vod_categories');
}

export async function getSeriesCategories(
  credentials: XtreamCredentials
): Promise<XtreamCategory[]> {
  return xtreamFetch<XtreamCategory[]>(credentials, 'get_series_categories');
}

// Get streams
export async function getLiveStreams(
  credentials: XtreamCredentials,
  categoryId?: string
): Promise<XtreamLiveStream[]> {
  return xtreamFetch<XtreamLiveStream[]>(
    credentials,
    'get_live_streams',
    categoryId ? { category_id: categoryId } : undefined
  );
}

export async function getVodStreams(
  credentials: XtreamCredentials,
  categoryId?: string
): Promise<XtreamVodStream[]> {
  return xtreamFetch<XtreamVodStream[]>(
    credentials,
    'get_vod_streams',
    categoryId ? { category_id: categoryId } : undefined
  );
}

export async function getSeries(
  credentials: XtreamCredentials,
  categoryId?: string
): Promise<XtreamSeries[]> {
  return xtreamFetch<XtreamSeries[]>(
    credentials,
    'get_series',
    categoryId ? { category_id: categoryId } : undefined
  );
}

export async function getSeriesInfo(
  credentials: XtreamCredentials,
  seriesId: string
): Promise<Season[]> {
  const response = await xtreamFetch<XtreamSeriesInfo>(
    credentials,
    'get_series_info',
    { series_id: seriesId }
  );

  if (!response?.episodes) return [];

  const seasons: Season[] = [];

  // Sort season numbers
  const seasonNums = Object.keys(response.episodes).sort((a, b) => Number(a) - Number(b));

  seasonNums.forEach((sNum) => {
    const xtreamEpisodes = response.episodes[sNum];
    const episodes: Episode[] = xtreamEpisodes.map((ep) => ({
      id: String(ep.id),
      title: ep.title,
      episodeNum: ep.episode_num,
      seasonNum: Number(sNum),
      plot: ep.info?.plot,
      duration: ep.info?.duration,
      image: ep.info?.movie_image,
      url: buildStreamUrl(credentials, Number(ep.id), 'series', ep.container_extension || 'mp4'),
      downloadUrl: buildStreamUrl(credentials, Number(ep.id), 'series', ep.container_extension || 'mp4'),
    }));

    const seasonInfo = response.seasons.find(s => s.season_number === Number(sNum));

    seasons.push({
      name: seasonInfo?.name || `Sezon ${sNum}`,
      number: Number(sNum),
      episodes,
    });
  });

  return seasons;
}

// Get EPG (Electronic Program Guide)
export async function getShortEPG(
  credentials: XtreamCredentials,
  streamId: number,
  limit: number = 4
): Promise<XtreamEpgListing[]> {
  try {
    const response = await xtreamFetch<XtreamShortEpgResponse>(
      credentials,
      'get_short_epg',
      { stream_id: streamId, limit }
    );
    return response?.epg_listings || [];
  } catch {
    return [];
  }
}

// Fetch Full EPG via XMLTV
export async function fetchFullEpg(
  credentials: XtreamCredentials
): Promise<Record<string, EpgProgram[]>> {
  try {
    // Call proxy with xmltv endpoint
    const response = await xtreamFetch<XmltvResponse>(
      credentials,
      'xmltv' as any, // Cast to any to bypass strict type check for now
      { endpoint: 'xmltv' }
    );

    const programs: Record<string, EpgProgram[]> = {};
    const xmlProgrammes = response?.tv?.programme || [];
    
    // Normalize array (fast-xml-parser might return single object if only 1 item)
    const list = Array.isArray(xmlProgrammes) ? xmlProgrammes : [xmlProgrammes];

    list.forEach((p) => {
      // Parse dates (YYYYMMDDhhmmss +0000)
      // Example: 20240424130000 +0300
      const parseXmlDate = (dateStr: string) => {
        if (!dateStr || dateStr.length < 14) return { date: new Date(), ts: 0 };
        const y = parseInt(dateStr.substring(0, 4));
        const m = parseInt(dateStr.substring(4, 6)) - 1;
        const d = parseInt(dateStr.substring(6, 8));
        const h = parseInt(dateStr.substring(8, 10));
        const min = parseInt(dateStr.substring(10, 12));
        const s = parseInt(dateStr.substring(12, 14));
        const date = new Date(Date.UTC(y, m, d, h, min, s));
        // Adjust for timezone if needed, usually XMLTV dates are reliable enough or we treat as local/UTC matching
        return { date, ts: Math.floor(date.getTime() / 1000) };
      };

      const start = parseXmlDate(p.start);
      const end = parseXmlDate(p.stop);
      
      const channelId = `live_${p.channel}_0`; // Assuming channel ID maps to stream_id, utilizing our ID format
      // Note: p.channel might be just '12345'
      
      // Need to handle both simple ID and our prefixed ID
      // If we don't know the mapping, we might store simply by '12345' and lookup accordingly
      const rawId = p.channel;

      const program: EpgProgram = {
        id: `${rawId}_${start.ts}`,
        title: decodeBase64(typeof p.title === 'object' ? p.title['#text'] : p.title),
        description: decodeBase64(typeof p.desc === 'object' ? p.desc?.['#text'] || '' : p.desc || ''),
        start: start.date,
        end: end.date,
        startTimestamp: start.ts,
        endTimestamp: end.ts,
        channelId: rawId,
        lang: '',
      };

      if (!programs[channelId]) programs[channelId] = [];
      programs[channelId].push(program);
    });

    return programs;
  } catch (e) {
    console.error('Full EPG fetch failed', e);
    return {};
  }
}

// Convert EPG listing to unified EpgProgram
export function convertEpgListings(listings: XtreamEpgListing[]): EpgProgram[] {
  return listings.map((item) => ({
    id: item.epg_id,
    title: decodeBase64(item.title),
    description: decodeBase64(item.description || ''),
    start: new Date(parseInt(item.start_timestamp) * 1000),
    end: new Date(parseInt(item.stop_timestamp) * 1000),
    startTimestamp: parseInt(item.start_timestamp),
    endTimestamp: parseInt(item.stop_timestamp),
    channelId: item.channel_id,
    lang: item.lang,
  }));
}

// Build stream URL
export function buildStreamUrl(
  credentials: XtreamCredentials,
  streamId: number,
  type: 'live' | 'movie' | 'series',
  extension: string = 'm3u8'
): string {
  const baseUrl = credentials.url.replace(/\/+$/, '');
  const { username, password } = credentials;

  if (type === 'live') {
    return `${baseUrl}/live/${username}/${password}/${streamId}.${extension}`;
  } else if (type === 'movie') {
    return `${baseUrl}/movie/${username}/${password}/${streamId}.${extension}`;
  } else {
    return `${baseUrl}/series/${username}/${password}/${streamId}.${extension}`;
  }
}

// Convert Xtream categories to unified Category type
export function convertCategories(
  categories: XtreamCategory[],
  type: 'live' | 'movie' | 'series'
): Category[] {
  return categories.map((cat) => ({
    id: cat.category_id,
    name: cat.category_name,
    type,
  }));
}

// Convert Xtream live streams to ContentItem
export function convertLiveStreams(
  streams: XtreamLiveStream[],
  credentials: XtreamCredentials,
  categories: XtreamCategory[]
): ContentItem[] {
  const categoryMap = new Map(categories.map((c) => [c.category_id, c.category_name]));
  const seenIds = new Set<number>();

  return streams
    .filter((stream) => {
      // Filter out duplicates
      if (seenIds.has(stream.stream_id)) {
        return false;
      }
      seenIds.add(stream.stream_id);
      return true;
    })
    .map((stream, index) => ({
      id: `live_${stream.stream_id}_${index}`,
      name: stream.name,
      group: categoryMap.get(stream.category_id) || 'Uncategorized',
      groupId: stream.category_id,
      logo: stream.stream_icon || undefined,
      url: buildStreamUrl(credentials, stream.stream_id, 'live'),
      type: 'live' as const,
    }));
}

// Convert Xtream VOD streams to ContentItem
export function convertVodStreams(
  streams: XtreamVodStream[],
  credentials: XtreamCredentials,
  categories: XtreamCategory[]
): ContentItem[] {
  const categoryMap = new Map(categories.map((c) => [c.category_id, c.category_name]));

  return streams.map((stream, index) => ({
    id: `movie_${stream.stream_id}_${index}`,
    name: stream.name,
    group: categoryMap.get(stream.category_id) || 'Uncategorized',
    groupId: stream.category_id,
    logo: stream.stream_icon || undefined,
    url: buildStreamUrl(credentials, stream.stream_id, 'movie', stream.container_extension || 'mp4'),
    downloadUrl: buildStreamUrl(credentials, stream.stream_id, 'movie', stream.container_extension || 'mp4'),
    type: 'movie' as const,
    rating: stream.rating_5based,
  }));
}

// Convert Xtream series to ContentItem
export function convertSeries(
  series: XtreamSeries[],
  credentials: XtreamCredentials,
  categories: XtreamCategory[]
): ContentItem[] {
  const categoryMap = new Map(categories.map((c) => [c.category_id, c.category_name]));

  return series.map((s, index) => ({
    id: `series_${s.series_id}_${index}`,
    name: s.name,
    group: categoryMap.get(s.category_id) || 'Uncategorized',
    groupId: s.category_id,
    logo: s.cover || undefined,
    url: '', // Series need episode selection
    type: 'series' as const,
    rating: s.rating_5based,
    plot: s.plot,
    seriesId: String(s.series_id),
  }));
}
