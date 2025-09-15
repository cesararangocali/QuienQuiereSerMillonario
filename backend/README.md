# ¿Quién quiere ser santo? — Backend

API Express + SQLite para el juego.

## Uso rápido

1. Crea un archivo `.env` basado en `.env.example`.
2. Instala dependencias y ejecuta el seed.
3. Arranca el servidor.

## Endpoints claves
- `POST /api/auth/login` (admin)
- `POST /api/admin/lock|unlock` (admin, con PIN)
- `GET /api/game/question/:difficulty`
- `POST /api/game/lifeline/50-50`
- `GET /api/game/lifeline/verse/:questionId`
- `POST /api/game/score`
- `GET /api/ranking`
