import { BarChart3, Grid3X3 } from "lucide-react";
import { GameLibrary } from "./components/GameLibrary"; 
import { GameProvider } from "./context/GameContext";
import { useState } from "react";
import { DashboardHome } from "./components/Dashboard";

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

    const navigation = [
      { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
      { id: 'library', name: 'Game Library', icon: Grid3X3 },
    ];

  return (
    
    <GameProvider>
      <div className="min-h-screen flex">
        <aside className="w-50 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              🎮 Gaming Hub
            </h2>
            <p className="text-sm text-slate-400 mt-1">Your gaming dashboard</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 rounded-xl transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>          
        </aside>
      {activeSection === 'dashboard' && <DashboardHome />}
      {activeSection === 'library' && <GameLibrary />}
      </div>  
    </GameProvider>
  );
}
