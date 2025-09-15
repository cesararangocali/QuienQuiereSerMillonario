const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../../data/questions_catolica.json');

function main() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const json = JSON.parse(raw);
  const items = json.items || [];

  const grouped = new Map();
  for (const it of items) {
    const d = Number(it.difficulty);
    if (!grouped.has(d)) grouped.set(d, []);
    grouped.get(d).push(it);
  }

  // Sólo informe de conteos, sin modificar el archivo
  console.log('Revisión de conteos (sin recorte):');
  const diffs = Array.from(grouped.keys()).sort((a, b) => a - b);
  for (const d of diffs) {
    const arr = grouped.get(d);
    console.log(` - Nivel ${d}: ${arr.length}`);
  }
}

main();
