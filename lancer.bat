@echo off
title Librairie - Application
cd /d C:\Users\yassi\Downloads\librairie-complete\librairie-complete\backend

echo ============================================
echo   LIBRAIRIE - Demarrage
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe ou pas dans le PATH.
  pause
  exit /b
)

set URL=http://localhost:3001

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 (
  echo L'application est deja en cours d'execution.
  echo Ouverture du navigateur...
  start "" %URL%
  exit /b
)

echo ============================================
echo   Application : %URL%
echo.
echo   Comptes : voir le fichier interne (non affiche pour securite)
echo.
echo   Pour ARRETER : ferme cette fenetre.
echo ============================================
echo.

start "" %URL%
node src/index.js

pause
