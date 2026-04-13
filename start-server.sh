#!/bin/bash
set -e
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

PROJECT_DIR="/Users/matthewfung/Claude App/mahjong-matchmaker"
cd "$PROJECT_DIR"

if [ ! -d "server/node_modules" ]; then
  echo "Installing server dependencies..."
  cd server && npm install && cd "$PROJECT_DIR"
fi

cd server && node index.js
