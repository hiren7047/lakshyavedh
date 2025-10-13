#!/bin/bash

echo "Setting up MySQL for Lakshyavedh Project..."
echo

echo "Step 1: Installing MySQL dependencies..."
cd server
npm install mysql2 dotenv
echo

echo "Step 2: Creating environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Created .env file. Please edit it with your MySQL credentials."
else
    echo ".env file already exists."
fi
echo

echo "Step 3: Please ensure MySQL server is running and update .env file with correct credentials."
echo "Then run: node migrate.js"
echo

echo "Step 4: After migration, start the server with: npm start"
echo

read -p "Press Enter to continue..."
