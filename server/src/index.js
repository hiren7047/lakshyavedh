const express=require('express');
const cors=require('cors');
const path=require('path');
const crypto=require('crypto');
const Database = require('./database');
require('dotenv').config();

const app=express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://lakshyavedh.vercel.app',
    'https://lakshyavedh.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check with database status
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await Database.testConnection();
    res.json({ 
      ok: true, 
      database: dbConnected ? 'connected' : 'disconnected',
      storage: dbConnected ? 'mysql' : 'json',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      database: 'error',
      storage: 'unknown',
      error: error.message 
    });
  }
});

// Database API endpoints
app.get('/api/games', async (req, res) => {
  try {
    const games = await Database.getAllGames();
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to read games' });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const game = await Database.getGameById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to read game' });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const gameData = {
      id: crypto.randomUUID(),
      ...req.body,
      createdAt: Date.now(),
      scores: req.body.scores || [],
      status: req.body.status || "room1",
      roomCompletion: req.body.roomCompletion || {
        room1: false,
        room2: false,
        room3: false,
      }
    };
    const game = await Database.createGame(gameData);
    res.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

app.put('/api/games/:id', async (req, res) => {
  try {
    const game = await Database.updateGame(req.params.id, req.body);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

app.delete('/api/games', async (req, res) => {
  try {
    const result = await Database.deleteAllGames();
    res.json(result);
  } catch (error) {
    console.error('Error clearing games:', error);
    res.status(500).json({ error: 'Failed to clear games' });
  }
});

// Serve client build if exists (for local development)
if (process.env.NODE_ENV !== 'production') {
  const clientBuild = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuild));
  
  // Catch-all handler for client-side routing (local dev only)
  app.use((req, res) => {
    try {
      res.sendFile(path.join(clientBuild, 'index.html'));
    } catch {
      res.status(404).send('Client not built');
    }
  });
}

const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log('server on '+PORT));
