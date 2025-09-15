# Guía rápida — Desarrollo y despliegue

Este proyecto incluye frontend (Vue 3 + Vite + Vuetify) y backend (Node/Express + Socket.IO). La opción más simple en desarrollo es usar el proxy de Vite.

## Desarrollo (simple recomendado)

1) Backend
```powershell
cd .\backend\
npm install
npm run dev
```
- Verifica: http://localhost:4000/health → `{ ok: true }`

2) Frontend
```powershell
cd .\frontend\
npm install
npm run dev
```
- Abre http://localhost:5173
- Proxy Vite: `/api` y `/socket.io` → `http://localhost:4000`
- No definas `VITE_SOCKET_URL` en desarrollo.

Notas:
- Si aparece `ECONNREFUSED` para `/socket.io`, el backend no está corriendo o no escucha en `:4000`.

## Producción

A) Mismo dominio (reverse proxy recomendado)
- Servir `frontend/dist` estático y proxyear:
  - `/api` → `http://localhost:4000`
  - `/socket.io` → `http://localhost:4000` (con Upgrade WebSocket)

Ejemplo Nginx:
```
server {
  listen 80;
  server_name tu-dominio;
  root /var/www/qqss-frontend;
  location / { try_files $uri /index.html; }
  location /api { proxy_pass http://127.0.0.1:4000; proxy_set_header Host $host; }
  location /socket.io/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass http://127.0.0.1:4000;
  }
}
```

B) Dominios separados
- Define en build: `VITE_SOCKET_URL=https://tu-backend`
- Backend Socket.IO: CORS ya permite `origin: '*'` (ajusta si deseas restringir)

## Build/Deploy

Frontend build:
```powershell
cd .\frontend\
npm run build
```
- Artefactos en `frontend/dist`

Backend producción:
```powershell
cd .\backend\
setx NODE_ENV production
npm run start
```

## Competitivo: temporizador y bonus
- 30s por pregunta; el backend envía `deadline` y `durationMs`.
- Bonus: +5 pts/segundo restante si aciertas.
- Se persiste `pointsAwarded` por respuesta.

## Scripts útiles
- Backend: `npm run dev`, `npm run start`, `npm run seed`, `npm run seed:questions`
- Frontend: `npm run dev`, `npm run build`
