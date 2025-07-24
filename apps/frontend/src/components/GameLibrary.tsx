import { useState, useEffect } from "react";
import { getPopularGames, searchGames } from "../services/rawg";
import type { Game, PaginatedResponse } from "../services/rawg";
import { SearchBar, type FilterOptions } from "./SearchBar";
import { GameGrid } from "./GameGrid";
import { Pagination } from "./Pagination";

interface CacheEntry {
  data: PaginatedResponse<Game>;
  timestamp: number;
}

const gameCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const generateCacheKey = (searchQuery: string, filters: FilterOptions, page: number, pageSize: number) => {
  const key = {
    search: searchQuery,
    filters: Object.keys(filters).length > 0 ? filters : {},
    page,
    pageSize
  };
  return JSON.stringify(key);
};

const isCacheValid = (entry: CacheEntry) => {
  return Date.now() - entry.timestamp < CACHE_DURATION;
};

const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of gameCache.entries()) {
    if (now - entry.timestamp >= CACHE_DURATION) {
      gameCache.delete(key);
    }
  }
};

setInterval(cleanupCache, 10 * 60 * 1000); // 10 minutes

export const GameLibrary = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState<PaginatedResponse<Game> | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadGames(1);
  }, []);

  useEffect(() => {
    if (searchQuery || Object.keys(filters).length > 0) {
      setCurrentPage(1);
      loadGames(1);
    }
  }, [searchQuery, filters]);

  const loadGames = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate cache key
      const cacheKey = generateCacheKey(searchQuery, filters, page, itemsPerPage);
      
      // Check cache first
      const cachedEntry = gameCache.get(cacheKey);
      if (cachedEntry && isCacheValid(cachedEntry)) {
        // Use cached data
        const response = cachedEntry.data;
        setPagination(response);
        setGames(response.results);
        setTotalItems(response.count);
        setTotalPages(Math.ceil(response.count / itemsPerPage));
        setCurrentPage(page);
        setLoading(false);
        return;
      }
      
      // Make API call if not in cache or cache expired
      let response: PaginatedResponse<Game>;
      
      if (searchQuery) {
        response = await searchGames(searchQuery, { page, pageSize: itemsPerPage, ...filters });
      } else {
        response = await getPopularGames({ page, pageSize: itemsPerPage, ...filters });
      }
      
      // Cache the response
      gameCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      
      setPagination(response);
      setGames(response.results);
      setTotalItems(response.count);
      setTotalPages(Math.ceil(response.count / itemsPerPage));
      setCurrentPage(page);
    } catch (err) {
      setError("Error loading games");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilter = (filterType: keyof FilterOptions) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[filterType];
    setFilters(updatedFilters);
  };

  const handleGenreClick = (genre: string) => {
    const newFilters = { ...filters, genre: genre };
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    loadGames(page);
  };


  return (
    <div className="p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          🎮 Game Library
        </h1>
        <p className="text-slate-400">
          Discover the most popular games and find your next adventure
        </p>
      </header>

        <SearchBar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        <GameGrid
          games={games}
          loading={loading}
          error={error || undefined}
          onGenreClick={handleGenreClick}
          filters={filters}
          onClearFilter={handleClearFilter}
        />

        {!loading && !error && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
    </div>
  );
}; 