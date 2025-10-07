// Netlify Functions API - Simple and Clean
const fs = require('fs').promises;
const crypto = require('crypto');

// Database file path (Netlify uses /tmp for writable storage)
const DB_FILE = '/tmp/games.json';

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access('/tmp');
  } catch {
    await fs.mkdir('/tmp', { recursive: true });
  }
}

// Read database from file
async function readDB() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { games: [] };
  }
}

// Write database to file
async function writeDB(data) {
  await ensureDataDir();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Netlify Functions handler
exports.handler = async (event, context) => {
  const { httpMethod, path, body, queryStringParameters } = event;
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
        // Ignore parsing errors for empty bodies
      }
    }

    // Route handling
    if (path === '/api/health' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true })
      };
    }

    if (path === '/api/games' && httpMethod === 'GET') {
      const db = await readDB();
      const games = db.games.sort((a, b) => b.createdAt - a.createdAt);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(games)
      };
    }

    if (path.startsWith('/api/games/') && httpMethod === 'GET') {
      const gameId = path.split('/')[3];
      const db = await readDB();
      const game = db.games.find(g => g.id === gameId);
      if (!game) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Game not found' })
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(game)
      };
    }

    if (path === '/api/games' && httpMethod === 'POST') {
      const db = await readDB();
      const game = {
        id: crypto.randomUUID(),
        ...requestBody,
        createdAt: Date.now(),
        scores: [],
        status: "room1",
        roomCompletion: {
          room1: false,
          room2: false,
          room3: false,
        }
      };
      db.games.push(game);
      await writeDB(db);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(game)
      };
    }

    if (path.startsWith('/api/games/') && httpMethod === 'PUT') {
      const gameId = path.split('/')[3];
      const db = await readDB();
      const gameIndex = db.games.findIndex(g => g.id === gameId);
      if (gameIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Game not found' })
        };
      }
      db.games[gameIndex] = { ...db.games[gameIndex], ...requestBody };
      await writeDB(db);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(db.games[gameIndex])
      };
    }

    if (path === '/api/games' && httpMethod === 'DELETE') {
      await writeDB({ games: [] });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'All games cleared' })
      };
    }

    // 404 for unmatched routes
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
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
