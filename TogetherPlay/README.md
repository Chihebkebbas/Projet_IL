# TogetherPlay

Projet universitaire réalisé dans le cadre de la **Licence 3 Informatique** à l'**Université d'Avignon**.

## 👥 Équipe

Ce projet a été réalisé par :
- Chiheb Eddine KEBBAS 
- Lina Lalili
- Melinda Amrouioi
- Aziza Allouchene

## 🚀 Problème et État du Déploiement

**Attention :** Un problème de déploiement a été identifié. Le projet contient un `Dockerfile`, mais **Docker n'est pas installé sur le serveur de l'université**. 

Par conséquent, le déploiement nécessite soit l'utilisation d'une plateforme d'hébergement alternative, soit une configuration manuelle pour exécuter le projet sans Docker sur les serveurs de l'université.

## 🛠 Technologies et Architecture

Le projet est une application web full-stack orientée temps réel.

**Frontend :**
- **React 19** avec **Vite** comme outil de build rapide.
- **React Router DOM** pour la navigation.
- **Socket.io-client** pour la synchronisation WebSockets.
- **React YouTube** pour l'intégration et le contrôle du lecteur vidéo.
- **@dnd-kit** pour les fonctionnalités de Drag & Drop.

**Backend :**
- **Node.js** avec **Express** pour le serveur web de l'API.
- **Socket.io** pour gérer les événements en temps réel entre les utilisateurs.
- **Mongoose** (MongoDB) pour la gestion et la persistance de la base de données.

**Structure principale (`src/`) :**
- `assets/` : Ressources statiques (images, styles).
- `component/` : Composants React réutilisables de l'interface.
- `context/` : Gestion des états globaux via l'API Context de React.
- `features/` : Code spécifique organisé par fonctionnalité de l'application.
- `pages/` : Les différentes vues principales routées de l'application.
- `server/` : Code source du serveur backend Node.js, contenu dans le même dépôt.
- `services/` : Fonctions pour les interactions et appels réseau vers le backend.

## 💻 Exécution en local

Pour développer et exécuter l'application localement, il faut lancer le serveur backend et le frontend réactif :

1. Assurez-vous que [Node.js](https://nodejs.org/) est installé.
2. Installer les dépendances à la racine du projet :
   ```bash
   npm install
   ```
3. Lancer le serveur backend (situé dans `src/server`) :
   ```bash
   npm run server
   ```
4. Lancer le serveur de développement frontend (Vite) :
   ```bash
   npm run dev
   ```
5. Pour compiler la version frontend prête pour la production :
   ```bash
   npm run build
   ```
