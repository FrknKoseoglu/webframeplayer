// Profile Types
export interface XtreamCredentials {
  url: string;
  username: string;
  password: string;
}

export interface Profile {
  id: string;
  name: string;
  type: 'm3u' | 'xtream';
  m3uUrl?: string;
  credentials?: XtreamCredentials;
  active: boolean;
  createdAt: number;
}

// Content Types
export type ContentType = 'live' | 'movie' | 'series';

export interface ContentItem {
  id: string;
  name: string;
  group: string;
  groupId?: string;
  logo?: string;
  url: string;
  type: ContentType;
  rating?: number;
  year?: number;
  plot?: string;
  duration?: string;
  // Series specific
  seriesId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  downloadUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  type: ContentType;
}

export interface SearchIndexItem {
  id: string;
  n: string; // name
  g: string; // group
  t: ContentType; // type
  s: string; // search string (normalized)
}

// Xtream API Response Types
export interface XtreamUserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
}

export interface XtreamServerInfo {
  url: string;
  port: string;
  https_port: string;
  server_protocol: string;
  rtmp_port: string;
  timezone: string;
  timestamp_now: number;
  time_now: string;
}

export interface XtreamAuthResponse {
  user_info: XtreamUserInfo;
  server_info: XtreamServerInfo;
}

export interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamLiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface XtreamVodStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface XtreamSeries {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface XtreamSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  season_number: number;
  vote_average: number;
}

export interface XtreamEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    duration: string;
    movie_image: string;
    plot: string;
    rating: string;
    releasedate: string;
  };
}

export interface XtreamSeriesInfo {
  seasons: XtreamSeason[];
  info: any;
  episodes: Record<string, XtreamEpisode[]>;
}

export interface Episode {
  id: string;
  title: string;
  episodeNum: number;
  seasonNum: number;
  plot?: string;
  duration?: string;
  image?: string;
  url: string;
  downloadUrl?: string;
}

export interface Season {
  name: string;
  number: number;
  episodes: Episode[];
}

// Loading states
export type LoadingStep = 
  | 'idle'
  | 'authenticating'
  | 'fetching_categories'
  | 'fetching_live'
  | 'fetching_movies'
  | 'fetching_series'
  | 'processing'
  | 'complete'
  | 'error';

export const LOADING_MESSAGES: Record<LoadingStep, string> = {
  idle: '',
  authenticating: 'Kimlik doğrulanıyor...',
  fetching_categories: 'Kategoriler alınıyor...',
  fetching_live: 'Canlı kanallar yükleniyor...',
  fetching_movies: 'Filmler yükleniyor...',
  fetching_series: 'Diziler yükleniyor...',
  processing: 'İşleniyor...',
  complete: 'Tamamlandı!',
  error: 'Bir hata oluştu',
};

// EPG Types
export interface EpgProgram {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  startTimestamp: number;
  endTimestamp: number;
  channelId: string;
  lang?: string;
}

export interface XtreamEpgListing {
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: string;
  stop_timestamp: string;
}

export interface XtreamShortEpgResponse {
  epg_listings: XtreamEpgListing[];
}

