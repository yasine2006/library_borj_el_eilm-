@echo off
title Librairie - Tunnel Cloudflare
cd /d C:\Users\yassi\Downloads\librairie-complete\librairie-complete

echo ============================================
echo   LIBRAIRIE - Demarrage Tunnel
echo ============================================
echo.

echo [1/2] Demarrage du backend...
cd backend
start "Backend-Server" /min node src/index.js
cd ..
echo Backend demarre sur http://localhost:3001
echo.

echo [2/2] Demarrage du tunnel Cloudflare...
echo.
echo ============================================
echo   ENVOIE CE LIEN AU CLIENT:
echo.
echo   Le lien va apparaitre en bas de cette fenetre
echo.
echo ============================================
echo.

cloudflared.exe tunnel --url http://localhost:3001

pause
