import { API_BASE } from "../config";

export interface PlaySession {
  game: string;
  minutes: number;
  date?: string;
}

export interface PinItem {
  type: 'game';
  value: string;
}

export interface GameStats {
  [gameName: string]: number;
}

export interface DetailedStats {
  [gameName: string]: {
    total_minutes: number;
    sessions_count: number;
    last_played: string | null;
    average_session: number;
  };
}

export interface PinnedItems {
  games: string[];
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getStats(): Promise<GameStats> {
    return this.request<GameStats>('/stats');
  }

  async getDetailedStats(): Promise<DetailedStats> {
    return this.request<DetailedStats>('/stats/detailed');
  }

  // Sessions
  async addPlaySession(session: PlaySession): Promise<any> {
    return this.request('/session', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  // Pinned items
  async getPinnedItems(): Promise<PinnedItems> {
    return this.request<PinnedItems>('/pinned');
  }

  async pinItem(item: PinItem): Promise<any> {
    return this.request('/pin', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async unpinItem(item: PinItem): Promise<any> {
    return this.request('/unpin', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async getLiveStats(): Promise<{data: DetailedStats, timestamp: string, last_updated: string}> {
    return this.request('/live/stats');
  }

  async refreshData(): Promise<any> {
    return this.request('/admin/refresh-data', {
      method: 'POST',
    });
  }

  async getTrendingGames(): Promise<any> {
    return this.request('/trending');
  }
}

export const apiService = new ApiService();