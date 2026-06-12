#!/bin/bash

# Install frontend dependencies if node_modules is missing or package.json is newer.
if [ ! -d ~/pcarmarket/frontend/node_modules ] || \
   [ ~/pcarmarket/frontend/package.json -nt ~/pcarmarket/frontend/node_modules ]; then
  echo "Installing frontend dependencies..."
  npm --prefix ~/pcarmarket/frontend install
fi

osascript -e 'tell app "Terminal" to do script "source ~/pcarmarket/venv/bin/activate && cd ~/pcarmarket/backend && uvicorn app.main:app --reload"'
osascript -e 'tell app "Terminal" to do script "cd ~/pcarmarket/frontend && npm run dev"'
echo "Servers starting — open http://localhost:5173"
