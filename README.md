# 📚 Librairie Marocaine - School Supplies

Application web complète de gestion d'une librairie marocaine avec **Frontend React** + **Backend Node.js/Express** + **PostgreSQL**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.0-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)

---

## 📋 Rôles Utilisateurs

| Rôle | ID | Description | Permissions |
|------|-----|-------------|-------------|
| **Super Admin** | 1 | Contrôle total | CRUD complet (produits, users, commandes, stats) |
| **Admin** | 2 | Gestionnaire | Produits, commandes, stock (lecture/écriture) |
| **Client Détail** | 3 | Acheteur normal | Voir produits (prix détail), commander, historique |
| **Client Grossiste** | 3 | Acheteur pro | Voir produits (prix gros), commander en volume |

---

## 📁 Structure du Projet

```
librairie-complete/
│
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx           # Page d'accueil complète
│   │   ├── index.css
│   │   └── data.js           # Données de test
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                  # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── index.js          # Serveur principal
│   │   ├── config/
│   │   │   └── db.js         # Connexion PostgreSQL
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── order.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   └── routes/
│   │       ├── auth.routes.js
│   │       ├── product.routes.js
│   │       ├── order.routes.js
│   │       └── user.routes.js
│   ├── package.json
│   └── .env
│
└── database.sql              # Schema PostgreSQL complet
```

---

## 🚀 Installation Rapide

### 1. Prérequis

- **Node.js** >= 18.0 ([nodejs.org](https://nodejs.org))
- **PostgreSQL** >= 15 ([postgresql.org](https://postgresql.org))
- **npm** >= 9.0

### 2. Base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE librairie_marocaine;

# Quitter
\q

# Exécuter le script SQL
psql -U postgres -d librairie_marocaine -f database.sql
```

### 3. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer .env (modifier DB_PASSWORD)
nano .env

# Lancer le serveur
npm run dev
```
Le serveur démarre sur `http://localhost:5000`

### 4. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```
L'app s'ouvre sur `http://localhost:3000`

---

## 🔌 API Endpoints

### Authentification
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/auth/register` | Inscription (Client Détail/Grossiste) |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil utilisateur connecté |

### Produits
| Méthode | URL | Description | Rôle |
|---------|-----|-------------|------|
| GET | `/api/products` | Liste tous les produits | Public |
| GET | `/api/products/:id` | Détail produit | Public |
| GET | `/api/products/low-stock` | Produits en stock faible | Admin/Super Admin |
| POST | `/api/products` | Créer un produit | Admin/Super Admin |
| PUT | `/api/products/:id` | Modifier un produit | Admin/Super Admin |
| DELETE | `/api/products/:id` | Supprimer un produit | Super Admin |

### Commandes
| Méthode | URL | Description | Rôle |
|---------|-----|-------------|------|
| POST | `/api/orders` | Créer une commande | Client connecté |
| GET | `/api/orders/my-orders` | Mes commandes | Client connecté |
| GET | `/api/orders` | Toutes les commandes | Admin/Super Admin |
| GET | `/api/orders/:id` | Détail commande | Connecté |
| PUT | `/api/orders/:id/status` | Modifier statut | Admin/Super Admin |

### Utilisateurs (Super Admin)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/users/stats` | Statistiques dashboard |
| GET | `/api/users` | Liste tous les utilisateurs |
| GET | `/api/users/:id` | Détail utilisateur |
| PUT | `/api/users/:id` | Modifier utilisateur |
| DELETE | `/api/users/:id` | Supprimer utilisateur |

---

## 🎯 Fonctionnalités Frontend

### Page d'Accueil (Client)
- ✅ Slider de bannières avec auto-play
- ✅ Navigation par catégories (8 catégories)
- ✅ Recherche avancée (nom, catégorie, marque, code barre)
- ✅ Filtres par catégorie
- ✅ **2 Types de Prix** : Détail vs Grossiste (toggle)
- ✅ Panier complet (ajouter, quantité, supprimer, vider)
- ✅ Wishlist (favoris)
- ✅ Indicateurs de stock (Vert/Orange/Rouge)
- ✅ Modal Connexion / Inscription
- ✅ Design responsive (mobile/tablette/desktop)

### Dashboard Admin (à développer)
- 📊 Statistiques (ventes, produits, clients)
- 📦 Gestion des produits (CRUD)
- 📋 Gestion des commandes
- 👥 Gestion des utilisateurs
- 📈 Graphiques (Chart.js)

---

## 🐘 Tables PostgreSQL

| Table | Description |
|-------|-------------|
| `roles` | Rôles (Super Admin, Admin, Client) |
| `users` | Utilisateurs (email, password, type: retail/wholesale) |
| `categories` | Catégories de produits |
| `suppliers` | Fournisseurs |
| `products` | Produits (prix détail + prix gros) |
| `stock_movements` | Historique des mouvements de stock |
| `orders` | Commandes clients |
| `order_items` | Items de chaque commande |
| `invoices` | Factures PDF |
| `activity_logs` | Logs d'activité |

---

## 🔐 Sécurité

- **JWT** pour l'authentification
- **Bcrypt** pour le hashage des mots de passe
- **Helmet** pour les headers de sécurité
- **CORS** configuré
- **Validation** des formulaires
- **Rôles** et permissions par niveau

---

## 📞 Contact

- **Email** : contact@librairie.ma
- **Téléphone** : +212 5XX-XXXXXX
- **Adresse** : Casablanca, Maroc

---

**Développé avec ❤️ au Maroc**
