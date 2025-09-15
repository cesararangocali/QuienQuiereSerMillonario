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

  const targetPerLevel = 50;
  const diffs = Array.from(grouped.keys()).sort((a, b) => a - b);
  const outItems = [];
  const report = [];
  for (const d of diffs) {
    const arr = grouped.get(d);
    const sliced = arr.slice(0, targetPerLevel);
    outItems.push(...sliced);
    report.push({ difficulty: d, before: arr.length, after: sliced.length });
  }

  // Keep meta unchanged
  const out = { ...json, items: outItems };
  fs.writeFileSync(dataPath, JSON.stringify(out, null, 2), 'utf8');

  console.log('Normalización completada. Resumen:');
  for (const r of report) {
    const tag = r.before > r.after ? 'TRIM' : r.before < r.after ? 'PAD' : 'OK';
    console.log(` - Nivel ${r.difficulty}: ${r.before} -> ${r.after} ${tag}`);
  }
}

main();
