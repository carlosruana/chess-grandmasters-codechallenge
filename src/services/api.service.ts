import type {
  GrandMaster,
  ApiResponse,
  GrandmasterListResponse,
  PlayerProfile,
} from '../types/index';
import { config } from '../config';

export class ChessApiService {
  private static instance: ChessApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = config.api.baseUrl;
  }

  public static getInstance(): ChessApiService {
    if (!ChessApiService.instance) {
      ChessApiService.instance = new ChessApiService();
    }
    return ChessApiService.instance;
  }

  async fetchPlayerProfile(username: string): Promise<PlayerProfile> {
    console.log('Fetching profile for:', username);
    const response = await fetch(
      `${this.baseUrl}/player/${username.toString()}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  private allPlayers: string[] = [];
  private currentPage = 0;
  private readonly pageSize = 10;

  async fetchGrandmasters(page?: number): Promise<ApiResponse<GrandMaster[]>> {
    try {
      // Fetch all players if we haven't already
      if (this.allPlayers.length === 0) {
        const response = await fetch(`${this.baseUrl}/titled/GM`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GrandmasterListResponse = await response.json();
        this.allPlayers = data.players;
      }

      // Calculate the page to fetch
      const pageToFetch = page ?? this.currentPage;
      const start = pageToFetch * this.pageSize;
      const end = start + this.pageSize;
      const pagePlayers = this.allPlayers.slice(start, end);

      // Fetch detailed profiles in parallel
      const grandmastersPromises = pagePlayers.map(async (username: string) => {
        try {
          const profile = await this.fetchPlayerProfile(username);
          return {
            username,
            title: profile.title || 'GM',
            name: profile.name || username,
            rating: profile.rating || 0,
            followers: profile.followers || 0,
            league: profile.league || 'Unranked',
          };
        } catch (error) {
          console.error(`Error fetching details for ${username}:`, error);
          return {
            username,
            title: 'GM',
            name: username,
            rating: 0,
            followers: 0,
            league: 'Unranked',
          };
        }
      });

      const grandmasters = await Promise.all(grandmastersPromises);
      return { data: grandmasters, status: 200 };
    } catch (error) {
      console.error('Error fetching grandmasters:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch grandmasters: ${error.message}`);
      } else {
        throw new Error('Failed to fetch grandmasters: Unknown error occurred');
      }
    }
  }
}
