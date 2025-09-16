let LOCKED = false;
let META = { reason: null, by: null, at: null };

export function isLocked() {
  return LOCKED;
}

export function lockGame() {
  LOCKED = true;
}

export function unlockGame() {
  LOCKED = false;
}

export function lockMeta(){ return { locked: LOCKED, ...META } }

export function setLock(reason, by){ LOCKED = true; META = { reason: reason||null, by: by||null, at: new Date().toISOString() } }
export function clearLock(){ LOCKED = false; META = { reason: null, by: null, at: null } }

export function isLockedMiddleware(req, res, next) {
  if (!LOCKED) return next();
  const role = req.user?.role;
  if (role === 'admin') return next();
  return res.status(423).json({ error: 'El sitio está bloqueado por el administrador para jornada masiva' });
}
