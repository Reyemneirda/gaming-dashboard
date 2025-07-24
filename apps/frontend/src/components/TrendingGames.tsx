import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { TrendingUp, Star, Calendar } from "lucide-react";

interface TrendingGame {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  released: string;
  genres: string[];
  platforms: string[];
  added: number;
}

export const TrendingGames = () => {
  const [trendingGames, setTrendingGames] = useState<TrendingGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await apiService.getTrendingGames();
        setTrendingGames(response.games || []);
        setLastUpdated(response.last_updated);
      } catch (error) {
        console.error("Error fetching trending games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Trending Now</h3>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg p-3 animate-pulse">
              <div className="bg-gray-600 h-24 rounded mb-2"></div>
              <div className="bg-gray-600 h-4 rounded mb-1"></div>
              <div className="bg-gray-600 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Trending Now</h3>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        {lastUpdated && (
          <span className="text-xs text-slate-400">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingGames.slice(0, 6).map((game) => (
          <div
            key={game.id}
            className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
          >
            <div className="relative mb-2">
              <img
                src={game.background_image}
                alt={game.name}
                className="w-full h-24 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/300x200?text=${game.name.replace(' ', '+')}`;
                }}
              />
              <div className="absolute top-1 right-1 flex items-center space-x-1 bg-black/70 rounded px-1 py-0.5">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-white">{game.rating.toFixed(1)}</span>
              </div>
            </div>

            <h4 className="text-sm font-medium text-white mb-1 truncate">
              {game.name}
            </h4>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(game.released).getFullYear()}</span>
              </div>
              <span className="text-orange-400">+{game.added.toLocaleString()}</span>
            </div>

            {game.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {game.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};