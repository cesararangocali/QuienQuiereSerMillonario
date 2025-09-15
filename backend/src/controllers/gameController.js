import { Question } from '../models/Question.js';
import { Ranking } from '../models/Ranking.js';
import { Prayer } from '../models/Prayer.js';
import { sequelize } from '../config/db.js';

export async function getQuestionByDifficulty(req, res) {
  const { difficulty } = req.params;
  const dnum = Number(difficulty);
  const count = await Question.count({ where: { difficulty: dnum } });
  if (!count) return res.status(404).json({ error: 'Sin preguntas' });
  const offset = Math.floor(Math.random() * count);
  const q = await Question.findOne({ where: { difficulty: dnum }, offset, order: [['id', 'ASC']] });
  if (!q) return res.status(404).json({ error: 'Sin preguntas' });
  const { id, text, options, difficulty: d, category } = q;
  res.json({ id, text, options, difficulty: d, category });
}

export async function useFiftyFifty(req, res) {
  const { questionId } = req.body;
  const q = await Question.findByPk(questionId);
  if (!q) return res.status(404).json({ error: 'Pregunta no encontrada' });
  const correct = q.correctIndex;
  const wrongs = [0,1,2,3].filter(i => i !== correct);
  const removed = wrongs.sort(() => 0.5 - Math.random()).slice(0,2);
  res.json({ keep: [correct, ...wrongs.filter(i => !removed.includes(i)).slice(0,1)] });
}

export async function getVerseHint(req, res) {
  const { questionId } = req.params;
  const q = await Question.findByPk(questionId);
  if (!q) return res.status(404).json({ error: 'Pregunta no encontrada' });
  res.json({ verseHint: q.verseHint });
}

export async function callAFriend(req, res) {
  const { questionId } = req.body;
  const q = await Question.findByPk(questionId);
  if (!q) return res.status(404).json({ error: 'Pregunta no encontrada' });
  // 70% de probabilidad de sugerir la correcta
  const rnd = Math.random();
  let suggestedIndex = q.correctIndex;
  if (rnd > 0.7) {
    const wrongs = [0,1,2,3].filter(i => i !== q.correctIndex);
    suggestedIndex = wrongs[Math.floor(Math.random() * wrongs.length)];
  }
  res.json({ suggestedIndex });
}

export async function submitScore(req, res) {
  const { playerName, points } = req.body;
  
  try {
    // Buscar si ya existe un registro para este jugador
    const existingRecord = await Ranking.findOne({ 
      where: { playerName: playerName.trim() } 
    });
    
    if (existingRecord) {
      // Si el nuevo puntaje es mayor, actualizar el registro existente
      if (points > existingRecord.points) {
        existingRecord.points = points;
        await existingRecord.save();
        res.json({ ...existingRecord.toJSON(), updated: true });
      } else {
        // Si el puntaje no es mayor, devolver el registro existente
        res.json({ ...existingRecord.toJSON(), updated: false });
      }
    } else {
      // Si no existe, crear un nuevo registro
      const newRecord = await Ranking.create({ 
        playerName: playerName.trim(), 
        points 
      });
      res.json({ ...newRecord.toJSON(), updated: false, isNew: true });
    }
  } catch (error) {
    console.error('Error al guardar puntaje:', error);
    res.status(500).json({ error: 'Error al guardar el puntaje' });
  }
}

export async function checkAnswer(req, res) {
  const { questionId, index } = req.body;
  const q = await Question.findByPk(questionId);
  if (!q) return res.status(404).json({ error: 'Pregunta no encontrada' });
  const correct = Number(index) === q.correctIndex;
  res.json({ correct, explanation: q.explanation, verseHint: q.verseHint });
}

export async function getRanking(_req, res) {
  const top = await Ranking.findAll({ order: [['points','DESC']], limit: 50 });
  res.json(top);
}

export async function getPrayers(_req, res) {
  const list = await Prayer.findAll();
  res.json(list);
}
