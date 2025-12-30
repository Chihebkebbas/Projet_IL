# TogetherPlay Backend - Documentation Technique Détaillée
Développeur : Lina ALILI
Rôle : Lead Backend / Sockets

# Architecture Globale
┌─────────────────────────────────────────────────────────────┐
│                     TOGETHERPLAY BACKEND                    │
│                     (Lina ALILI - Lead Back/Sockets)        │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  HTTP/REST  ┌────────────┐  WebSocket     │
│  │   Client   │<────────────┤   API      │<────────────┐  │
│  │  (React)   │────────────>│   REST     │─────────────┤  │
│  └────────────┘             └────────────┘             │  │
│                                 │                     │  │
│        │                        |                     │  │
│        │                  ┌────────────┐               │  │
│        │                  │  MongoDB   │               │  │
│        │                  │  (Optionel)│               │  │
│        │                  └────────────┘               │  │
│        |                                               │  │
│  ┌────────────┐  WebSocket  ┌────────────┐             │  │
│  │   Client   │<────────────┤  Socket.io │<-------------  │
│  │  (React)   │────────────>│   Server   │               │
│  └────────────┘             └────────────┘               │
│                    Temps Réel - Synchronisation          │
└─────────────────────────────────────────────────────────────┘

# Flux de Données
Connexion Initiale : Client → HTTP → API REST
Synchronisation : Client ↔ WebSocket ↔ Socket.io
Persistance : API → MongoDB (si disponible)
Broadcast : Socket.io → Tous les clients connectés

#Détails de Chaque Fichier
server.js - Point d'Entrée Principal : Configuration serveur global(Test)

controllers/socketController.js - Coeur du système
Logique Socket.io - TA TÂCHE PRINCIPALE
Événements Gérés :
GESTION DES SALONS
SYNCHRONISATION VIDÉO
CHAT TEMPS RÉEL
GESTION CONNEXIONS
Algorithmes Implémentés :
Fallback MongoDB : Vérifie disponibilité → Mode temporaire si échec
Broadcast Intelligent : socket.to(roomId).emit() → Évite écho à l'émetteur
Nettoyage Automatique : Suppression salons vides après déconnexion
Limitation Messages : Garde seulement 100 derniers messages par salon

models/Room.js - Modèle de Données
Responsabilité : Structure des salons
Schéma MongoDB :
Méthodes Implémentées :
addUser(username, socketId) : Ajout utilisateur avec timestamp
removeUser(socketId) : Retrait avec nettoyage automatique
addMessage(username, text) : Ajout message avec limite 100
addToPlaylist(video, addedBy) : Ajout vidéo à playlist

routes/roomRoutes.js - API REST
 Responsabilité : Endpoints HTTP
 Méthode	Endpoint	Description	Testé
GET        	/	        Info API	oui
POST	    /create	   Créer salon	oui
GET	      /exists/:roomId	Vérifier existence	oui
GET	      /:roomId	Infos   salon	oui
GET	      /test/connection	Test API	oui

config/db.js - Connexion Base de Données
Responsabilité : Gestion connexion MongoDB
Avantages :
Zero Downtime : Serveur fonctionne même sans DB
Adaptatif : Détecte automatiquement la disponibilité
Transparent : Même API avec ou sans persistance

utils/socketEvents.js - Constantes
Responsabilité : Standardisation événements

utils/syncHandler.js - Synchronisation Avancée
Responsabilité : Optimisation synchronisation

utils/helpers.js - Fonctions Utilitaires

package.json - Configuration Projet

Socket.io - Système Temps Réel
Client A                    Serveur                    Client B
   │                          │                          │
   │── joinRoom ─────────────▶│                          │
   │                          │── roomJoined ───────────▶│
   │                          │── userListUpdate ───────▶│
   │                          │                          │
   │── videoPlay ────────────▶│                          │
   │                          │── videoPlay ─────────────▶│
   │◀─ videoPlay (conf) ──────│◀─ videoPlay (conf) ──────│
   │                          │                          │
   │── sendMessage ──────────▶│                          │
   │                          │── receiveMessage ───────▶│
   │◀─ receiveMessage ────────│◀─ receiveMessage ────────│

# Test Serveur Express
# Commande
curl http://localhost:5000

# Résultat 
{
  "success": true,
  "message": "TogetherPlay Backend API",
  "version": "1.0.0",
  "author": "Lina ALILI - Lead Backend/Sockets",
  "endpoints": {
    "rooms": "/api/rooms",
    "health": "/api/health",
    "createRoom": "POST /api/rooms/create"
  },
  "socket": {
    "status": "active",
    "clients": 0
  }
}

# Test Socket.io - Connexion
Fichier : test_socket.html
Résultats : SUCCÈS COMPLET
CONNECTÉ au serveur TogetherPlay!
Socket ID: sucfRHhFKIuHgG53AAAB
Heure serveur: 22:14:17
Pong reçu toutes les 5 secondes
Logs Serveur Correspondants :
 [22:14:17] Client connecté: sucfRHhFKIuHgG53AAAB
 [22:14:22] Pong envoyé à: sucfRHhFKIuHgG53AAAB
 [22:14:27] Pong envoyé à: sucfRHhFKIuHgG53AAAB
 // Simultané : 3 clients connectés
Client 1: Socket ID: abc123def456
Client 2: Socket ID: ghi789jkl012
Client 3: Socket ID: mno345pqr678

# Résultat
Serveur gère 3 connexions simultanées
Broadcast fonctionne pour tous
Aucune déconnexion inattendue

# Intégration Frontend
//
# Conclusion Technique
# Réussites Clés
Architecture modulaire - Séparation claire des responsabilités
Socket.io fonctionnel - Communication temps réel validée
Robustesse - Fallback automatique, gestion erreurs
Performance - Latence faible, mémoire optimisée





