import { useGameContext } from "../context/GameContext";
import type { Game } from "../services/rawg";
import { GameCard } from "./GameCard";

type Props = {
  games: Game[];
  loading?: boolean;
  error?: string;
};

export const GameGrid = ({ games, loading = false, error }: Props) => {
  const { pinGame, unpinGame, isGamePinned } = useGameContext();
  if (loading) {
    return (
      <div className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="bg-gray-700 h-6 rounded"></div>
              <div className="bg-gray-700 h-4 rounded w-3/4"></div>
              <div className="flex gap-2">
                <div className="bg-gray-700 h-6 rounded-full w-16"></div>
                <div className="bg-gray-700 h-6 rounded-full w-20"></div>
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} isPinned={isGamePinned(game.name)} onPin={pinGame} onUnpin={unpinGame} />
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