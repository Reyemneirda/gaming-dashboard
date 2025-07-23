import { API_BASE } from "../config";


export interface PinItem {
    value: string;
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
}
export const apiService = new ApiService();