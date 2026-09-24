@echo off
REM One command to run everything on Windows:  start.bat
set ROOT=%~dp0
set UVICORN_RELOAD=false

cd /d "%ROOT%backend"
if not exist .venv (
  python -m venv .venv
)
.venv\Scripts\python -m pip install -r requirements.txt -q
start "Ticket API" cmd /k "set UVICORN_RELOAD=false && .venv\Scripts\python run.py"

cd /d "%ROOT%frontend"
if not exist node_modules (
  call npm install
)
echo Open http://localhost:5173
call npm run dev -- --host 0.0.0.0
