import { useGameContext } from "../context/GameContext";
import { Heart, Clock, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";

export const FavoriteGames = () => {
  const { pinnedItems, gameStats, detailedStats, loading, addSession } = useGameContext();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [sessionHours, setSessionHours] = useState('');

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

  const handleAddSession = (gameName: string) => {
    setSelectedGame(gameName);
    setShowSessionModal(true);
  };

  const handleSessionSubmit = async () => {
    if (!sessionHours || !selectedGame) return;
    
    const hours = parseFloat(sessionHours);
    if (isNaN(hours) || hours <= 0) return;
    
    try {
      await addSession(selectedGame, Math.round(hours * 60));
      setShowSessionModal(false);
      setSessionHours('');
      setSelectedGame('');
    } catch (err) {
      console.error('Error adding session:', err);
    }
  };

  const handleModalClose = () => {
    setShowSessionModal(false);
    setSessionHours('');
    setSelectedGame('');
  };

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Heart className="w-5 h-5 text-red-400 fill-current" />
        <h3 className="text-xl font-semibold text-white">Favorite Games</h3>
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

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  {stats && stats.last_played && (
                    <div className="text-xs text-slate-400">
                      Last played: {new Date(stats.last_played).toLocaleDateString('en-US')}
                    </div>
                  )}
                  {stats && stats.average_session > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                      Avg: {formatPlaytime(Math.round(stats.average_session))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleAddSession(gameName)}
                  className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 transition-all duration-200"
                  title="Add session"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

   
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-96 max-w-[90vw]">
            <h3 className="text-xl font-semibold text-white mb-4">
              Add Session - {selectedGame}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hours Played
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={sessionHours}
                onChange={(e) => setSessionHours(e.target.value)}
                placeholder="ex: 2.5"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSessionSubmit();
                  } else if (e.key === 'Escape') {
                    handleModalClose();
                  }
                }}
                autoFocus
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSessionSubmit}
                disabled={!sessionHours || parseFloat(sessionHours) <= 0}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button
                onClick={handleModalClose}
                className="flex-1 bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};