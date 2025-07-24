import { useState, useEffect } from "react";
import { Search, X, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { searchGames } from "../services/rawg";
import type { Game } from "../services/rawg";
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const GameComparison = () => {
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(async () => {
        setIsSearching(true);
        try {
          const response = await searchGames(searchQuery, { pageSize: 5 });
          setSearchResults(response.results);
        } catch (error) {
          console.error("Error searching games:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const addGame = (game: Game) => {
    if (selectedGames.length < 2 && !selectedGames.find(g => g.id === game.id)) {
      setSelectedGames([...selectedGames, game]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const removeGame = (gameId: number) => {
    setSelectedGames(selectedGames.filter(g => g.id !== gameId));
  };

  const generatePopularityData = () => {
    if (selectedGames.length !== 2) return null;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const game1Data = months.map((_, index) => {
      return selectedGames[0].rating * (0.8 + Math.random() * 0.4) * (1 + index * 0.05);
    });
    
    const game2Data = months.map((_, index) => {
      return selectedGames[1].rating * (0.8 + Math.random() * 0.4) * (1 + index * 0.03);
    });

    return {
      labels: months,
      datasets: [
        {
          label: selectedGames[0].name,
          data: game1Data,
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: selectedGames[1].name,
          data: game2Data,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const generateRatingComparisonData = () => {
    if (selectedGames.length !== 2) return null;

    return {
      labels: [selectedGames[0].name, selectedGames[1].name],
      datasets: [
        {
          data: [selectedGames[0].rating, selectedGames[1].rating],
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
          ],
          borderColor: [
            'rgba(139, 92, 246, 1)',
            'rgba(34, 197, 94, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f1f5f9',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#f1f5f9',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          🎮 Game Comparison
        </h1>
        <p className="text-slate-400">
          Compare two games side by side with detailed analytics
        </p>
      </header>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Select Games to Compare</h2>
        
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search for ${selectedGames.length === 0 ? 'first' : 'second'} game...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={selectedGames.length >= 2}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
              {searchResults.map((game) => (
                <button
                  key={game.id}
                  onClick={() => addGame(game)}
                  className="w-full flex items-center p-3 hover:bg-slate-700 transition-colors text-left"
                >
                  <img
                    src={game.background_image}
                    alt={game.name}
                    className="w-12 h-12 object-cover rounded-lg mr-3"
                  />
                  <div>
                    <div className="text-white font-medium">{game.name}</div>
                    <div className="text-slate-400 text-sm">Rating: {game.rating}/5</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((index) => (
            <div key={index} className="border-2 border-dashed border-slate-600 rounded-lg p-6 min-h-32">
              {selectedGames[index] ? (
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedGames[index].background_image}
                    alt={selectedGames[index].name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{selectedGames[index].name}</h3>
                    <p className="text-slate-400 text-sm">Rating: {selectedGames[index].rating}/5</p>
                    <p className="text-slate-400 text-sm">Released: {new Date(selectedGames[index].released).getFullYear()}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedGames[index].genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre.id}
                          className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeGame(selectedGames[index].id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <div className="text-4xl mb-2">🎮</div>
                  <p>Game {index + 1}</p>
                  <p className="text-sm">Search and select a game</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedGames.length === 2 && (
        <div className="space-y-8">
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Popularity Over Time</h2>
            </div>
            <div className="h-64">
              <Line data={generatePopularityData()!} options={chartOptions} />
            </div>
            <p className="text-slate-400 text-sm mt-4">
              *Simulated data showing popularity trends over the past year
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-6">
              <PieChart className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Rating Comparison</h2>
            </div>
            <div className="h-64">
              <Doughnut data={generateRatingComparisonData()!} options={doughnutOptions} />
            </div>
            <p className="text-slate-400 text-sm mt-4">
              Comparing overall ratings between the selected games
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Side-by-Side Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedGames.map((game, index) => (
                <div key={game.id} className="space-y-4">
                  <div className="text-center">
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rating</span>
                      <span className="text-white font-medium">{game.rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Metacritic</span>
                      <span className="text-white font-medium">{game.metacritic || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Released</span>
                      <span className="text-white font-medium">{new Date(game.released).getFullYear()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Playtime</span>
                      <span className="text-white font-medium">{game.playtime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Community</span>
                      <span className="text-white font-medium">{game.added.toLocaleString()} added</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-sm">Genres:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {game.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-sm">Platforms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {game.platforms.slice(0, 4).map((platformInfo) => (
                        <span
                          key={platformInfo.platform.id}
                          className="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs"
                        >
                          {platformInfo.platform.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedGames.length === 0 && (
        <div className="card p-12 text-center">
          <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Compare Games?</h3>
          <p className="text-slate-400">
            Search and select two games to see detailed comparisons with charts and analytics
          </p>
        </div>
      )}
    </div>
  );
};