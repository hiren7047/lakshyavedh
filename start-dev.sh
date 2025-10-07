#!/bin/bash
echo "========================================"
echo "  Target Shooting Game - Development"
echo "========================================"
echo

echo "[1/3] Installing dependencies..."
npm run install-all
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "[2/3] Starting development servers..."
echo
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo
echo "Test Users:"
echo "- Admin: user01"
echo "- Fire Room: user02"
echo "- Water Room: user03"
echo "- Air Room: user04"
echo

echo "[3/3] Starting servers..."
npm run dev

echo
echo "Development servers stopped."
