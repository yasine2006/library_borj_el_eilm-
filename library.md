# 📚 Système de Gestion de Librairie Marocaine

## 📖 Présentation

Ce projet est une application web de gestion d'une librairie marocaine permettant la gestion complète des produits, du stock, des commandes, des utilisateurs et des ventes.

L'application est destinée à trois types d'utilisateurs :

- Super Admin
- Admin
- Client (Détail ou Grossiste)

---

# 🎯 Objectifs

- Gestion complète des produits
- Gestion du stock
- Gestion des commandes
- Gestion des utilisateurs
- Tableau de bord avec statistiques
- Gestion des prix selon le type de client
- Interface moderne et responsive

---

# 👥 Les rôles

## 1. Super Admin

Le Super Admin possède tous les droits.

### Gestion des produits

- Ajouter un produit
- Modifier un produit
- Supprimer un produit
- Consulter les produits

### Gestion des catégories

- Ajouter
- Modifier
- Supprimer

### Gestion des fournisseurs

- Ajouter
- Modifier
- Supprimer

### Gestion des utilisateurs

- Ajouter Admin
- Modifier Admin
- Supprimer Admin

- Ajouter Client
- Modifier Client
- Supprimer Client

### Gestion des commandes

- Voir toutes les commandes
- Valider une commande
- Annuler une commande
- Modifier le statut

### Gestion du stock

- Voir le stock
- Ajouter du stock
- Retirer du stock
- Historique des mouvements

### Tableau de bord

- Nombre de produits
- Nombre de clients
- Nombre d'admins
- Nombre de commandes
- Produits en rupture
- Produits en stock faible
- Chiffre d'affaires
- Bénéfice
- Produits les plus vendus
- Graphiques

---

# 2. Admin

L'Admin possède des droits limités.

### Produits

- Ajouter
- Modifier
- Consulter

### Stock

- Voir le stock
- Mettre à jour le stock

### Commandes

- Voir les commandes
- Valider les commandes
- Préparer les commandes

### Clients

- Voir les clients

### Tableau de bord

- Produits
- Commandes
- Stock
- Produits en rupture

---

# 3. Client

Deux types :

## Client Détail

Affiche le prix normal.

## Client Grossiste

Affiche automatiquement le prix de gros.

Le client peut :

- Créer un compte
- Se connecter
- Modifier son profil
- Consulter les produits
- Ajouter au panier
- Commander
- Télécharger la facture
- Voir l'historique des commandes

---

# 📦 Gestion des Produits

Chaque produit contient :

- Image
- Nom
- Description
- Catégorie
- Code Barre
- Prix Détail
- Prix Gros
- Stock
- Stock Minimum
- Fournisseur
- Marque
- Date d'ajout
- État

---

# 📊 Gestion du Stock

Le système doit afficher :

- Stock actuel
- Entrées
- Sorties
- Historique

Alertes automatiques :

🟢 Stock disponible

🟠 Stock faible

🔴 Rupture de stock

---

# 🛒 Gestion des Commandes

Chaque commande possède :

- Numéro
- Client
- Produits
- Quantité
- Prix
- Total
- Date
- État

Statuts :

- En attente
- Validée
- Préparation
- Expédiée
- Livrée
- Annulée

---

# 🛍️ Gestion du Panier

Le client peut :

- Ajouter un produit
- Modifier la quantité
- Supprimer un produit
- Vider le panier
- Passer une commande

---

# 💰 Gestion des Prix

Chaque produit possède :

Prix Détail

Prix Gros

Le prix affiché dépend automatiquement du type du client connecté.

---

# 📈 Tableau de Bord

Le Dashboard contient :

- Total Produits
- Produits Faibles
- Produits Rupture
- Total Clients
- Total Admins
- Total Commandes
- Commandes Aujourd'hui
- Chiffre d'Affaires
- Revenus
- Produits les plus vendus

Graphiques :

- Ventes par mois
- Commandes par mois
- Évolution du stock
- Produits les plus vendus

---

# 🔍 Recherche

Recherche par :

- Nom
- Catégorie
- Marque
- Code Barre

Filtres :

- Catégorie
- Prix
- Disponibilité

---

# 🏷️ Catégories

Exemples :

- Livres
- Cahiers
- Stylos
- Fournitures
- Calculatrices
- Cartables
- Imprimantes
- Accessoires

---

# 🚚 Fournisseurs

Chaque fournisseur contient :

- Nom
- Téléphone
- Email
- Adresse
- Ville

---

# 🔔 Notifications

Notifications automatiques :

- Nouveau produit
- Nouvelle commande
- Stock faible
- Produit en rupture
- Commande validée

---

# 📄 Facturation

Après validation :

Génération automatique d'une facture PDF contenant :

- Client
- Produits
- Quantités
- Prix
- TVA
- Total
- Date
- QR Code

---

# 🔐 Sécurité

- Authentification
- JWT ou Laravel Sanctum
- Mot de passe Hashé
- Gestion des rôles
- Permissions
- Validation des formulaires
- Protection CSRF
- Protection XSS
- Logs des actions

---

# 🛠️ Technologies

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend

- postgreesql

## Base de données

- postgresql

## Dashboard

- Chart.js

## PDF

- DomPDF

---

# 🗄️ Base de Données

Tables principales :

- users
- roles
- products
- categories
- suppliers
- stock_movements
- orders
- order_items
- carts
- cart_items
- invoices
- notifications
- activity_logs

---

# ✨ Fonctionnalités Futures

- Scanner Barcode
- QR Code
- Import Excel
- Export Excel
- Sauvegarde automatique
- Multi-langues (FR / AR)
- Mode sombre
- Promotions
- Codes Promo
- Statistiques avancées
- API REST
- Application Mobile

---

# 🎯 Résultat attendu

Une application web moderne, rapide, responsive et sécurisée permettant la gestion complète d'une librairie marocaine avec un système de stock intelligent, une gestion des utilisateurs par rôles et un tableau de bord professionnel.