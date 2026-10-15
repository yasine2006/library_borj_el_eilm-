-- ============================================
-- Script d'initialisation des comptes admins
-- Library Marocain - Exécuter UNE SEULE FOIS
-- ============================================
-- Utilisation: psql -U postgres -d librairie_marocaine -f init_admins.sql

-- Super Admin (mot de passe: admin123)
-- Hash bcrypt généré pour 'admin123'
INSERT INTO users (email, password_hash, first_name, last_name, user_type, role_id, is_active)
VALUES (
  'admin@librairie.ma',
  '$2a$10$oQz1llJsZXjGrrrInTYqNuQYKpJJmXqpNv/mx2P7YNVESTGVyjaPy',
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
  '$2a$10$oQz1llJsZXjGrrrInTYqNuQYKpJJmXqpNv/mx2P7YNVESTGVyjaPy',
  'Admin',
  'Normal',
  'retail',
  2,
  true
)
ON CONFLICT (email) DO UPDATE SET role_id = 2;

-- ⚠️ SÉCURITÉ: changez ces mots de passe par défaut immédiatement après le premier login.
-- Pour générer un nouveau hash:
-- node -e "const b=require('bcryptjs'); console.log(b.hashSync('VOTRE_MDP', 10))"

SELECT 'Admins créés avec succès' AS status;
SELECT id, email, first_name, role_id FROM users WHERE role_id IN (1, 2);
