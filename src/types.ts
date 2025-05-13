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
  country: string; // This is a URL to country profile, might need to be string
  joined: number; // Timestamp
  last_online: number; // Timestamp - this is what we need!
  followers: number;
  is_streamer: boolean;
  twitch_url?: string;
  fide?: number;
}
