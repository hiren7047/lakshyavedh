# MySQL Setup Guide for Lakshyavedh Project

## Overview
This guide will help you migrate from JSON file storage to MySQL database for better data persistence and reliability.

## Prerequisites
- MySQL Server installed on your system
- Node.js 18+ installed
- Access to MySQL root user or ability to create databases

## Step 1: Install MySQL Dependencies

```bash
cd server
npm install mysql2 dotenv
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Edit `.env` file with your MySQL credentials:
```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=u533366727_lakshyavedh

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Step 3: Setup MySQL Database

### Option A: Using MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source server/database/schema.sql
```

### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the `server/database/schema.sql` file
4. Execute the script

## Step 4: Migrate Existing Data

Run the migration script to transfer your existing JSON data to MySQL:

```bash
cd server
node migrate.js
```

This will:
- Initialize the database schema
- Migrate all existing games, players, and scores
- Verify the migration was successful

## Step 5: Test the Migration

1. Start the server:
```bash
cd server
npm start
```

2. Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "ok": true,
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

3. Test the games endpoint:
```bash
curl http://localhost:5000/api/games
```

## Step 6: Update Production Environment

For production deployment, make sure to:

1. Set up MySQL database on your hosting provider
2. Update environment variables with production credentials
3. Run the migration script on production
4. Update your deployment configuration

## Database Schema

The MySQL database includes these tables:

### games
- `id` (VARCHAR(36)) - Primary key
- `name` (VARCHAR(255)) - Game name
- `status` (VARCHAR(50)) - Current room status
- `room1_completed` (BOOLEAN) - Room 1 completion status
- `room2_completed` (BOOLEAN) - Room 2 completion status
- `room3_completed` (BOOLEAN) - Room 3 completion status
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### players
- `id` (VARCHAR(36)) - Primary key
- `game_id` (VARCHAR(36)) - Foreign key to games
- `player_id` (VARCHAR(10)) - Player identifier
- `name` (VARCHAR(255)) - Player name
- `created_at` (TIMESTAMP) - Creation timestamp

### scores
- `id` (INT) - Auto-increment primary key
- `game_id` (VARCHAR(36)) - Foreign key to games
- `player_id` (VARCHAR(10)) - Player identifier
- `room_id` (INT) - Room number
- `object_index` (INT) - Object index
- `points` (INT) - Points scored
- `created_at` (TIMESTAMP) - Creation timestamp

## Benefits of MySQL Migration

1. **Data Persistence**: Data survives server restarts and deployments
2. **Concurrent Access**: Multiple users can access data simultaneously
3. **Data Integrity**: Foreign key constraints ensure data consistency
4. **Scalability**: Better performance with large datasets
5. **Backup & Recovery**: Standard database backup procedures
6. **Query Optimization**: Indexed queries for faster data retrieval

## Troubleshooting

### Connection Issues
- Verify MySQL server is running
- Check credentials in `.env` file
- Ensure database exists and user has permissions

### Migration Issues
- Check that `games.json` exists and is valid
- Verify MySQL user has CREATE/DROP privileges
- Check console output for specific error messages

### Performance Issues
- Monitor database connection pool usage
- Check query execution times
- Consider adding indexes for frequently queried fields

## Backup Strategy

### Daily Backup Script
```bash
#!/bin/bash
mysqldump -u root -p u533366727_lakshyavedh > backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
mysql -u root -p u533366727_lakshyavedh < backup_20240101.sql
```

## Security Considerations

1. Use strong passwords for database users
2. Limit database user permissions to only necessary operations
3. Use SSL connections in production
4. Regularly update MySQL server
5. Monitor database access logs

## Next Steps

After successful migration:
1. Remove old JSON files (optional, keep as backup initially)
2. Update deployment scripts to include MySQL setup
3. Set up automated database backups
4. Monitor database performance
5. Consider adding database monitoring tools
