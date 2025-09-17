import { Question } from '../models/Question.js';
import jwt from 'jsonwebtoken';
import { isLocked } from '../middlewares/lock.js';
import { Ranking } from '../models/Ranking.js';
import { GameSession } from '../models/GameSession.js';
import { GameAnswer } from '../models/GameAnswer.js';
import { Op } from 'sequelize';

const rooms = new Map();
const QUESTION_DURATION_MS = 30000;
const SPEED_BONUS_PER_SECOND = 5; // puntos por segundo restante
async function getRandomByDifficulty(difficulty, mode = 'general'){
  const m = (mode || 'general').toString().toLowerCase();
  const where = m === 'matrimonios'
    ? { difficulty, mode: { [Op.in]: ['general', 'matrimonios'] } }
    : { difficulty, mode: 'general' };
  const count = await Question.count({ where });
  if (!count) return null;
  const offset = Math.floor(Math.random() * count);
  return await Question.findOne({ where, offset, order: [['id','ASC']] });
}

function getRoom(roomId){
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { players: new Map(), difficulty: 1, current: null, timer: null, started: false, sessionId: null, questionStartAt: null, mode: 'general' });
  }
  return rooms.get(roomId);
}

async function askNext(io, roomId){
  const room = getRoom(roomId);
  if (room.difficulty > 15) return finish(io, roomId);
  const q = await getRandomByDifficulty(room.difficulty, room.mode || 'general');
  if (!q) return finish(io, roomId);
  room.current = { id: q.id, correctIndex: q.correctIndex, text: q.text, options: q.options, explanation: q.explanation, verseHint: q.verseHint };
  // limpiar respuestas
  room.players.forEach(p => { p.answered = null; p.answerTimeMs = null; });
  // programar tiempo y enviar deadline a clientes
  room.questionStartAt = Date.now();
  const deadline = room.questionStartAt + QUESTION_DURATION_MS;
  io.to(roomId).emit('question', { id: q.id, text: q.text, options: q.options, difficulty: room.difficulty, durationMs: QUESTION_DURATION_MS, deadline });
  // timer 30s
  clearTimeout(room.timer);
  room.timer = setTimeout(() => evaluate(io, roomId), QUESTION_DURATION_MS);
}

function evaluate(io, roomId){
  const room = getRoom(roomId);
  if (!room.current) return;
  const correct = room.current.correctIndex;
  const results = [];
  room.players.forEach((p, sid) => {
    const ok = p.answered === correct;
    let pointsAdded = 0;
    if (ok) {
      const base = 100 * room.difficulty;
      const answeredAtMs = typeof p.answerTimeMs === 'number' ? p.answerTimeMs : QUESTION_DURATION_MS;
      const remainingMs = Math.max(0, QUESTION_DURATION_MS - answeredAtMs);
      const bonus = Math.floor(remainingMs / 1000) * SPEED_BONUS_PER_SECOND;
      pointsAdded = base + bonus;
      p.score = (p.score || 0) + pointsAdded;
    }
    results.push({ playerId: sid, name: p.name, ok, answer: p.answered, score: p.score || 0, pointsAdded });
  });
  io.to(roomId).emit('result', { correctIndex: correct, results, explanation: room.current.explanation, verseHint: room.current.verseHint });

  // Persistir respuestas por ronda ANTES de limpiar current
  try {
    if (room.sessionId && room.current) {
      const currentDifficulty = room.difficulty;
      const qid = room.current.id;
      const bulk = results.map(r => ({
        sessionId: room.sessionId,
        difficulty: currentDifficulty,
        questionId: qid,
        playerName: r.name,
        correct: r.ok,
        answerIndex: r.answer ?? null,
        pointsAwarded: r.pointsAdded || 0,
      }));
      GameAnswer.bulkCreate(bulk).catch(()=>{});
    }
  } catch {}

  room.difficulty += 1;
  room.current = null;
  clearTimeout(room.timer);
  room.timer = setTimeout(() => askNext(io, roomId), 4000);
}

function finish(io, roomId){
  const room = getRoom(roomId);
  const final = [];
  room.players.forEach(p => final.push({ name: p.name, score: p.score || 0 }));
  final.sort((a,b) => b.score - a.score);
  io.to(roomId).emit('game-over', { ranking: final });
  // Persistir en Ranking (top N o todos)
  try {
    const rows = final.map(f => ({ playerName: f.name, points: f.score }));
    Ranking.bulkCreate(rows).catch(() => {});
  } catch {}
  room.started = false;
  room.difficulty = 1;
  room.current = null;
  clearTimeout(room.timer); room.timer = null;
}

export function attachGameSocket(io) {
  io.on('connection', (socket) => {
    try {
      const token = socket.handshake.auth?.token || null;
      if (isLocked()) {
        if (!token) { socket.emit('force-logout', { reason: 'Sitio bloqueado' }); return socket.disconnect(true); }
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload?.role !== 'admin') { socket.emit('force-logout', { reason: 'Sitio bloqueado' }); return socket.disconnect(true); }
      }
    } catch { socket.emit('force-logout', { reason: 'Sitio bloqueado' }); return socket.disconnect(true); }

    socket.emit('lock-status', { locked: isLocked() });
    socket.on('join-room', (roomId, playerName) => {
      const room = getRoom(roomId);
      room.players.set(socket.id, { name: playerName || 'Jugador', score: 0, answered: null });
      socket.join(roomId);
      io.to(roomId).emit('player-joined', { playerName, players: Array.from(room.players.values()).map(p => ({ name: p.name, score: p.score })) });
    });

    socket.on('start-competitive', async (roomId, options = {}) => {
      const room = getRoom(roomId);
      if (room.started) return;
      room.started = true;
      const mode = (options?.mode || 'general').toString().toLowerCase();
      room.mode = mode === 'matrimonios' ? 'matrimonios' : 'general';
      // Crear sesión
      try {
        const sess = await GameSession.create({ roomId });
        room.sessionId = sess.id;
      } catch {}
      io.to(roomId).emit('competitive-start');
      await askNext(io, roomId);
    });

    socket.on('answer', (roomId, index) => {
      const room = getRoom(roomId);
      const p = room.players.get(socket.id);
      if (!room.current || !p || p.answered !== null) return;
      p.answered = index;
      // registrar tiempo de respuesta relativo al inicio de la pregunta
      p.answerTimeMs = Math.max(0, Date.now() - (room.questionStartAt || Date.now()));
      // evaluación temprana si todos respondieron
      const allAnswered = Array.from(room.players.values()).every(pp => pp.answered !== null);
      if (allAnswered) evaluate(io, roomId);
    });

    socket.on('disconnect', () => {
      rooms.forEach((room, roomId) => {
        if (room.players.delete(socket.id)) {
          io.to(roomId).emit('player-left', { id: socket.id });
        }
      });
    });
  });
}
