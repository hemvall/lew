@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Installez Node.js 22 ou plus avant de lancer lew.
  pause
  exit /b 1
)
if not exist node_modules\pg\package.json (
  call npm ci
  if errorlevel 1 exit /b 1
)
if not exist .env (
  copy .env.example .env >nul
  echo Le fichier .env a ete cree. Renseignez DATABASE_URL puis relancez ce fichier.
  notepad .env
  exit /b 0
)
echo Demarrage de lew... L'adresse sera affichee par le serveur.
node --env-file=.env server.mjs
if errorlevel 1 pause
