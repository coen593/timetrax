@echo off
cd /d "%~dp0"

echo Updating TimeTrax...
echo.

git pull
call npm install
call npm run build

echo.
echo Update complete! You can close this window.
pause
