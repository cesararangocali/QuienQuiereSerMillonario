import { getQuestionByDifficulty } from '../controllers/gameController.js';
import { Question } from '../models/Question.js';

// Generador de preguntas por dificultad creciente
export async function getNextQuestionsSequence(count = 15) {
  const list = [];
  const maxDifficulty = 15;
  for (let i = 1; i <= count; i++) {
    const d = Math.min(i, maxDifficulty);
    const q = await Question.findOne({ where: { difficulty: d } });
    if (!q) break;
    list.push(q);
  }
  return list;
}
