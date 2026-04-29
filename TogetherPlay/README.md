# TogetherPlay

Projet universitaire réalisé dans le cadre de la **Licence 3 Informatique** à l'**Université d'Avignon**.

## 👥 Équipe

- Chiheb Eddine KEBBAS
- Lina Lalili
- Melinda Amrouioi
- Aziza Allouchene

## 🚀 Déploiement

Un `Dockerfile` est fourni, mais Docker n'est pas installé sur le serveur de l'université. Deux options :

- **Plateforme externe** : Render, Railway, Fly.io (le `Dockerfile` est directement utilisable).
- **Exécution sans Docker** sur la machine universitaire : voir « Mise en production » plus bas.

## 🛠 Technologies et architecture

Application web full-stack temps réel.

**Frontend**
- React 19 + Vite 7
- React Router DOM 7 pour la navigation
- Socket.IO client pour la sync temps réel
- React YouTube pour le lecteur intégré
- @dnd-kit pour le drag & drop de la playlist

**Backend**
- Node.js + Express 5
- Socket.IO pour les événements temps réel
- Mongoose / MongoDB pour la persistence
- Proxy YouTube côté serveur (cache 1 h, clé API jamais exposée au client)
- Filtres « université » sur les suggestions/recherche : `safeSearch=strict`, catégorie *Education*, FR, embeddable

**Structure principale (`src/`)**
- `assets/` — images et styles globaux
- `component/ui/`, `component/layout/` — composants réutilisables
- `context/` — états globaux (playlist, action d'accueil)
- `features/` — code métier par fonctionnalité (chat, lecteur, marqueurs, etc.)
- `pages/` — vues routées
- `server/` — backend Node (db, socketHandler, proxy YouTube, rate-limit)
- `services/` — clients HTTP et socket

## ⚙️ Configuration

Copiez le fichier d'exemple :

```bash
cp .env.example .env.local
```

Variables requises :

| Variable           | Côté    | Description |
|--------------------|---------|-------------|
| `MONGODB_URI`      | back    | URI MongoDB |
| `YT_API_KEY`       | back    | Clé YouTube Data API v3 (serveur uniquement) |
| `CLIENT_ORIGIN`    | back    | Origine autorisée (CORS / Socket.IO). Défaut : `http://localhost:5173` |
| `PORT`             | back    | Port HTTP. Défaut : `3001` |
| `VITE_API_URL`     | front   | URL publique du backend. Défaut : `http://localhost:3001` |

## 💻 Exécution en local

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le backend (port 3001)
npm run server

# 3. Dans un autre terminal, lancer le frontend (port 5173)
npm run dev
```

## 🔒 Sécurité

- **Clé YouTube côté serveur uniquement** — jamais exposée au navigateur.
- **Autorisation socket** : seul l'admin peut changer la vidéo, piloter la lecture, exclure un membre, ou supprimer/remplacer une vidéo dans la playlist.
- **Identité côté serveur** : `sender` des messages forcé au `username` du socket connecté.
- **Validation + rate-limit** sur tous les événements (chat, marqueurs, playlist, état lecture).
- **Salons** : id en `crypto.randomUUID` (8 caractères), TTL 24 h MongoDB.

## 🚢 Mise en production (sans Docker)

```bash
npm install --omit=dev
npm run build
NODE_ENV=production node src/server/index.js
```

Le backend sert alors le bundle Vite depuis `dist/` et expose l'API + WebSocket sur le même port.
