import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/auth";

// Types
type Player = {
  id: string;
  name: string;
};

// API helper
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

function isAdmin(username: string): boolean {
  return username === "user01";
}

export default function NewGame() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isUserAdmin = currentUser ? isAdmin(currentUser.username) : false;
  const [name, setName] = useState("Target Shooting - Fire Room");
  const [players, setPlayers] = useState<string[]>([
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4",
    "Player 5",
  ]);

  // Only admin can create games
  if (!isUserAdmin) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 rounded-2xl border border-gray-200/50 p-6 shadow-xl text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Access Restricted</h2>
          <p className="text-yellow-700 text-lg">
            Only user01 (Admin) can create new Target Shooting games.
          </p>
        </div>
      </main>
    );
  }

  async function create() {
    try {
      const playerObjs: Player[] = players.map((p, i) => ({
        id: `p${i + 1}`,
        name: p || `Player ${i + 1}`,
      }));
      const game = await apiRequest('/games', {
        method: 'POST',
        body: JSON.stringify({
          name,
          players: playerObjs,
        }),
      });
      navigate(`/dashboard/games/${game.id}`);
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Create New Target Shooting Game
        </h2>
        <p className="text-gray-600 mt-2">Set up a new target shooting game with 5 players</p>
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border border-orange-200">
          <p className="text-orange-800 font-medium text-sm">
            Players will progress through: Fire Room → Water Room → Air Room
          </p>
        </div>
      </div>
      
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-700">Game Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter game name..."
              className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base outline-none ring-offset-0 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-lg"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Players (5)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Player {i + 1}</label>
                  <input
                    value={p}
                    onChange={(e) =>
                      setPlayers((arr) => arr.map((v, idx) => (idx === i ? e.target.value : v)))
                    }
                    placeholder={`Player ${i + 1} name`}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base outline-none ring-offset-0 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center pt-6">
            <button 
              onClick={create} 
              className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
            >
              🔥 Create Target Shooting Game
            </button>
            <button 
              onClick={() => navigate("/dashboard/games")}
              className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl px-8 py-4 text-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}