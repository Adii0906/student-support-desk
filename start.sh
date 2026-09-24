#!/usr/bin/env bash
# One command to run everything on Linux / macOS:  ./start.sh
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
export UVICORN_RELOAD=false

echo "==> Backend setup"
cd "$ROOT/backend"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
.venv/bin/python -m pip install --upgrade pip -q
.venv/bin/python -m pip install -r requirements.txt -q

.venv/bin/python run.py &
BACKEND_PID=$!
trap 'echo; echo "Stopping backend"; kill $BACKEND_PID 2>/dev/null' EXIT INT TERM

echo "==> Waiting for the API"
for i in $(seq 1 30); do
  if curl -s http://127.0.0.1:8000/api/health > /dev/null 2>&1; then
    echo "    API is up"
    break
  fi
  sleep 1
done

echo "==> Frontend setup"
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  npm install
fi
echo "==> Open http://localhost:5173"
npm run dev -- --host 0.0.0.0
