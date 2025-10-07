import { useState, useEffect } from "react";
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

function isAdmin(username: string): boolean {
  return username === "user01";
}

export default function Leaderboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.currentUser);
  const isUserAdmin = currentUser ? isAdmin(currentUser.username) : false;

  useEffect(() => {
    async function loadGames() {
      try {
        const gamesData = await apiRequest('/games');
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
    
    return g.status === "completed" || 
           roomCompletion[`room${userRoom}` as keyof typeof roomCompletion];
  });

  function calculateGameTotals(game: Game) {
    return game.players.map(player => {
      const total = game.scores
        .filter(s => s.playerId === player.id)
        .reduce((sum, s) => sum + s.entries.reduce((a, b) => a + b.points, 0), 0);
      return { ...player, total };
    }).sort((a, b) => b.total - a.total);
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          🏆 Game Leaderboard
        </h2>
        <p className="text-gray-600 mt-2">View rankings and results for all games</p>
      </div>
      
      {visibleGames.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl text-center py-16">
          <div className="text-8xl mb-6">🏆</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">
            {isUserAdmin ? "No games completed yet" : "No games available"}
          </h3>
          <p className="text-gray-500 text-lg">
            {isUserAdmin ? "Complete some games to see rankings" : "No games available for your access level"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {visibleGames.map((game) => {
            const rankings = calculateGameTotals(game);
            const isCompleted = game.status === "completed";
            
            return (
              <div key={game.id} className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${
                isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">{game.name}</h3>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                        : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800'
                    }`}>
                      {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {rankings.map((player, index) => (
                      <div key={player.id} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        index === 0 && isCompleted 
                          ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 shadow-lg transform scale-105' 
                          : 'bg-white/80 hover:bg-white shadow-md'
                      }`}>
                        <div className="flex items-center gap-4">
                          <span className={`text-2xl font-bold ${
                            index === 0 && isCompleted ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="font-bold text-lg text-gray-800">{player.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xl font-bold ${
                            index === 0 && isCompleted ? 'text-yellow-600' : 'text-gray-900'
                          }`}>
                            {player.total} points
                          </span>
                          {index === 0 && isCompleted && (
                            <span className="text-3xl animate-bounce">👑</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!isCompleted && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <p className="font-bold mb-3 text-center">Room Progress:</p>
                        <div className="flex justify-center gap-6">
                          <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                            (game.roomCompletion?.room1 || false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Room 1 {(game.roomCompletion?.room1 || false) ? '✅' : '⏳'}
                          </span>
                          <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                            (game.roomCompletion?.room2 || false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Room 2 {(game.roomCompletion?.room2 || false) ? '✅' : '⏳'}
                          </span>
                          <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                            (game.roomCompletion?.room3 || false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Room 3 {(game.roomCompletion?.room3 || false) ? '✅' : '⏳'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}