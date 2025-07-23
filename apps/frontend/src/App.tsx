import { useEffect, useState } from "react";
import { getPopularGames, type Game } from "./services/rawg"; 
import { GameCard } from "./components/GameCard";

export default function App() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    getPopularGames().then(setGames);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">🎮 Gaming Dashboard</h1>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Top Games</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {games.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
