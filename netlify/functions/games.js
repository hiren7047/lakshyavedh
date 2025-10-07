// Netlify Functions API - Games endpoint
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
      const db = await readDB();
      const games = db.games.sort((a, b) => b.createdAt - a.createdAt);
      console.log('Returning games:', games.length);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(games)
      };
    }

    if (httpMethod === 'POST') {
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
      console.log('Created game:', game.id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(game)
      };
    }

    if (httpMethod === 'DELETE') {
      await writeDB({ games: [] });
      console.log('Cleared all games');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'All games cleared' })
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
