import { useGameContext } from "../context/GameContext";
import type { Game } from "../services/rawg";
import { GameCard } from "./GameCard";
import { X } from "lucide-react";
import type { FilterOptions } from "./SearchBar";

type Props = {
  games: Game[];
  loading?: boolean;
  error?: string;
  onGenreClick?: (genre: string) => void;
  filters?: FilterOptions;
  onClearFilter?: (filterType: keyof FilterOptions) => void;
};

export const GameGrid = ({ games, loading = false, error, onGenreClick, filters, onClearFilter }: Props) => {
  const { pinGame, unpinGame, isGamePinned } = useGameContext();
  if (loading) {
    return (
      <div className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="group relative card overflow-hidden animate-pulse">
            <div className="relative">
              <div className="bg-gray-700 h-48 rounded-t-xl"></div>
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                <div className="bg-gray-600 w-8 h-6 rounded-md"></div>
                <div className="bg-gray-600 w-12 h-6 rounded-md"></div>
              </div>
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <div className="bg-gray-600 w-8 h-8 rounded-md"></div>
                <div className="bg-gray-600 w-8 h-8 rounded-md"></div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-gray-700 h-6 rounded w-4/5"></div>
              <div className="flex items-center justify-between">
                <div className="bg-gray-700 h-4 rounded w-20"></div>
                <div className="bg-gray-700 h-4 rounded w-16"></div>
              </div>
              <div className="flex flex-wrap gap-1">
                <div className="bg-gray-700 h-6 rounded-full w-16"></div>
                <div className="bg-gray-700 h-6 rounded-full w-20"></div>
                <div className="bg-gray-700 h-6 rounded-full w-14"></div>
              </div>
              <div className="flex flex-wrap gap-1">
                <div className="bg-gray-700 h-6 rounded-full w-12"></div>
                <div className="bg-gray-700 h-6 rounded-full w-18"></div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="bg-gray-700 h-4 rounded w-16"></div>
                <div className="bg-gray-700 h-4 rounded w-12"></div>
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                <div className="bg-gray-700 h-6 rounded-md w-16"></div>
                <div className="bg-gray-700 h-6 rounded-md w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Error loading games</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-white mb-2">No games found</h3>
          <p className="text-gray-400">Try modifying your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Popular games ({games.length})
        </h2>
        <div className="text-sm text-gray-400">
          Last update: {new Date().toLocaleDateString("en-GB")}
        </div>
      </div>

      {/* Active Filters Display */}
      {filters && (filters.genre || filters.platform || filters.rating || filters.year) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400">Active filters:</span>
          {filters.genre && (
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 border border-blue-600/30 rounded-full text-sm">
              <span>Genre: {filters.genre}</span>
              {onClearFilter && (
                <button
                  onClick={() => onClearFilter('genre')}
                  className="ml-1 hover:text-blue-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          {filters.platform && (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-300 border border-green-600/30 rounded-full text-sm">
              <span>Platform: {filters.platform}</span>
              {onClearFilter && (
                <button
                  onClick={() => onClearFilter('platform')}
                  className="ml-1 hover:text-green-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          {filters.rating && (
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-600/20 text-yellow-300 border border-yellow-600/30 rounded-full text-sm">
              <span>Rating: {filters.rating}+ stars</span>
              {onClearFilter && (
                <button
                  onClick={() => onClearFilter('rating')}
                  className="ml-1 hover:text-yellow-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          {filters.year && (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-300 border border-purple-600/30 rounded-full text-sm">
              <span>Year: {filters.year}</span>
              {onClearFilter && (
                <button
                  onClick={() => onClearFilter('year')}
                  className="ml-1 hover:text-purple-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} isPinned={isGamePinned(game.name)} onPin={pinGame} onUnpin={unpinGame} onGenreClick={onGenreClick} />
        ))}
      </div>
      
      {games.length > 0 && (
        <div className="text-center pt-8">
          <p className="text-gray-400 text-sm">
            Displaying {games.length} games out of {games.length} results
          </p>
        </div>
      )}
    </div>
  );
}; 