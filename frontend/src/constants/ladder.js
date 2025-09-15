export const LADDER_VALUES = [
  100, 200, 300, 500, 1000,
  2000, 4000, 8000, 16000, 32000,
  64000, 125000, 250000, 500000, 1000000,
];

export function formatPoints(value, locale = 'es-ES') {
  try { return Number(value || 0).toLocaleString(locale); }
  catch { return String(value); }
}
