import { Router } from 'express';
import express from 'express';
import { adminOnly, authRequired } from '../middlewares/auth.js';
import { lockGame, unlockGame } from '../middlewares/lock.js';
import { Question } from '../models/Question.js';
import { Prayer } from '../models/Prayer.js';
import { Ranking } from '../models/Ranking.js';

const router = Router();

router.post('/lock', authRequired, adminOnly, (req, res) => {
  const { pin } = req.body;
  if (pin !== process.env.GAME_LOCK_PIN) return res.status(401).json({ error: 'PIN inválido' });
  lockGame();
  res.json({ locked: true });
});

router.post('/unlock', authRequired, adminOnly, (req, res) => {
  const { pin } = req.body;
  if (pin !== process.env.GAME_LOCK_PIN) return res.status(401).json({ error: 'PIN inválido' });
  unlockGame();
  res.json({ locked: false });
});

// Questions CRUD
router.get('/questions', authRequired, adminOnly, async (_req, res) => {
  const list = await Question.findAll({ order: [['difficulty','ASC']] });
  res.json(list);
});

router.post('/questions', authRequired, adminOnly, async (req, res) => {
  const q = await Question.create(req.body);
  res.status(201).json(q);
});

router.put('/questions/:id', authRequired, adminOnly, async (req, res) => {
  const q = await Question.findByPk(req.params.id);
  if (!q) return res.status(404).json({ error: 'No encontrado' });
  await q.update(req.body);
  res.json(q);
});

router.delete('/questions/:id', authRequired, adminOnly, async (req, res) => {
  const q = await Question.findByPk(req.params.id);
  if (!q) return res.status(404).json({ error: 'No encontrado' });
  await q.destroy();
  res.status(204).end();
});

// Prayers
router.get('/prayers', authRequired, adminOnly, async (_req, res) => {
  const list = await Prayer.findAll();
  res.json(list);
});

router.post('/prayers', authRequired, adminOnly, async (req, res) => {
  const p = await Prayer.create(req.body);
  res.status(201).json(p);
});

router.put('/prayers/:id', authRequired, adminOnly, async (req, res) => {
  const p = await Prayer.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  await p.update(req.body);
  res.json(p);
});

router.delete('/prayers/:id', authRequired, adminOnly, async (req, res) => {
  const p = await Prayer.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  await p.destroy();
  res.status(204).end();
});

// Ranking reset
router.post('/ranking/reset', authRequired, adminOnly, async (_req, res) => {
  await Ranking.destroy({ where: {} });
  res.json({ ok: true });
});

// Export preguntas (JSON/CSV)
router.get('/questions/export', authRequired, adminOnly, async (req, res) => {
  const format = (req.query.format || 'json').toString();
  const rows = await Question.findAll({ order: [['difficulty','ASC'], ['id','ASC']] });
  if (format === 'csv') {
    const header = 'text,options,correctIndex,difficulty,category,verseHint,explanation,source';
    const lines = rows.map(q => {
      const options = (q.options || []).join('|').replaceAll('\n', ' ');
      const cells = [q.text, options, q.correctIndex, q.difficulty, q.category, q.verseHint||'', q.explanation||'', q.source||''];
      return cells.map(v => {
        const s = (v ?? '').toString().replaceAll('"', '""');
        return '"' + s + '"';
      }).join(',');
    });
    const csv = [header, ...lines].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="questions.csv"');
    return res.send(csv);
  } else {
    res.json(rows);
  }
});

// Import preguntas JSON: { items: [ {text, options[], ...} ] }
router.post('/questions/import/json', authRequired, adminOnly, async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Formato inválido' });
  const sanitized = items.map(q => ({
    text: q.text,
    options: q.options,
    correctIndex: Number(q.correctIndex),
    difficulty: Number(q.difficulty),
    category: q.category || 'General',
    verseHint: q.verseHint || null,
    explanation: q.explanation || null,
    source: q.source || null,
  }));
  await Question.bulkCreate(sanitized);
  res.json({ ok: true, count: sanitized.length });
});

// Import preguntas CSV con body text/plain: header: text,options,correctIndex,difficulty,category,verseHint,explanation,source
router.post('/questions/import/csv', express.text({ type: 'text/*', limit: '5mb' }), authRequired, adminOnly, async (req, res) => {
  const csv = req.body || '';
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return res.status(400).json({ error: 'CSV vacío' });
  const header = lines.shift();
  const out = [];
  for (const line of lines) {
    // parsing csv simple con comillas
    const cols = [];
    let cur = ''; let inside = false;
    for (let i=0;i<line.length;i++){
      const ch = line[i];
      if (ch === '"') {
        if (inside && line[i+1] === '"') { cur += '"'; i++; }
        else inside = !inside;
      } else if (ch === ',' && !inside) { cols.push(cur); cur=''; }
      else cur += ch;
    }
    cols.push(cur);
    const [text, optionsStr, correctIndex, difficulty, category, verseHint, explanation, source] = cols.map(c=>c.replace(/^\"|\"$/g,'').trim());
    const options = (optionsStr||'').split('|').map(s=>s.trim());
    out.push({ text, options, correctIndex: Number(correctIndex), difficulty: Number(difficulty), category, verseHint, explanation, source });
  }
  await Question.bulkCreate(out);
  res.json({ ok: true, count: out.length });
});

export default router;
