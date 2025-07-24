import { RAWG_API_KEY, RAWG_BASE } from "../config";

export interface Platform {
  id: number;
  name: string;
  slug: string;
  image?: string;
  year_end?: number;
  year_start?: number;
  games_count: number;
  image_background: string;
}

export interface PlatformInfo {
  platform: Platform;
  released_at: string;
  requirements_en?: {
    minimum: string;
    recommended?: string;
  };
  requirements_ru?: {
    minimum: string;
    recommended?: string;
  };
}

export interface ParentPlatform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

export interface Store {
  id: number;
  store: {
    id: number;
    name: string;
    slug: string;
    domain: string;
    games_count: number;
    image_background: string;
  };
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
  image_background: string;
}

export interface Rating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

export interface AddedByStatus {
  yet: number;
  owned: number;
  beaten: number;
  toplay: number;
  dropped: number;
  playing: number;
}

export interface ShortScreenshot {
  id: number;
  image: string;
}

export interface Game {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings: Rating[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: AddedByStatus;
  metacritic: number | null;
  playtime: number;
  suggestions_count: number;
  updated: string;
  user_game: any | null;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  platforms: PlatformInfo[];
  parent_platforms: ParentPlatform[];
  genres: Genre[];
  stores: Store[];
  clip: any | null;
  tags: Tag[];
  esrb_rating: any | null;
  short_screenshots: ShortScreenshot[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  ordering?: string;
}

export interface FilterOptions {
  genre?: string;
  platform?: string;
  rating?: number;
  year?: number;
}

export interface GameOptions extends PaginationOptions, FilterOptions {}

export async function getPopularGames(options: GameOptions = {}): Promise<PaginatedResponse<Game>> {
  const { page = 1, pageSize = 20, ordering = '-rating', genre, platform, rating, year } = options;
  
  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    ordering,
    page_size: pageSize.toString(),
    page: page.toString(),
  });

  // Add filters
  if (genre) {
    params.append('genres', genre.toLowerCase());
  }
  if (platform) {
    params.append('platforms', platform.toLowerCase());
  }
  if (rating) {
    params.append('metacritic', `${Math.round(rating * 20)},100`); // Convert 5-star to metacritic scale
  }
  if (year) {
    params.append('dates', `${year}-01-01,${year}-12-31`);
  }
  
  const res = await fetch(`${RAWG_BASE}/games?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch games: ${res.statusText}`);
  }
  
  const json = await res.json();
  return {
    count: json.count,
    next: json.next,
    previous: json.previous,
    results: json.results,
  };
}

export async function searchGames(query: string, options: GameOptions = {}): Promise<PaginatedResponse<Game>> {
  const { page = 1, pageSize = 20, ordering = '-rating', genre, platform, rating, year } = options;
  
  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    search: query,
    ordering,
    page_size: pageSize.toString(),
    page: page.toString(),
  });

  // Add filters
  if (genre) {
    params.append('genres', genre.toLowerCase());
  }
  if (platform) {
    params.append('platforms', platform.toLowerCase());
  }
  if (rating) {
    params.append('metacritic', `${Math.round(rating * 20)},100`); // Convert 5-star to metacritic scale
  }
  if (year) {
    params.append('dates', `${year}-01-01,${year}-12-31`);
  }
  
  const res = await fetch(`${RAWG_BASE}/games?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to search games: ${res.statusText}`);
  }
  
  const json = await res.json();
  return {
    count: json.count,
    next: json.next,
    previous: json.previous,
    results: json.results,
  };
}
