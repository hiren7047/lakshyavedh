import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

// Types
type Player = {
  id: string;
  name: string;
};

type RoomId = 1 | 2 | 3;

type ScoreEntry = {
  objectIndex: number;
  points: number;
};

type PlayerRoomScores = {
  playerId: string;
  roomId: RoomId;
  entries: ScoreEntry[];
};

type Game = {
  id: string;
  name: string;
  createdAt: number;
  players: Player[];
  scores: PlayerRoomScores[];
  status: "room1" | "room2" | "room3" | "completed";
  roomCompletion: {
    room1: boolean;
    room2: boolean;
    room3: boolean;
  };
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

// Storage functions
const storage = {
  async listGames(): Promise<Game[]> {
    try {
      const games = await apiRequest('/games') as Game[];
      return games.map(game => ({
        ...game,
        roomCompletion: game.roomCompletion || {
          room1: false,
          room2: false,
          room3: false,
        }
      }));
    } catch (error) {
      console.error('Failed to list games:', error);
      return [];
    }
  },
  
  async getGame(id: string): Promise<Game | undefined> {
    try {
      const game = await apiRequest(`/games/${id}`) as Game;
      return {
        ...game,
        roomCompletion: game.roomCompletion || {
          room1: false,
          room2: false,
          room3: false,
        }
      };
    } catch (error) {
      console.error('Failed to get game:', error);
      return undefined;
    }
  },
  
  async saveGame(game: Game): Promise<void> {
    try {
      await apiRequest(`/games/${game.id}`, {
        method: 'PUT',
        body: JSON.stringify(game),
      });
    } catch (error) {
      console.error('Failed to save game:', error);
      throw error;
    }
  },
  
  async createGame(name: string, players: Player[]): Promise<Game> {
    try {
      const game = await apiRequest('/games', {
        method: 'POST',
        body: JSON.stringify({
          name,
          players,
        }),
      }) as Game;
      return game;
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  },
  
  async clearAll(): Promise<void> {
    try {
      await apiRequest('/games', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to clear games:', error);
      throw error;
    }
  },
};

function isAdmin(username: string): boolean {
  return username === "user01";
}

export default function GamesList() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.currentUser);
  const isUserAdmin = currentUser ? isAdmin(currentUser.username) : false;

  useEffect(() => {
    async function loadGames() {
      try {
        const gamesData = await storage.listGames();
        setGames(gamesData);
      } catch (error) {
        console.error('Failed to load games:', error);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  // Filter games based on user access
  const visibleGames = isUserAdmin ? games : games.filter(g => {
    if (!currentUser) return false;
    const userRoom = currentUser.username === "user02" ? 1 : 
                    currentUser.username === "user03" ? 2 : 
                    currentUser.username === "user04" ? 3 : null;
    
    if (!userRoom) return false;
    
    const roomCompletion = g.roomCompletion || { room1: false, room2: false, room3: false };
    
    return g.status === `room${userRoom}` || 
           roomCompletion[`room${userRoom}` as keyof typeof roomCompletion] ||
           g.status === "completed";
  });

  const handleClearAll = async () => {
    if (confirm("Clear all games?")) {
      try {
        await storage.clearAll();
        setGames([]);
      } catch (error) {
        console.error('Failed to clear games:', error);
        alert('Failed to clear games. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading games...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          {isUserAdmin ? "All Games" : `My Games (${currentUser?.username})`}
        </h2>
        <p className="text-gray-600 mt-2">
          {isUserAdmin ? "Manage all games in the system" : "View your assigned games"}
        </p>
      </div>
      
      {isUserAdmin && (
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard/games/new">
            <button className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl px-6 py-3 text-base bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600">
              🎮 Create New Game
            </button>
          </Link>
          <button
            onClick={handleClearAll}
            className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl px-6 py-3 text-base bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
          >
            🗑️ Clear All
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleGames.map((g) => (
          <div key={g.id} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Link to={`/dashboard/games/${g.id}`} className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  {g.name}
                </Link>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  g.status === 'room1' ? 'bg-gradient-to-r from-orange-100 to-red-200 text-orange-800' :
                  g.status === 'room2' ? 'bg-gradient-to-r from-blue-100 to-cyan-200 text-blue-800' :
                  g.status === 'room3' ? 'bg-gradient-to-r from-sky-100 to-blue-200 text-sky-800' :
                  'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                }`}>
                  {g.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (g.roomCompletion?.room1 || false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {(g.roomCompletion?.room1 || false) ? '✅' : '⏳'} Room 1
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (g.roomCompletion?.room2 || false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {(g.roomCompletion?.room2 || false) ? '✅' : '⏳'} Room 2
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (g.roomCompletion?.room3 || false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {(g.roomCompletion?.room3 || false) ? '✅' : '⏳'} Room 3
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(g.createdAt).toLocaleDateString()}
                </span>
                <Link to={`/dashboard/games/${g.id}`}>
                  <button className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                    Open Game
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {visibleGames.length === 0 && (
          <div className="col-span-full">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                {isUserAdmin ? "No games yet" : "No games available"}
              </h3>
              <p className="text-gray-500">
                {isUserAdmin ? "Create your first game to get started" : "No games available for your access level"}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}