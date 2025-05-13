export interface GrandmasterListResponse {
  players: string[];
}

export interface PlayerProfile {
  '@id': string;
  url: string;
  username: string;
  player_id: number;
  title?: string;
  status: string;
  name?: string;
  avatar?: string;
  location?: string;
  country: string; // This is a URL to country profile
  joined: number; // Timestamp
  last_online: number; // Timestamp
  followers: number;
  is_streamer: boolean;
  twitch_url?: string;
  fide?: number;
  rating?: number;
  league?: string;
}

export interface GrandMaster {
  username: string;
  title: string;
  name: string;
  location?: string;
  followers: number;
  league: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'rating' | 'name' | 'title';
