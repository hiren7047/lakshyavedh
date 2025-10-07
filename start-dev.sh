#!/bin/bash
echo "Starting Target Shooting Game Development Environment..."
echo

echo "Installing dependencies..."
npm run install-all

echo
echo "Starting development servers..."
echo "Frontend will be available at: http://localhost:5173"
echo "Backend API will be available at: http://localhost:5000"
echo

npm run dev
