import type { Game } from "../services/rawg";
import { Star, Calendar, Clock, Users, Gamepad2, Tag, Plus, Heart } from "lucide-react";
import { useState } from "react";
import { useGameContext } from "../context/GameContext";

type Props = {
  game: Game;
  isPinned: boolean;
  onPin: (game: Game) => void;
  onUnpin: (game: Game) => void;
  onGenreClick?: (genre: string) => void;
};

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "text-green-400";
  if (rating >= 4.0) return "text-yellow-400";
  if (rating >= 3.0) return "text-orange-400";
  return "text-red-400";
};

const getRatingText = (rating: number) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very good";
  if (rating >= 3.0) return "Good";
  return "Average";
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPlaytime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const GameCard = ({ game, isPinned, onPin, onUnpin, onGenreClick }: Props) => {
  const { addSession } = useGameContext();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionHours, setSessionHours] = useState('');

  const handlePinToggle = () => {
    if (isPinned && onUnpin) {
      onUnpin(game);
    } else if (!isPinned && onPin) {
      onPin(game);
    }
  };

  const handleAddSession = () => {
    setShowSessionModal(true);
  };

  const handleSessionSubmit = async () => {
    if (!sessionHours) return;
    
    const hours = parseFloat(sessionHours);
    if (isNaN(hours) || hours <= 0) return;
    
    try {
      await addSession(game.name, Math.round(hours * 60));
      setShowSessionModal(false);
      setSessionHours('');
    } catch (err) {
      console.error('Error adding session:', err);
    }
  };

  const handleModalClose = () => {
    setShowSessionModal(false);
    setSessionHours('');
  };
  return (
  <div className="group relative card overflow-hidden transition-all duration-300 transform hover:-translate-y-2">
    <div className="relative">
      <img 
        src={game.background_image} 
        alt={game.name} 
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent hover:translate-y-2" />
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        {game.metacritic && (
          <div className="bg-yellow-500 text-black px-2 py-1 rounded-md text-xs font-bold">
            {game.metacritic}
          </div>
        )}
        <div className={`flex items-center space-x-1 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-md`}>
          <Star className={`w-3 h-3 ${getRatingColor(game.rating)}`} />
          <span className="text-xs font-medium text-white">{game.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="absolute top-3 left-3 flex items-center space-x-2">
        <button
          onClick={handlePinToggle}
          className={`p-1 rounded-md backdrop-blur-sm transition-all ${
            isPinned 
              ? 'bg-red-500/80 text-white hover:bg-red-600/80' 
              : 'bg-gray-900/80 text-gray-300 hover:text-red-400 hover:bg-gray-800/90'
          }`}
        >
          <Heart className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleAddSession}
          className="p-1 rounded-md backdrop-blur-sm transition-all bg-gray-900/80 text-gray-300 hover:text-blue-400 hover:bg-gray-800/90"
          title="Add session"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>

    <div className="p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
          {game.name}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(game.released)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatPlaytime(game.playtime)}</span>
          </div>
        </div>

        {game?.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                onClick={() => onGenreClick?.(genre.name)}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-600/30 hover:bg-blue-600/30 hover:text-blue-200 transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3 mr-1" />
                {genre.name}
              </span>
            ))}
            {game?.genres?.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 border border-gray-600/30">
                +{game.genres.length - 3}
              </span>
            )}
          </div>
        )}

        {game?.platforms?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.platforms.slice(0, 3).map((platformInfo) => (
              <span
                key={platformInfo.platform.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 border border-green-600/30"
              >
                <Gamepad2 className="w-3 h-3 mr-1" />
                {platformInfo.platform.name}
              </span>
            ))}
            {game?.platforms?.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 border border-gray-600/30">
                +{game.platforms.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{game.added.toLocaleString()} added</span>
          </div>
          <div className={`text-xs font-medium ${getRatingColor(game.rating)}`}>
            {getRatingText(game.rating)}
          </div>
        </div>

        {game?.stores?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {game.stores.slice(0, 2).map((storeInfo) => (
              <span
                key={storeInfo.id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-600/30"
              >
                {storeInfo.store.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>

    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 via-transparent to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    
    {/* Session Modal */}
    {showSessionModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-96 max-w-[90vw]">
          <h3 className="text-xl font-semibold text-white mb-4">
            Add Session - {game.name}
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
  )
};
  