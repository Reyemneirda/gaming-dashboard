import { apiService, type PinnedItems } from '../services/api';
import type { Game } from '../services/rawg';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';



interface GameContextType {
    pinnedItems: PinnedItems;
    loading: boolean;
    error: string | null;
    pinGame: (game: Game) => Promise<void>;
    unpinGame: (game: Game) => Promise<void>;
    isGamePinned: (gameName: string) => boolean;
    refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
      throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
  };
  
  interface GameProviderProps {
    children: ReactNode;
  }

  export const GameProvider = ({ children }: GameProviderProps) => {
    const [pinnedItems, setPinnedItems] = useState<PinnedItems>({ games: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const refreshData = async () => {
        try {
          setLoading(true);
          setError(null);
    
          const [pinned] = await Promise.all([
            apiService.getPinnedItems(),
          ])
          setPinnedItems(pinned);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
          console.error('Erreur lors du chargement des données:', err);
        } finally {
          setLoading(false);
        }
      };
    
      const pinGame = async (game: Game) => {
        try {
            console.log('pinning game', game.name);
          await apiService.pinItem({ value: game.name });
          setPinnedItems(prev => ({
            ...prev,
            games: [...prev.games, game.name]
          }));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error pinning game');
          throw err;
        }
      };
    
      const unpinGame = async (game: Game) => {
        try {
          await apiService.unpinItem({ value: game.name });
          setPinnedItems(prev => ({
            ...prev,
            games: prev.games.filter(name => name !== game.name)
          }));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error unpinning game');
          throw err;
        }
      };
      const isGamePinned = (gameName: string) => {
        return pinnedItems.games.includes(gameName);
      };
    
      useEffect(() => {
        refreshData();
      }, []);
    
      const value: GameContextType = {
        pinnedItems,
        loading,
        error,
        pinGame,
        unpinGame,
        isGamePinned,
        refreshData,
      };
    
      return (
        <GameContext.Provider value={value}>
          {children}
        </GameContext.Provider>
      );
  }

