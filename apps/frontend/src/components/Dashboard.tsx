import { useState, useEffect } from "react";
import { getPopularGames } from "../services/rawg";
import type { Game } from "../services/rawg";
import { GameChart } from "./GameChart";
import { useGameContext } from "../context/GameContext";
import { apiService } from "../services/api";
import { Gamepad2, Clock, Star, TrendingUp, Calendar, Trophy, Play } from "lucide-react";
import { FavoriteGames } from "./Favorites";
import { TrendingGames } from "./TrendingGames";

export const DashboardHome = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingGame, setPlayingGame] = useState<string | null>(null);
  const [sessionMinutes, setSessionMinutes] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const { gameStats, detailedStats, pinnedItems, refreshData } = useGameContext();

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await getPopularGames({ pageSize: 10 });
        setGames(response.results);
      } catch (error) {
        console.error("Error loading games:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  // Polling mechanism for real-time updates
  useEffect(() => {
    const pollLiveData = async () => {
      try {
        const liveStats = await apiService.getLiveStats();
        setLastUpdated(liveStats.last_updated);
        // Refresh context data if there are updates
        if (liveStats.timestamp !== lastUpdated) {
          refreshData();
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Initial poll
    pollLiveData();

    // Set up polling interval (every 30 seconds)
    const pollInterval = setInterval(pollLiveData, 30000);

    return () => clearInterval(pollInterval);
  }, [lastUpdated, refreshData]);

  const topGames = games.slice(0, 4);
  const chartData = Object.keys(gameStats).reduce((acc, gameName) => {
    const minutes = gameStats[gameName];
    acc[gameName.slice(0, 15)] = Math.round(minutes / 60 * 10) / 10; // Convert to hours
    return acc;
  }, {} as Record<string, number>);

  // Calculate real stats from backend data
  const totalGames = Object.keys(detailedStats).length;
  const totalMinutes = Object.values(gameStats).reduce((sum, minutes) => sum + minutes, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
  const averageRating = games.length > 0 ? 
    (games.reduce((sum, game) => sum + game.rating, 0) / games.length).toFixed(1) : "0.0";
  const totalSessions = Object.values(detailedStats).reduce((sum, stats) => sum + stats.sessions_count, 0);

  const stats = [
    {
      title: "Total Games",
      value: totalGames.toString(),
      change: totalGames > 0 ? `+${Math.min(totalGames, 12)}` : "0",
      changeType: "increase" as const,
      icon: Gamepad2,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Hours Played",
      value: `${totalHours}h`,
      change: "+0.5h",
      changeType: "increase" as const,
      icon: Clock,
      color: "from-cyan-500 to-cyan-600"
    },
    {
      title: "Average Rating",
      value: averageRating,
      change: "+0.1",
      changeType: "increase" as const,
      icon: Star,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Total Sessions",
      value: totalSessions.toString(),
      change: `+${Math.min(totalSessions, 47)}`,
      changeType: "increase" as const,
      icon: Trophy,
      color: "from-green-500 to-green-600"
    }
  ];

  const startPlaySession = async (gameName: string) => {
    try {
      // Immediately add 1 hour (60 minutes) to get stats
      await apiService.addPlaySession({
        game: gameName,
        minutes: 60
      });
      
      // Update UI state
      setPlayingGame(gameName);
      setSessionMinutes(prev => ({ ...prev, [gameName]: 0 }));
      
      // Refresh data to show updated stats
      await refreshData();
    } catch (error) {
      console.error("Error starting play session:", error);
    }
  };

  const endPlaySession = async (gameName: string) => {
    const minutes = sessionMinutes[gameName] || 0;
    if (minutes > 0) {
      try {
        await apiService.addPlaySession({
          game: gameName,
          minutes: minutes
        });
        await refreshData();
      } catch (error) {
        console.error("Error saving play session:", error);
      }
    }
    setPlayingGame(null);
    setSessionMinutes(prev => {
      const updated = { ...prev };
      delete updated[gameName];
      return updated;
    });
  };

  // Timer effect for active sessions
  useEffect(() => {
    if (!playingGame) return;

    const interval = setInterval(() => {
      setSessionMinutes(prev => ({
        ...prev,
        [playingGame]: (prev[playingGame] || 0) + 1
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [playingGame]);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gaming Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your gaming overview</p>
          {lastUpdated && (
            <p className="text-xs text-slate-500 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              try {
                await apiService.refreshData();
                refreshData();
              } catch (error) {
                console.error("Refresh failed:", error);
              }
            }}
            className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3 py-2 rounded-xl transition-colors text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Last 7 days</span>
          </div>
        </div>
      </div>

      <TrendingGames />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-400">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {pinnedItems.games.length > 0 && (
        <FavoriteGames />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Game Playtime</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Hours</span>
            </div>
          </div>
          {!loading && <GameChart data={chartData} />}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
           
          </div>
          <div className="space-y-4">
            {Object.entries(detailedStats)
              .filter(([_, stats]) => stats.last_played)
              .sort(([_, a], [__, b]) => new Date(b.last_played!).getTime() - new Date(a.last_played!).getTime())
              .slice(0, 4)
              .map(([gameName, stats], index) => {
                const lastPlayed = stats.last_played ? new Date(stats.last_played) : null;
                const timeAgo = lastPlayed ? getTimeAgo(lastPlayed) : "Unknown";
                const action = `Played for ${Math.round(stats.average_session)} min avg`;
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20">
                      <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{gameName}</p>
                      <p className="text-xs text-slate-400">{action}</p>
                    </div>
                    <span className="text-xs text-slate-500">{timeAgo}</span>
                  </div>
                );
              })
            }
            {Object.keys(detailedStats).length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No gaming sessions recorded yet</p>
                <p className="text-xs">Start playing games to see your activity!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Games */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Top Games This Week</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span>Most Played</span>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-700 rounded-lg h-32 mb-2 w-full"></div>
                <div className="bg-slate-700 rounded h-4 mb-1 w-full"></div>
                <div className="bg-slate-700 rounded h-3 w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topGames.map((game, index) => {
              const realPlaytime = gameStats[game.name] ? Math.round(gameStats[game.name] / 60 * 10) / 10 : 0;
              const isPlaying = playingGame === game.name;
              const currentSession = sessionMinutes[game.name] || 0;
              
              return (
                <div key={game.id} className="group relative">
                  <div className="relative overflow-hidden rounded-lg aspect-video mb-3">
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-white font-medium">{game.rating}</span>
                    </div>
                    {isPlaying && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                        Playing • {currentSession}m
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors mb-1 truncate">
                    {game.name}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>{realPlaytime}h tracked</span>
                    <span>{new Date(game.released).getFullYear()}</span>
                  </div>
                  <div className="flex gap-1">
                    {isPlaying ? (
                      <button
                        onClick={() => endPlaySession(game.name)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors"
                      >
                        Stop Playing
                      </button>
                    ) : (
                      <button
                        onClick={() => startPlaySession(game.name)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Start Playing
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};