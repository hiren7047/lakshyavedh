import { useParams, useNavigate, Link } from "react-router";
import { storage, type Game, type RoomId, type PlayerRoomScores } from "../lib/storage";
import { useMemo, useState, useEffect } from "react";
import { Button, Card, SectionTitle, StatusBadge, PlayerCard, ObjectButton } from "../components/ui";
import { useAuthStore } from "../store/auth";

export function meta() {
  return [{ title: "Target Shooting - Game" }];
}

// Points table for 40 objects (from reference image). You can adjust later.
const POINTS: number[] = [
  2000, 100, 3000, 100, 3000,
  100, 3000, 2000, 200, 200,
  2000, 100, 100, 3000, 2000,
  3000, 200, 200, 200, 200,
  100, 2000, 2000, 100, 3000,
  2000, 100, 3000, 2000, 2000,
  3000, 3000, 200, 3000, 2000,
  200, 100, 2000, 100, 200,
];



function roomTitle(status: Game["status"]) {
  if (status === "room1") return "🔥 Fire Room";
  if (status === "room2") return "💧 Water Room";
  if (status === "room3") return "💨 Air Room";
  return "🏆 Completed";
}

function getRoomTheme(status: Game["status"]): "fire" | "water" | "air" {
  if (status === "room1") return "fire";
  if (status === "room2") return "water";
  if (status === "room3") return "air";
  return "fire";
}

function getUserRoomAccess(username: string): RoomId | null {
  if (username === "user01") return null; // Full admin access
  if (username === "user02") return 1;
  if (username === "user03") return 2;
  if (username === "user04") return 3;
  return null;
}

function isAdmin(username: string): boolean {
  return username === "user01";
}

export default function GameScreen() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [refresh, setRefresh] = useState(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    async function loadGame() {
      if (!gameId) return;
      try {
        const gameData = await storage.getGame(gameId);
        setGame(gameData || null);
      } catch (error) {
        console.error('Failed to load game:', error);
      } finally {
        setLoading(false);
      }
    }
    loadGame();
  }, [gameId, refresh]);

  const userRoomAccess = currentUser ? getUserRoomAccess(currentUser.username) : null;
  const isUserAdmin = currentUser ? isAdmin(currentUser.username) : false;
  const canAccessCurrentRoom = isUserAdmin || (userRoomAccess && game?.status === `room${userRoomAccess}`);

  const currentRoom: RoomId | null = useMemo(() => {
    if (!game) return null;
    if (game.status === "room1") return 1;
    if (game.status === "room2") return 2;
    if (game.status === "room3") return 3;
    return null;
  }, [game]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </main>
    );
  }

  if (!game) return <p>Game not found</p>;
  if (!currentUser) return <p>Please login</p>;

  async function addEntry(playerId: string, objectIndex: number) {
    if (!currentRoom || !canAccessCurrentRoom || !game) return;
    // Non-admin users can only add entries for their assigned room
    if (!isUserAdmin && userRoomAccess !== currentRoom) return;

    const entry = { objectIndex, points: POINTS[objectIndex - 1] };
    const scoresForPlayer = game.scores.find(
      (s) => s.playerId === playerId && s.roomId === currentRoom
    );
    if (scoresForPlayer) {
      const exists = scoresForPlayer.entries.some((e) => e.objectIndex === objectIndex);
      if (!exists) scoresForPlayer.entries.push(entry);
    } else {
      game.scores.push({ playerId, roomId: currentRoom, entries: [entry] });
    }
    
    try {
      await storage.saveGame(game);
      setRefresh((n) => n + 1);
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('Failed to save entry. Please try again.');
    }
  }

  function totalFor(playerId: string, roomId?: RoomId) {
    const relevant = game.scores.filter(
      (s) => s.playerId === playerId && (!roomId || s.roomId === roomId)
    );
    return relevant.reduce(
      (sum, s) => sum + s.entries.reduce((a, b) => a + b.points, 0),
      0
    );
  }

  async function completeRoom() {
    if (!currentRoom || !canAccessCurrentRoom || !game) return;
    // Only admin or the assigned user can complete their room
    if (!isUserAdmin && userRoomAccess !== currentRoom) return;

    // Mark room as completed
    const roomCompletion = game.roomCompletion || { room1: false, room2: false, room3: false };
    roomCompletion[`room${currentRoom}` as keyof typeof roomCompletion] = true;
    game.roomCompletion = roomCompletion;

    // Move to next room
    if (game.status === "room1") game.status = "room2";
    else if (game.status === "room2") game.status = "room3";
    else game.status = "completed";

    try {
      await storage.saveGame(game);
      setRefresh((n) => n + 1);
    } catch (error) {
      console.error('Failed to complete room:', error);
      alert('Failed to complete room. Please try again.');
    }
  }

  const maxObjects = 40;
  const currentRoomTheme = getRoomTheme(game.status);

  const isRoomCompleted = (room: RoomId) => (game.roomCompletion?.[`room${room}` as keyof typeof game.roomCompletion] || false);
  const isCurrentRoomLocked = currentRoom ? isRoomCompleted(currentRoom) : false;

  const canSubmitRoom = isUserAdmin || (userRoomAccess === currentRoom && !isCurrentRoomLocked);

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/games" className="text-orange-600 hover:underline">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{game.name}</h2>
        <StatusBadge status={game.status} />
      </div>

      {/* Room Access Info */}
      <Card className={`${isUserAdmin ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'}`}>
        <div className="text-sm">
          <p className={`font-medium ${isUserAdmin ? 'text-orange-900' : 'text-blue-900'}`}>
            {isUserAdmin ? '👑 Admin Access - Full Control' : 'Room Access Control:'}
          </p>
              <p className={`${isUserAdmin ? 'text-orange-700' : 'text-blue-700'}`}>
                {isUserAdmin
                  ? 'You can view all rooms, manage scores, and control game flow'
                  : '• user02 → Fire Room • user03 → Water Room • user04 → Air Room'
                }
              </p>
          <p className={`${isUserAdmin ? 'text-orange-700' : 'text-blue-700'} mt-1`}>
            Current user: <span className="font-medium">{currentUser.username}</span> |
            Access: {isUserAdmin ? 'All Rooms' : (userRoomAccess ? `Room ${userRoomAccess}` : "No room access")}
          </p>
        </div>
      </Card>

      {/* Room Completion Status */}
      <Card>
        <SectionTitle>Room Progress</SectionTitle>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className={`p-4 rounded-xl ${(game.roomCompletion?.room1 || false) ? 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-200' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <div className="text-center">
              <div className="text-2xl mb-2">🔥</div>
                  <div className="font-bold text-orange-800">Fire Room</div>
              <div className="text-sm">{(game.roomCompletion?.room1 || false) ? '✅ Completed' : '⏳ Pending'}</div>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${(game.roomCompletion?.room2 || false) ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <div className="text-center">
              <div className="text-2xl mb-2">💧</div>
                  <div className="font-bold text-blue-800">Water Room</div>
              <div className="text-sm">{(game.roomCompletion?.room2 || false) ? '✅ Completed' : '⏳ Pending'}</div>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${(game.roomCompletion?.room3 || false) ? 'bg-gradient-to-br from-sky-100 to-blue-100 border-sky-200' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <div className="text-center">
              <div className="text-2xl mb-2">💨</div>
                  <div className="font-bold text-sky-800">Air Room</div>
              <div className="text-sm">{(game.roomCompletion?.room3 || false) ? '✅ Completed' : '⏳ Pending'}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Scoring Table */}
      {game.status !== "completed" && (
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <SectionTitle>
              {isUserAdmin ? `${roomTitle(game.status)} - Admin View` : `${roomTitle(game.status)} - Target Entry`}
            </SectionTitle>
            {canSubmitRoom && (
              <Button variant={currentRoomTheme} onClick={completeRoom} disabled={isCurrentRoomLocked}>
                {isCurrentRoomLocked ? "Room Completed" : "Complete Room & Next"}
              </Button>
            )}
          </div>

          {!canAccessCurrentRoom && (
            <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4 rounded-lg text-red-700 dark:text-red-300 text-center">
              You do not have access to enter data for this room.
              {userRoomAccess && game.status !== `room${userRoomAccess}` && (
                <p className="mt-2">Please wait for previous rooms to be completed or check your assigned room.</p>
              )}
            </div>
          )}

          {canAccessCurrentRoom && game.status !== "completed" && (
            <div className="grid gap-6">
              {/* Object Buttons - Responsive grid layout: 3 players first row, 2 players second row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {game.players.map((player, index) => (
                  <div key={player.id} className={`space-y-3 ${
                    index >= 3 ? 'sm:col-span-2 lg:col-span-1' : ''
                  }`}>
                    <h3 className="text-lg font-bold text-center text-gray-800">
                      {player.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {Array.from({ length: maxObjects }).map((_, i) => {
                        const idx = i + 1;
                        const has = game.scores.some(
                          (s) =>
                            s.playerId === player.id &&
                            currentRoom === s.roomId &&
                            s.entries.some((e) => e.objectIndex === idx)
                        );
                        return (
                          <ObjectButton
                            key={idx}
                            objectIndex={idx}
                            isSelected={has}
                            onClick={() => addEntry(player.id, idx)}
                            disabled={isCurrentRoomLocked}
                            roomTheme={currentRoomTheme}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </Card>
      )}

      {game.status === "completed" && isUserAdmin && (
        <Card>
              <SectionTitle>🏆 Final Results - Target Shooting</SectionTitle>
          <ul className="mt-4 grid gap-2">
            {game.players
              .map((p) => ({ id: p.id, name: p.name, total: totalFor(p.id) }))
              .sort((a, b) => b.total - a.total)
              .map((p, i) => (
                <li key={p.id} className={`py-3 px-4 rounded-xl flex items-center justify-between ${i === 0 ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 font-bold text-yellow-800 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                  <span className="flex items-center gap-3">
                    {i === 0 && <span className="text-2xl">🏆</span>}
                    <span className="text-lg">#{i + 1} {p.name}</span>
                  </span>
                  <span className="text-lg font-bold">{p.total} points</span>
                </li>
              ))}
          </ul>
        </Card>
      )}

      {game.status === "completed" && !isUserAdmin && (
        <Card>
          <SectionTitle>🏆 Game Completed</SectionTitle>
          <div className="mt-4 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-4xl mb-3">🎉</div>
                <p className="text-green-800 font-medium text-lg">
                  Target Shooting Game Completed Successfully!
                </p>
                <p className="text-green-600 mt-2">
                  All three rooms (Fire, Water, Air) have been completed.
                </p>
            <p className="text-green-600 text-sm mt-1">
              Final results and rankings are available to admin only.
            </p>
          </div>
        </Card>
      )}
    </main>
  );
}