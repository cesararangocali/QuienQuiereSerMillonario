import { sequelize } from '../config/db.js';
import { Question } from '../models/Question.js';
import { Ranking } from '../models/Ranking.js';
import { Prayer } from '../models/Prayer.js';
import { User, createAdminIfNotExists } from '../models/User.js';

const sampleQuestions = [
  {
    text: "¿Quién fue el primer rey de Israel?",
    options: ["Saúl", "David", "Salomón", "Samuel"],
    correctIndex: 0,
    difficulty: 1,
    category: "Historia bíblica",
    verseHint: "1 Samuel 10,1",
  explanation: "Saúl fue ungido por Samuel como el primer rey de Israel (1 Sam 10).",
    source: "",
  },
  {
    text: "¿En qué Evangelio se encuentra el Sermón de la Montaña?",
    options: ["Marcos", "Lucas", "Mateo", "Juan"],
    correctIndex: 2,
    difficulty: 2,
    category: "Citas",
    verseHint: "Mateo 5-7",
  explanation: "El Sermón de la Montaña está en Mateo 5-7.",
    source: "",
  },
  {
    text: "¿Cuántos sacramentos reconoce la Iglesia Católica?",
    options: ["Cinco", "Siete", "Nueve", "Doce"],
    correctIndex: 1,
    difficulty: 1,
    category: "Sacramentos",
    verseHint: "Catecismo de la Iglesia Católica",
  explanation: "La Iglesia enseña siete sacramentos: Bautismo, Confirmación, Eucaristía, Penitencia, Unción de los enfermos, Orden sacerdotal y Matrimonio.",
    source: "",
  },
  {
    text: "¿En qué concilio se definió el dogma de la Inmaculada Concepción?",
    options: ["Vaticano I", "Trento", "Vaticano II", "No fue en concilio"],
    correctIndex: 3,
    difficulty: 3,
    category: "Historia de la Iglesia",
    verseHint: "Bula Ineffabilis Deus (1854)",
    explanation: "La Inmaculada Concepción fue definida por el Papa Pío IX en 1854, no en un concilio.",
    source: "",
  },
  {
    text: "¿Cuál es el primer libro de la Biblia?",
    options: ["Éxodo", "Génesis", "Levítico", "Números"],
    correctIndex: 1,
    difficulty: 1,
    category: "Biblia",
    verseHint: "Primer libro del Pentateuco",
    explanation: "Génesis es el primer libro de la Biblia y narra la creación.",
    source: "",
  },
  {
    text: "¿Qué significa 'Eucaristía'?",
    options: ["Acción de gracias", "Pan de vida", "Cuerpo santo", "Comunión"],
    correctIndex: 0,
    difficulty: 2,
    category: "Sacramentos",
    verseHint: "Del griego 'eucharistia'",
    explanation: "Eucaristía significa 'acción de gracias' en griego.",
    source: "",
  },
  {
    text: "¿En qué año se proclamó el dogma de la Asunción de María?",
    options: ["1950", "1854", "1870", "1962"],
    correctIndex: 0,
    difficulty: 3,
    category: "Mariología",
    verseHint: "Constitución Munificentissimus Deus",
    explanation: "Pío XII proclamó el dogma de la Asunción en 1950.",
    source: "",
  },
  {
    text: "¿Cuántos apóstoles eligió Jesús?",
    options: ["Diez", "Doce", "Setenta", "Ocho"],
    correctIndex: 1,
    difficulty: 1,
    category: "Nuevo Testamento",
    verseHint: "Marcos 3,13-19",
    explanation: "Jesús eligió doce apóstoles según los Evangelios.",
    source: "",
  },
  {
    text: "¿Qué significa 'Adviento'?",
    options: ["Llegada", "Espera", "Preparación", "Nacimiento"],
    correctIndex: 0,
    difficulty: 2,
    category: "Liturgia",
    verseHint: "Del latín 'adventus'",
    explanation: "Adviento significa 'llegada' o 'venida' en latín.",
    source: "",
  },
  {
    text: "¿Cuál es la oración que Jesús enseñó a sus discípulos?",
    options: ["Ave María", "Gloria", "Padre Nuestro", "Credo"],
    correctIndex: 2,
    difficulty: 1,
    category: "Oraciones",
    verseHint: "Mateo 6,9-13",
    explanation: "Jesús enseñó el Padre Nuestro según Mateo 6,9-13.",
    source: "",
  },
  {
    text: "¿Qué Papa convocó el Concilio Vaticano II?",
    options: ["Pío XII", "Juan XXIII", "Pablo VI", "Juan Pablo II"],
    correctIndex: 1,
    difficulty: 3,
    category: "Historia de la Iglesia",
    verseHint: "El Papa Bueno (1958-1963)",
    explanation: "Juan XXIII convocó el Concilio Vaticano II en 1962.",
    source: "",
  },
  {
    text: "¿En qué ciudad nació Jesús?",
    options: ["Nazaret", "Jerusalén", "Belén", "Cafarnaúm"],
    correctIndex: 2,
    difficulty: 1,
    category: "Vida de Jesús",
    verseHint: "Mateo 2,1",
    explanation: "Jesús nació en Belén según los Evangelios.",
    source: "",
  },
  {
    text: "¿Cuál es el tiempo litúrgico que precede a la Pascua?",
    options: ["Adviento", "Cuaresma", "Pentecostés", "Tiempo Ordinario"],
    correctIndex: 1,
    difficulty: 2,
    category: "Liturgia",
    verseHint: "40 días de preparación",
    explanation: "La Cuaresma es el tiempo de 40 días que precede a la Pascua.",
    source: "",
  },
  {
    text: "¿Quién escribió la 'Summa Theologica'?",
    options: ["San Agustín", "Santo Tomás de Aquino", "San Jerónimo", "San Ambrosio"],
    correctIndex: 1,
    difficulty: 3,
    category: "Teología",
    verseHint: "Doctor Angélico (s. XIII)",
    explanation: "Santo Tomás de Aquino escribió la Summa Theologica en el siglo XIII.",
    source: "",
  },
  {
    text: "¿Cuál es el primer mandamiento?",
    options: ["No matarás", "Amarás a Dios sobre todas las cosas", "Honra a tu padre y madre", "No robarás"],
    correctIndex: 1,
    difficulty: 1,
    category: "Mandamientos",
    verseHint: "Deuteronomio 6,5",
    explanation: "El primer mandamiento es amar a Dios sobre todas las cosas.",
    source: "",
  }
];

const samplePrayers = [
  { key: 'inicio', text: 'Señor, abre nuestros corazones a tu Palabra.' },
  { key: 'fin', text: 'Te damos gracias, Señor, por este momento de encuentro.' },
];

export default async function seed() {
  await sequelize.sync({ alter: true });
  await createAdminIfNotExists();

  const countQ = await Question.count();
  if (countQ === 0) await Question.bulkCreate(sampleQuestions);

  const countP = await Prayer.count();
  if (countP === 0) await Prayer.bulkCreate(samplePrayers);

  const countR = await Ranking.count();
  if (countR > 200) await Ranking.destroy({ where: {}, truncate: true });

  console.log('Seed completado');
}

if (process.argv[1].includes('seed.js')) {
  seed().then(() => process.exit(0));
}
