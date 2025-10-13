-- Lakshyavedh Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS u533366727_lakshyavedh;
USE u533366727_lakshyavedh;

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'room1',
    room1_completed BOOLEAN DEFAULT FALSE,
    room2_completed BOOLEAN DEFAULT FALSE,
    room3_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_per_game (game_id, player_id)
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(10) NOT NULL,
    room_id INT NOT NULL,
    object_index INT NOT NULL,
    points INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_game_player_room (game_id, player_id, room_id)
);

-- Indexes for better performance
CREATE INDEX idx_games_created_at ON games(created_at);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_scores_game_player ON scores(game_id, player_id);
