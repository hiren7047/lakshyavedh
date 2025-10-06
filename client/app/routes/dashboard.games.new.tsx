import { useNavigate } from "react-router";
import { useState } from "react";
import { storage, type Player } from "../lib/storage";
import { Button, Card, Input, SectionTitle } from "../components/ui";
import { useAuthStore } from "../store/auth";

export function meta() {
  return [{ title: "Target Shooting - New Game" }];
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
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Access Restricted</h2>
              <p className="text-yellow-700 text-lg">
                Only user01 (Admin) can create new Target Shooting games.
              </p>
        </Card>
      </main>
    );
  }

  async function create() {
    try {
      const playerObjs: Player[] = players.map((p, i) => ({
        id: `p${i + 1}`,
        name: p || `Player ${i + 1}`,
      }));
      const game = await storage.createGame(name || "Target Shooting", playerObjs);
      navigate(`/dashboard/games/${game.id}`);
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
            <SectionTitle>Create New Target Shooting Game</SectionTitle>
        <p className="text-gray-600 mt-2">Set up a new target shooting game with 5 players</p>
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border border-orange-200">
          <p className="text-orange-800 font-medium text-sm">
            Players will progress through: Fire Room → Water Room → Air Room
          </p>
        </div>
      </div>
      
      <Card className="bg-white/90 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-700">Game Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter game name..."
              className="text-lg"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Players (5)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Player {i + 1}</label>
                  <Input
                    value={p}
                    onChange={(e) =>
                      setPlayers((arr) => arr.map((v, idx) => (idx === i ? e.target.value : v)))
                    }
                    placeholder={`Player ${i + 1} name`}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center pt-6">
                <Button variant="fire" onClick={create} size="lg" className="shadow-xl">
                  🔥 Create Target Shooting Game
                </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate("/dashboard/games")}
              size="lg"
              className="shadow-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}


