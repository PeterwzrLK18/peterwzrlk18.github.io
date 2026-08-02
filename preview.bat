@echo off
rem One-click live preview: free the port, start pnpm dev, then open Edge.
setlocal

set "APP=%~dp0app"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "PORT=5173"

cd /d "%APP%"

rem 1) Kill any stale dev server on the port so we always get a fresh preview.
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    taskkill /PID %%p /F /T >nul 2>nul
)

rem 2) Run the dev server in its own window (hot reload; close it or Ctrl+C to stop).
start "Dev Server (pnpm dev)" cmd /k pnpm dev

rem 3) Wait until the server is up, then open the browser.
echo Waiting for http://localhost:%PORT% ...
:wait
curl -s -o nul http://localhost:%PORT%
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait
)

rem 4) Open the preview in Edge.
start "" "%EDGE%" http://localhost:%PORT%

echo.
echo Preview ready in Edge: http://localhost:%PORT%
echo The dev server runs in its own window. Keep it open for live reload;
echo close that window (or Ctrl+C) to stop.
endlocal