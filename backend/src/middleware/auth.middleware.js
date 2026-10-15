import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acces refuse - Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission refusee' });
    }
    next();
  };
};

// Permet l'acces si l'utilisateur a un des roles, OU si c'est son propre id
export const checkSelfOrRole = (roles) => {
  return (req, res, next) => {
    const isSelf = String(req.user.id) === String(req.params.id);
    if (isSelf || roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Permission refusee' });
  };
};
