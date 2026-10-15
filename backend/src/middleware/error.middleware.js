// ============================================
// GESTION CENTRALISEE DES ERREURS
// ============================================

// Erreur "attendue" (validation, 404, 403...) : le message peut etre montre au client
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.expose = true;
  }
}

// Wrapper bach les erreurs async (hot b3d pool.connect...) yemchiw l errorHandler
// w ma ykaydarch l process (unhandledRejection)
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 404 l les routes /api ma-3arfينش
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Ressource introuvable' });
};

// Handler final : kayloggi l'erreur w kayrje3 message generic (ma yfchich details DB)
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('[ERROR]', err);
  const status = err.status || (err.code ? 400 : 500);
  const message = err.expose ? err.message : 'Erreur serveur';
  res.status(status).json({ error: message });
};
