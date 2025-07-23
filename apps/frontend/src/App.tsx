import { GameLibrary } from "./components/GameLibrary"; 
import { GameProvider } from "./context/GameContext";
export default function App() {

  return (
    <GameProvider>
      <div className="min-h-screen flex">
        <GameLibrary />
      </div>
    </GameProvider>
  );
}
