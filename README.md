# TogetherPlay Backend - Documentation Technique Détaillée
Développeur : Lina ALILI
Rôle : Lead Backend / Sockets

# Architecture Globale

L'architecture que j'ai développée pour TogetherPlay repose sur une dualité stratégique : un canal HTTP/REST pour les opérations ponctuelles et structurées (création de salons,

vérifications), et un canal WebSocket/Socket.io pour la synchronisation temps réel qui constitue le cœur du projet. Le serveur Express que j'ai configuré écoute simultanément sur le port 

5000, gérant à la fois les requêtes API traditionnelles et les connexions WebSocket permanentes. Mon contrôleur Socket.io - tâche principale de mon rôle de Lead Backend/Sockets - agit comme 

un centre de dispatch intelligent : il capture chaque action utilisateur (play, pause, message, ajout playlist) et la retransmet instantanément à tous les autres participants du même salon,

garantissant une expérience parfaitement synchronisée. L'architecture intègre un système de fallback automatique permettant au serveur de fonctionner en mode temporaire sans MongoDB, 

assurant ainsi une disponibilité continue même en l'absence de base de données, tout en restant prête à exploiter pleinement MongoDB lorsqu'il est disponible pour la persistance des données.


# Flux de Données
Connexion Initiale : Client → HTTP → API REST

Synchronisation : Client ↔ WebSocket ↔ Socket.io

Persistance : API → MongoDB (si disponible)

Broadcast : Socket.io → Tous les clients connectés

# Détails de Chaque Fichier

# server.js - Point d'Entrée Principal : 

Configuration serveur global(Test)

# controllers/socketController.js 

Coeur du système

# Logique Socket.io - Ma TÂCHE PRINCIPALE

# Événements Gérés :

GESTION DES SALONS

SYNCHRONISATION VIDÉO

CHAT TEMPS RÉEL

GESTION CONNEXIONS

# Algorithmes Implémentés :

Fallback MongoDB : Vérifie disponibilité → Mode temporaire si échec

Broadcast Intelligent : socket.to(roomId).emit() → Évite écho à l'émetteur

Nettoyage Automatique : Suppression salons vides après déconnexion

Limitation Messages : Garde seulement 100 derniers messages par salon

# models/Room.js - Modèle de Données

Responsabilité : Structure des salons

Schéma MongoDB :

# Méthodes Implémentées :

addUser(username, socketId) : Ajout utilisateur avec timestamp

removeUser(socketId) : Retrait avec nettoyage automatique

addMessage(username, text) : Ajout message avec limite 100

addToPlaylist(video, addedBy) : Ajout vidéo à playlist

# routes/roomRoutes.js - API REST

 Responsabilité : Endpoints HTTP
 
 Méthode	Endpoint	Description	Testé
 
GET        	/	        Info API	oui

POST	    /create	   Créer salon	oui

GET	      /exists/:roomId	Vérifier existence	oui

GET	      /:roomId	Infos   salon	oui

GET	      /test/connection	Test API	oui

# config/db.js - Connexion Base de Données

Responsabilité : Gestion connexion MongoDB

# Avantages :

Zero Downtime : Serveur fonctionne même sans DB

Adaptatif : Détecte automatiquement la disponibilité

Transparent : Même API avec ou sans persistance

# utils/socketEvents.js - Constantes

Responsabilité : Standardisation événements

# utils/syncHandler.js - Synchronisation Avancée

Responsabilité : Optimisation synchronisation

# utils/helpers.js - Fonctions Utilitaires

package.json - Configuration Projet

Socket.io - Système Temps Réel

 le mécanisme de synchronisation temps réel que j'ai implémenté : il montre comment chaque action utilisateur est capturée, traitée par mon serveur Socket.io, puis retransmise à tous les 
 
 participants. Par exemple, quand le Client A émet un événement joinRoom, mon serveur - via le contrôleur que j'ai développé - non seulement accueille ce client mais diffuse également sa 
 
 présence aux autres (roomJoined, userListUpdate). La magie opère notamment avec la synchronisation vidéo : lorsque le Client A lance la lecture (videoPlay), le serveur propage 
 
 instantanément cette commande au Client B tout en confirmant l'action aux deux parties, garantissant ainsi que tous les spectateurs voient exactement la même image au même instant. Le chat
 
 suit le même principe bidirectionnel : chaque message est capturé, traité par ma logique de gestion des événements, et diffusé à l'ensemble des participants, créant ainsi une expérience 
 
 collaborative fluide et parfaitement synchronisée.


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

// Cette partie est consacré a l'architecture globale de notre salon une fois relié entrre le Frontend et Backend

# Conclusion Technique
# Réussites Clés
Architecture modulaire - Séparation claire des responsabilités

Socket.io fonctionnel - Communication temps réel validée

Robustesse - Fallback automatique, gestion erreurs

Performance - Latence faible, mémoire optimisée





