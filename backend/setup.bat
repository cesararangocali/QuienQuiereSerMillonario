@echo off
REM Setup script for Windows dev environment
if not exist .env (
  copy .env.example .env >nul
  echo ".env creado desde .env.example"
)

if not exist node_modules (
  echo Instalando dependencias...
  call npm install
)

node --env-file=.env src/utils/seed.js
