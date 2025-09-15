let LOCKED = false;

export function isLocked() {
  return LOCKED;
}

export function lockGame() {
  LOCKED = true;
}

export function unlockGame() {
  LOCKED = false;
}

export function isLockedMiddleware(req, res, next) {
  if (LOCKED) return res.status(423).json({ error: 'El juego está bloqueado por el administrador' });
  next();
}
