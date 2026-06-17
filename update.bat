@echo off
cd /d "%~dp0"
echo Updating TimeTrax...
echo.

echo Downloading latest version...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/coen593/timetrax/archive/refs/heads/main.zip' -OutFile '%TEMP%\timetrax.zip'"
if errorlevel 1 (
  echo.
  echo Download failed. Check your internet connection.
  pause
  exit /b 1
)

echo Extracting...
powershell -Command "Remove-Item '%TEMP%\timetrax-update' -Recurse -Force -ErrorAction SilentlyContinue; Expand-Archive '%TEMP%\timetrax.zip' -DestinationPath '%TEMP%\timetrax-update' -Force"

echo Installing update...
rd /S /Q "src" 2>nul
rd /S /Q "public" 2>nul
xcopy /E /Y /I /Q "%TEMP%\timetrax-update\timetrax-main\src" "src"
xcopy /E /Y /I /Q "%TEMP%\timetrax-update\timetrax-main\public" "public"
for %%f in (package.json package-lock.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js index.html) do (
  copy /Y "%TEMP%\timetrax-update\timetrax-main\%%f" "%%f" >nul 2>nul
)

del "%TEMP%\timetrax.zip" 2>nul
rd /S /Q "%TEMP%\timetrax-update" 2>nul

call npm install
call npm run build

echo.
echo Update complete! You can close this window.
pause
