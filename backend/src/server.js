import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { sequelize } from './config/db.js';
import { createAdminIfNotExists } from './models/User.js';
import routes from './routes/index.js';
import { attachGameSocket } from './services/realtime.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', routes);

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
attachGameSocket(io);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
  await sequelize.authenticate();
  await sequelize.sync();
  await createAdminIfNotExists();
    server.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
})();
