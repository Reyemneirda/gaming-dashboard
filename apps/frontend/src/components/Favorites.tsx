import { useGameContext } from "../context/GameContext";
import { Heart, Clock, TrendingUp } from "lucide-react";

export const FavoriteGames = () => {
  const { pinnedItems, gameStats, detailedStats, loading } = useGameContext();

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pinnedItems.games.length === 0) {
    return null;
  }

  const formatPlaytime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Heart className="w-5 h-5 text-red-400 fill-current" />
        <h3 className="text-xl font-semibold text-white">Jeux Favoris</h3>
        <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-sm">
          {pinnedItems.games.length}
        </span>
      </div>

      <div className="space-y-4">
        {pinnedItems.games.map((gameName) => {
          const stats = detailedStats[gameName];
          const totalMinutes = gameStats[gameName] || 0;

          return (
            <div key={gameName} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {gameName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-white line-clamp-1">{gameName}</h4>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    {totalMinutes > 0 && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatPlaytime(totalMinutes)}</span>
                      </div>
                    )}
                    {stats && stats.sessions_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{stats.sessions_count} sessions</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {stats && stats.last_played && (
                  <div className="text-xs text-slate-400">
                    Dernière fois: {new Date(stats.last_played).toLocaleDateString('fr-FR')}
                  </div>
                )}
                {stats && stats.average_session > 0 && (
                  <div className="text-xs text-slate-500 mt-1">
                    Moy: {formatPlaytime(Math.round(stats.average_session))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pinnedItems.games.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-slate-400 hover:text-white transition-colors">
            See more →
          </button>
        </div>
      )}
    </div>
  );
};