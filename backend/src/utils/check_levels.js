import 'dotenv/config';
import { sequelize } from '../config/db.js';
import { Question } from '../models/Question.js';

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const rows = await Question.findAll({
      attributes: [
        'difficulty',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['difficulty'],
      order: [['difficulty', 'ASC']]
    });
    const counts = new Map(rows.map(r => [Number(r.get('difficulty')), Number(r.get('count'))]));
    console.log('Conteo en BD por dificultad:');
    for (let d = 1; d <= 15; d++) {
      const c = counts.get(d) || 0;
      const mark = c === 0 ? 'VACÍO' : 'OK';
      console.log(` - Nivel ${d}: ${c} ${mark}`);
    }
    // Mostrar si existieran dificultades fuera del rango 1-15
    const extras = Array.from(counts.keys()).filter(d => d < 1 || d > 15);
    if (extras.length) {
      console.log('Dificultades fuera de 1-15 detectadas:');
      for (const d of extras) console.log(` - Nivel ${d}: ${counts.get(d)}`);
    }
  } catch (err) {
    console.error('Error verificando niveles en BD:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
