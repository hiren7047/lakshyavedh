// api/index.js - Single API file for Vercel
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Database file path (Vercel uses /tmp for writable storage)
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

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Database API endpoints
app.get('/api/games', async (req, res) => {
  try {
    const db = await readDB();
    const games = db.games.sort((a, b) => b.createdAt - a.createdAt);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read games' });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const db = await readDB();
    const game = db.games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read game' });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const db = await readDB();
    const game = {
      id: crypto.randomUUID(),
      ...req.body,
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
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

app.put('/api/games/:id', async (req, res) => {
  try {
    const db = await readDB();
    const gameIndex = db.games.findIndex(g => g.id === req.params.id);
    if (gameIndex === -1) {
      return res.status(404).json({ error: 'Game not found' });
    }
    db.games[gameIndex] = { ...db.games[gameIndex], ...req.body };
    await writeDB(db);
    res.json(db.games[gameIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update game' });
  }
});

app.delete('/api/games', async (req, res) => {
  try {
    await writeDB({ games: [] });
    res.json({ message: 'All games cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear games' });
  }
});

module.exports = app;
