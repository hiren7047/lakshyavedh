export type Player = {
  id: string; // p1..p5
  name: string;
};

export type RoomId = 1 | 2 | 3;

export type ScoreEntry = {
  objectIndex: number; // 1..40
  points: number; // positive/negative from table
};

export type PlayerRoomScores = {
  playerId: string;
  roomId: RoomId;
  entries: ScoreEntry[]; // 40 entries max
};

export type Game = {
  id: string;
  name: string; // room name or tournament name
  createdAt: number;
  players: Player[]; // 5 players
  // Per room scores keyed by player
  scores: PlayerRoomScores[];
  status: "room1" | "room2" | "room3" | "completed";
  roomCompletion: {
    room1: boolean;
    room2: boolean;
    room3: boolean;
  };
};

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// API helper functions
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

export const storage = {
  async listGames(): Promise<Game[]> {
    try {
      const games = await apiRequest('/games') as Game[];
      // Ensure all games have roomCompletion property
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
      // Ensure game has roomCompletion property
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


