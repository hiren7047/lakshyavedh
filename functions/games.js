// Netlify Functions API - Games endpoint
const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Database configuration for Netlify
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u533366727_lakshyavedh',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
};

// Database helper functions
class NetlifyDatabase {
  static async getAllGames() {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [games] = await connection.execute(
        'SELECT * FROM games ORDER BY created_at DESC'
      );

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
      await connection.end();
    }
  }

  static async createGame(gameData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      await connection.beginTransaction();

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

      if (gameData.players && gameData.players.length > 0) {
        for (const player of gameData.players) {
          await connection.execute(
            `INSERT INTO players (id, game_id, player_id, name) 
             VALUES (UUID(), ?, ?, ?)`,
            [gameData.id, player.id, player.name]
          );
        }
      }

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
      return gameData;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async deleteAllGames() {
    const connection = await mysql.createConnection(dbConfig);
    try {
      await connection.execute('DELETE FROM games');
      return { message: 'All games cleared' };
    } finally {
      await connection.end();
    }
  }
}

// Netlify Functions handler
exports.handler = async (event, context) => {
  console.log('Games function called:', event.httpMethod, event.path);
  
  const { httpMethod, body, queryStringParameters } = event;
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse body if it exists
    let requestBody = {};
    if (body) {
      try {
        requestBody = JSON.parse(body);
      } catch (e) {
        console.log('Body parsing error:', e);
      }
    }

    console.log('Request body:', requestBody);

    // Route handling
    if (httpMethod === 'GET') {
      const games = await NetlifyDatabase.getAllGames();
      console.log('Returning games:', games.length);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(games)
      };
    }

    if (httpMethod === 'POST') {
      const gameData = {
        id: crypto.randomUUID(),
        ...requestBody,
        createdAt: Date.now(),
        scores: requestBody.scores || [],
        status: requestBody.status || "room1",
        roomCompletion: requestBody.roomCompletion || {
          room1: false,
          room2: false,
          room3: false,
        }
      };
      const game = await NetlifyDatabase.createGame(gameData);
      console.log('Created game:', game.id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(game)
      };
    }

    if (httpMethod === 'DELETE') {
      const result = await NetlifyDatabase.deleteAllGames();
      console.log('Cleared all games');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    // 404 for unmatched routes
    console.log('Method not allowed:', httpMethod);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};