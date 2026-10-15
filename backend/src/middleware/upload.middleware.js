import multer from 'multer';
import path from 'path';

// Memoire storage : le fichier va ensuite vers Vercel Blob (prod)
// ou etre ecrit sur disque (dev local, fallback).
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Fichier non autorisé — PDF, JPG ou PNG seulement'));
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
