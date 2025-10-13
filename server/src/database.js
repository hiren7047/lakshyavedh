const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u533366727_lakshyavedh',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Fallback JSON storage
const DB_FILE = path.join(__dirname, '../data/games.json');

// Check if MySQL is available
let mysqlAvailable = false;
let pool = null;

async function checkMySQLConnection() {
  try {
    const testConnection = await mysql.createConnection(dbConfig);
    await testConnection.ping();
    await testConnection.end();
    mysqlAvailable = true;
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL connection established');
    return true;
  } catch (error) {
    console.log('⚠️ MySQL not available, falling back to JSON storage:', error.message);
    mysqlAvailable = false;
    return false;
  }
}

// Initialize connection check
checkMySQLConnection();

// JSON fallback functions
async function ensureDataDir() {
  const dataDir = path.dirname(DB_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readJSONDB() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { games: [] };
  }
}

async function writeJSONDB(data) {
  await ensureDataDir();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Database helper functions
class Database {
  // Get all games with players and scores
  static async getAllGames() {
    if (mysqlAvailable && pool) {
      const connection = await pool.getConnection();
      try {
        // Get games
        const [games] = await connection.execute(
          'SELECT * FROM games ORDER BY created_at DESC'
        );

        // Get players and scores for each game
        const gamesWithData = await Promise.all(
          games.map(async (game) => {
            const [players] = await connection.execute(
              'SELECT player_id as id, name FROM players WHERE game_id = ?',
              [game.id]
            );

            const [scores] = await connection.execute(
              'SELECT player_id, room_id, object_index, points FROM scores WHERE game_id = ? ORDER BY player_id, room_id',
              [game.id]
            );

            // Group scores by player and room
            const scoresByPlayer = {};
            scores.forEach(score => {
              if (!scoresByPlayer[score.player_id]) {
                scoresByPlayer[score.player_id] = {};
              }
              if (!scoresByPlayer[score.player_id][score.room_id]) {
                scoresByPlayer[score.player_id][score.room_id] = [];
              }
              scoresByPlayer[score.player_id][score.room_id].push({
                objectIndex: score.object_index,
                points: score.points
              });
            });

            // Convert to the expected format
            const scoresArray = Object.keys(scoresByPlayer).map(playerId => ({
              playerId,
              roomId: parseInt(Object.keys(scoresByPlayer[playerId])[0]) || 1,
              entries: Object.values(scoresByPlayer[playerId])[0] || []
            }));

            return {
              id: game.id,
              name: game.name,
              players: players,
              createdAt: new Date(game.created_at).getTime(),
              scores: scoresArray,
              status: game.status,
              roomCompletion: {
                room1: game.room1_completed,
                room2: game.room2_completed,
                room3: game.room3_completed
              }
            };
          })
        );

        return gamesWithData;
      } finally {
        connection.release();
      }
    } else {
      // Fallback to JSON storage
      const db = await readJSONDB();
      return db.games.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

  // Get single game by ID
  static async getGameById(gameId) {
    if (mysqlAvailable && pool) {
      const connection = await pool.getConnection();
      try {
        const [games] = await connection.execute(
          'SELECT * FROM games WHERE id = ?',
          [gameId]
        );

        if (games.length === 0) {
          return null;
        }

        const game = games[0];

        // Get players
        const [players] = await connection.execute(
          'SELECT player_id as id, name FROM players WHERE game_id = ?',
          [gameId]
        );

        // Get scores
        const [scores] = await connection.execute(
          'SELECT player_id, room_id, object_index, points FROM scores WHERE game_id = ? ORDER BY player_id, room_id',
          [gameId]
        );

        // Group scores by player and room
        const scoresByPlayer = {};
        scores.forEach(score => {
          if (!scoresByPlayer[score.player_id]) {
            scoresByPlayer[score.player_id] = {};
          }
          if (!scoresByPlayer[score.player_id][score.room_id]) {
            scoresByPlayer[score.player_id][score.room_id] = [];
          }
          scoresByPlayer[score.player_id][score.room_id].push({
            objectIndex: score.object_index,
            points: score.points
          });
        });

        // Convert to the expected format
        const scoresArray = Object.keys(scoresByPlayer).map(playerId => ({
          playerId,
          roomId: parseInt(Object.keys(scoresByPlayer[playerId])[0]) || 1,
          entries: Object.values(scoresByPlayer[playerId])[0] || []
        }));

        return {
          id: game.id,
          name: game.name,
          players: players,
          createdAt: new Date(game.created_at).getTime(),
          scores: scoresArray,
          status: game.status,
          roomCompletion: {
            room1: game.room1_completed,
            room2: game.room2_completed,
            room3: game.room3_completed
          }
        };
      } finally {
        connection.release();
      }
    } else {
      // Fallback to JSON storage
      const db = await readJSONDB();
      return db.games.find(g => g.id === gameId) || null;
    }
  }

  // Create new game
  static async createGame(gameData) {
    if (mysqlAvailable && pool) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Insert game
        await connection.execute(
          `INSERT INTO games (id, name, status, room1_completed, room2_completed, room3_completed) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            gameData.id,
            gameData.name,
            gameData.status || 'room1',
            gameData.roomCompletion?.room1 || false,
            gameData.roomCompletion?.room2 || false,
            gameData.roomCompletion?.room3 || false
          ]
        );

        // Insert players
        if (gameData.players && gameData.players.length > 0) {
          for (const player of gameData.players) {
            await connection.execute(
              `INSERT INTO players (id, game_id, player_id, name) 
               VALUES (UUID(), ?, ?, ?)`,
              [gameData.id, player.id, player.name]
            );
          }
        }

        // Insert scores
        if (gameData.scores && gameData.scores.length > 0) {
          for (const score of gameData.scores) {
            for (const entry of score.entries || []) {
              await connection.execute(
                `INSERT INTO scores (game_id, player_id, room_id, object_index, points) 
                 VALUES (?, ?, ?, ?, ?)`,
                [gameData.id, score.playerId, score.roomId, entry.objectIndex, entry.points]
              );
            }
          }
        }

        await connection.commit();
        return await this.getGameById(gameData.id);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } else {
      // Fallback to JSON storage
      const db = await readJSONDB();
      db.games.push(gameData);
      await writeJSONDB(db);
      return gameData;
    }
  }

  // Update game
  static async updateGame(gameId, updateData) {
    if (mysqlAvailable && pool) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Update game basic info
        if (updateData.name || updateData.status || updateData.roomCompletion) {
          await connection.execute(
            `UPDATE games SET 
             name = COALESCE(?, name),
             status = COALESCE(?, status),
             room1_completed = COALESCE(?, room1_completed),
             room2_completed = COALESCE(?, room2_completed),
             room3_completed = COALESCE(?, room3_completed)
             WHERE id = ?`,
            [
              updateData.name,
              updateData.status,
              updateData.roomCompletion?.room1,
              updateData.roomCompletion?.room2,
              updateData.roomCompletion?.room3,
              gameId
            ]
          );
        }

        // Update players if provided
        if (updateData.players) {
          // Delete existing players
          await connection.execute('DELETE FROM players WHERE game_id = ?', [gameId]);
          
          // Insert new players
          for (const player of updateData.players) {
            await connection.execute(
              `INSERT INTO players (id, game_id, player_id, name) 
               VALUES (UUID(), ?, ?, ?)`,
              [gameId, player.id, player.name]
            );
          }
        }

        // Update scores if provided
        if (updateData.scores) {
          // Delete existing scores
          await connection.execute('DELETE FROM scores WHERE game_id = ?', [gameId]);
          
          // Insert new scores
          for (const score of updateData.scores) {
            for (const entry of score.entries || []) {
              await connection.execute(
                `INSERT INTO scores (game_id, player_id, room_id, object_index, points) 
                 VALUES (?, ?, ?, ?, ?)`,
                [gameId, score.playerId, score.roomId, entry.objectIndex, entry.points]
              );
            }
          }
        }

        await connection.commit();
        return await this.getGameById(gameId);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } else {
      // Fallback to JSON storage
      const db = await readJSONDB();
      const gameIndex = db.games.findIndex(g => g.id === gameId);
      if (gameIndex === -1) {
        return null;
      }
      db.games[gameIndex] = { ...db.games[gameIndex], ...updateData };
      await writeJSONDB(db);
      return db.games[gameIndex];
    }
  }

  // Delete all games
  static async deleteAllGames() {
    if (mysqlAvailable && pool) {
      const connection = await pool.getConnection();
      try {
        await connection.execute('DELETE FROM games');
        return { message: 'All games cleared' };
      } finally {
        connection.release();
      }
    } else {
      // Fallback to JSON storage
      await writeJSONDB({ games: [] });
      return { message: 'All games cleared' };
    }
  }

  // Test database connection
  static async testConnection() {
    if (mysqlAvailable && pool) {
      try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return true;
      } catch (error) {
        console.error('Database connection failed:', error);
        return false;
      }
    } else {
      // JSON storage is always available
      return true;
    }
  }
}

module.exports = Database;
