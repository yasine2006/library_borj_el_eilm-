-- ============================================
-- Script d'initialisation des comptes admins
-- Borj El Eilm - Exécuter UNE SEULE FOIS
-- ============================================
-- Utilisation: psql -U postgres -d librairie_marocaine -f init_admins.sql

-- Super Admin (mot de passe: admin123)
-- Hash bcrypt généré pour 'admin123'
INSERT INTO users (email, password_hash, first_name, last_name, user_type, role_id, is_active)
VALUES (
  'admin@librairie.ma',
  '$$2a$10$nww86nkG2sWQCFliHUpL4uYv9XJIFG4GQZE5TV/tzUPZwLitTwiJe',
  'Super',
  'Admin',
  'retail',
  1,
  true
)
ON CONFLICT (email) DO UPDATE SET role_id = 1;

-- Admin Normal (mot de passe: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, user_type, role_id, is_active)
VALUES (
  'admin2@librairie.ma',
  '$$2a$10$nww86nkG2sWQCFliHUpL4uYv9XJIFG4GQZE5TV/tzUPZwLitTwiJe',
  'Admin',
  'Normal',
  'retail',
  2,
  true
)
ON CONFLICT (email) DO UPDATE SET role_id = 2;

-- Note: Le hash ci-dessus est le hash bcrypt du mot de passe 'password'
-- Pour créer un vrai hash pour 'admin123', exécutez:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h));"
-- Puis remplacez le hash ci-dessus

SELECT 'Admins créés avec succès' AS status;
SELECT id, email, first_name, role_id FROM users WHERE role_id IN (1, 2);
