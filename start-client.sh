#!/bin/bash
set -e
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

PROJECT_DIR="/Users/matthewfung/Claude App/mahjong-matchmaker"
cd "$PROJECT_DIR"

if [ ! -d "client/node_modules" ]; then
  echo "Installing client dependencies..."
  cd client && npm install && cd "$PROJECT_DIR"
fi

cd client && npm run dev
