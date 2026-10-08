@echo off
setlocal
cd /d "%~dp0app"
if errorlevel 1 goto failed
where node.exe >nul 2>nul
if errorlevel 1 (
    echo Node.js is missing. See DEVELOPMENT.md and reopen your terminal after setup.
    goto failed
)
where pnpm.cmd >nul 2>nul
if errorlevel 1 (
    echo pnpm is missing. See DEVELOPMENT.md and reopen your terminal after setup.
    goto failed
)
if not exist node_modules\vite\bin\vite.js (
    call pnpm.cmd install --frozen-lockfile
    if errorlevel 1 goto failed
)
echo Starting http://localhost:5173
echo Keep this window open. Press Ctrl+C to stop the preview.
call pnpm.cmd dev --host 127.0.0.1 --port 5173 --strictPort --open
if errorlevel 1 goto failed
exit /b 0
:failed
echo.
echo Preview could not start. Check the message above.
pause
exit /b 1
