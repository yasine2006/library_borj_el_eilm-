import rateLimit from 'express-rate-limit';

// Limite l brute-force 3la login / reset password
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,                  // 10 tentatives / IP / 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' }
});

// Limite l inscription (anti-spam / anti-DoS)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20,                  // 20 inscriptions / IP / heure
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de demandes. Réessayez plus tard.' }
});
