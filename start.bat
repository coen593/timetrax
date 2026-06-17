@echo off
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  echo.
)

if not exist "dist" (
  echo Building TimeTrax...
  call npm run build
  echo.
)

echo TimeTrax is starting...
echo.
echo Keep this window open while using the app.
echo Close this window to stop.
echo.
npm run preview
