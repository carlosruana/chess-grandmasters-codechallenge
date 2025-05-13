export interface GrandmasterListResponse {
  players: string[];
}

export interface PlayerProfileResponse {
  avatar?: string;
  player_id: number;
  '@id': string; // API URL for the player
  url: string; // Chess.com profile URL
  name?: string; // Full name, might not always be present
  username: string;
  title?: string;
  followers: number;
  country: string; // API URL for country profile
  last_online: number; // Unix timestamp
  joined: number; // Unix timestamp
  status: string;
  is_streamer: boolean;
  twitch_url?: string;
  verified: boolean;
  league?: string;
}
