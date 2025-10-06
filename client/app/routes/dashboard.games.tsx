import { Link } from "react-router";
import { storage } from "../lib/storage";
import { Button, Card, SectionTitle, StatusBadge } from "../components/ui";
import { useAuthStore } from "../store/auth";
import { useState, useEffect } from "react";
import type { Game } from "../lib/storage";

export function meta() {
  return [{ title: "Games" }];
}

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
    
    // Ensure roomCompletion exists before accessing
    const roomCompletion = g.roomCompletion || { room1: false, room2: false, room3: false };
    
    // Show games where user's room is active or completed
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
        <SectionTitle>
          {isUserAdmin ? "All Games" : `My Games (${currentUser?.username})`}
        </SectionTitle>
        <p className="text-gray-600 mt-2">
          {isUserAdmin ? "Manage all games in the system" : "View your assigned games"}
        </p>
      </div>
      
      {isUserAdmin && (
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard/games/new">
            <Button variant="gradient" className="shadow-xl">
              🎮 Create New Game
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleClearAll}
            className="shadow-xl"
          >
            🗑️ Clear All
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleGames.map((g) => (
          <Card key={g.id} className="bg-white/90 backdrop-blur-sm hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Link to={`/dashboard/games/${g.id}`} className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  {g.name}
                </Link>
                <StatusBadge status={g.status} />
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
                  <Button variant="primary" size="sm">
                    Open Game
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
        
        {visibleGames.length === 0 && (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                {isUserAdmin ? "No games yet" : "No games available"}
              </h3>
              <p className="text-gray-500">
                {isUserAdmin ? "Create your first game to get started" : "No games available for your access level"}
              </p>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}


