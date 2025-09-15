import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../config/db.js';
import { Question } from '../models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedQuestionsFromJson() {
  const dataPath = path.resolve(process.cwd(), 'data', 'questions_catolica.json');
  if (!fs.existsSync(dataPath)) {
    console.error('No se encontró data/questions_catolica.json');
    process.exit(1);
  }
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const json = JSON.parse(raw);
  const items = Array.isArray(json?.items) ? json.items : [];
  if (!items.length) {
    console.error('El JSON no contiene items válidos.');
    process.exit(1);
  }
  // Validación de conteos por nivel y truncado a 50
  const byLevel = new Map();
  for (const it of items) {
    const d = Number(it.difficulty);
    if (!byLevel.has(d)) byLevel.set(d, []);
    byLevel.get(d).push(it);
  }
  console.log('Resumen por dificultad (conteo detectado en JSON):');
  for (let d = 1; d <= 15; d++) {
    const arr = byLevel.get(d) || [];
    const c = arr.length;
  const mark = c === 0 ? 'VACÍO' : 'OK';
  console.log(` - Nivel ${d}: ${c} ${mark}`);
  }
  await sequelize.sync({ alter: true });
  console.log('Eliminando preguntas existentes...');
  await Question.destroy({ where: {} });
  // Preparar dataset completo por niveles (sin truncar)
  const prepared = [];
  for (let d = 1; d <= 15; d++) {
    const arr = (byLevel.get(d) || []);
    for (const q of arr) prepared.push(q);
  }
  console.log('Insertando nuevas preguntas...', prepared.length);
  await Question.bulkCreate(prepared.map(q => ({
    text: q.text,
    options: q.options,
    correctIndex: Number(q.correctIndex),
    difficulty: Number(q.difficulty),
    category: q.category || 'General',
    verseHint: q.verseHint || null,
    explanation: q.explanation || null,
    source: q.source || null,
  })));
  console.log('Seed de preguntas completado.');
}

seedQuestionsFromJson().then(()=>process.exit(0)).catch(err=>{ console.error(err); process.exit(1); });
