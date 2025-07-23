import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";

type Props = {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  loading?: boolean;
};

export interface FilterOptions {
  genre?: string;
  platform?: string;
  rating?: number;
  year?: number;
}

export const SearchBar = ({ onSearch, onFilterChange, loading = false }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);
  const ratings = [4.5, 4.0, 3.5, 3.0, 2.5, 2.0];

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a game..."
          className="block w-full pr-12s pl-20 py-3"
          disabled={loading}
          style={{
            borderRadius: "12px, 12px, 12px, 12px",
            border: "1px solid var(--border-subtle)",
          }}
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inset-y-0 right-0 pr-3 flex items-center"
          style={{
            position: "absolute"
          }}
        >
          <Filter className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>

      {showFilters && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Note minimum
              </label>
              <select
                value={filters.rating || ""}
                onChange={(e) => handleFilterChange({ rating: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2"
              >
                <option value="">All ratings</option>
                {ratings.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}+ stars
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <select
                value={filters.year || ""}
                onChange={(e) => handleFilterChange({ year: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2"
              >
                <option value="">All years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre:
              </label>
              <select
                value={filters.genre || ""}
                onChange={(e) => handleFilterChange({ genre: e.target.value || undefined })}
                className="w-full px-3 py-2"
              >
                <option value="">All genres</option>
                <option value="action">Action</option>
                <option value="adventure">Aventure</option>
                <option value="rpg">RPG</option>
                <option value="strategy">Stratégie</option>
                <option value="simulation">Simulation</option>
                <option value="sports">Sports</option>
                <option value="puzzle">Puzzle</option>
                <option value="indie">Indie</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform:
              </label>
              <select
                value={filters.platform || ""}
                onChange={(e) => handleFilterChange({ platform: e.target.value || undefined })}
                className="w-full px-3 py-2"
              >
                <option value="">All platforms</option>
                <option value="pc">PC</option>
                <option value="playstation">PlayStation</option>
                <option value="xbox">Xbox</option>
                <option value="nintendo">Nintendo</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 