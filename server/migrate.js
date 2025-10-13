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
  multipleStatements: true
};

// Read existing JSON data
async function readExistingData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'games.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing data found or error reading:', error.message);
    return { games: [] };
  }
}

// Initialize database
async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true
  });

  // Read and execute schema
  const schemaPath = path.join(__dirname, 'database', 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf8');
  await connection.execute(schema);
  
  await connection.end();
  console.log('Database initialized successfully');
}

// Migrate data to MySQL
async function migrateData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const existingData = await readExistingData();
    console.log(`Found ${existingData.games.length} games to migrate`);

    for (const game of existingData.games) {
      console.log(`Migrating game: ${game.name} (${game.id})`);

      // Insert game
      await connection.execute(
        `INSERT INTO games (id, name, status, room1_completed, room2_completed, room3_completed, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?/1000))`,
        [
          game.id,
          game.name,
          game.status,
          game.roomCompletion?.room1 || false,
          game.roomCompletion?.room2 || false,
          game.roomCompletion?.room3 || false,
          game.createdAt
        ]
      );

      // Insert players
      for (const player of game.players || []) {
        await connection.execute(
          `INSERT INTO players (id, game_id, player_id, name) 
           VALUES (UUID(), ?, ?, ?)`,
          [game.id, player.id, player.name]
        );
      }

      // Insert scores
      for (const score of game.scores || []) {
        for (const entry of score.entries || []) {
          await connection.execute(
            `INSERT INTO scores (game_id, player_id, room_id, object_index, points) 
             VALUES (?, ?, ?, ?, ?)`,
            [game.id, score.playerId, score.roomId, entry.objectIndex, entry.points]
          );
        }
      }
    }

    console.log('Migration completed successfully!');
    
    // Verify migration
    const [games] = await connection.execute('SELECT COUNT(*) as count FROM games');
    const [players] = await connection.execute('SELECT COUNT(*) as count FROM players');
    const [scores] = await connection.execute('SELECT COUNT(*) as count FROM scores');
    
    console.log(`Verification: ${games[0].count} games, ${players[0].count} players, ${scores[0].count} scores`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Main migration function
async function main() {
  try {
    console.log('Starting migration from JSON to MySQL...');
    
    // Initialize database
    await initializeDatabase();
    
    // Migrate data
    await migrateData();
    
    console.log('Migration completed successfully!');
    console.log('You can now update your backend to use MySQL instead of JSON files.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  main();
}

module.exports = { migrateData, initializeDatabase };
