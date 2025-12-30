const Room = require('../models/Room');
const EVENTS = require('../utils/socketEvents');

// Stockage temporaire des salles (fallback si MongoDB down)
const tempRooms = new Map();

const handleSocketEvents = (socket, io) => {
  console.log(` [${new Date().toLocaleTimeString()}] Socket connecté: ${socket.id}`);

  // ==================== 1. GESTION DES SALONS ====================
  
  socket.on(EVENTS.JOIN_ROOM, async ({ roomId, username }) => {
    try {
      console.log(` ${username} veut rejoindre ${roomId}`);
      
      // Validation
      if (!roomId || !username) {
        return socket.emit(EVENTS.ERROR, { message: 'Données manquantes' });
      }

      let room;
      
      // Essayer MongoDB d'abord
      try {
        room = await Room.findOne({ roomId });
      } catch (dbError) {
        console.log(' MongoDB non disponible, utilisation du mode temporaire');
        room = null;
      }
      
      if (!room) {
        // Créer un nouveau salon (MongoDB ou temporaire)
        if (mongoose.connection.readyState === 1) {
          // Avec MongoDB
          room = new Room({
            roomId,
            roomName: `Salon de ${username}`,
            adminSocketId: socket.id,
            adminUsername: username
          });
          
          await room.addUser(username, socket.id);
          console.log(`✅ Salon créé dans MongoDB: ${roomId}`);
          
        } else {
          // Mode temporaire
          room = {
            roomId,
            roomName: `Salon de ${username}`,
            adminSocketId: socket.id,
            adminUsername: username,
            users: [{ username, socketId: socket.id, isAdmin: true }],
            currentVideo: null,
            playlist: [],
            messages: [],
            createdAt: new Date()
          };
          tempRooms.set(roomId, room);
          console.log(` Salon créé en temporaire: ${roomId}`);
        }
      } else {
        // Rejoindre un salon existant
        if (mongoose.connection.readyState === 1) {
          await room.addUser(username, socket.id);
        } else {
          room.users.push({ username, socketId: socket.id, isAdmin: false });
          tempRooms.set(roomId, room);
        }
        console.log(` ${username} a rejoint ${roomId}`);
      }
      
      // Rejoindre la room Socket.io
      socket.join(roomId);
      
      // Envoyer les données au client
      const response = {
        success: true,
        room: {
          roomId: room.roomId,
          roomName: room.roomName,
          users: room.users,
          currentVideo: room.currentVideo,
          playlist: room.playlist,
          messages: room.messages.slice(-50) // 50 derniers messages
        },
        user: {
          username,
          socketId: socket.id,
          isAdmin: room.adminSocketId === socket.id
        }
      };
      
      socket.emit(EVENTS.ROOM_JOINED, response);
      
      // Notifier les autres utilisateurs
      socket.to(roomId).emit(EVENTS.USER_JOINED, {
        username,
        socketId: socket.id,
        users: room.users
      });
      
      // Mettre à jour la liste des utilisateurs pour tous
      io.to(roomId).emit(EVENTS.USER_LIST_UPDATE, room.users);
      
      // Message système
      const systemMessage = {
        username: 'Système',
        text: `${username} a rejoint le salon`,
        timestamp: new Date(),
        isSystem: true
      };
      
      io.to(roomId).emit(EVENTS.RECEIVE_MESSAGE, systemMessage);
      
    } catch (error) {
      console.error(' Erreur joinRoom:', error);
      socket.emit(EVENTS.ERROR, { 
        message: 'Erreur lors de la connexion au salon',
        error: error.message 
      });
    }
  });

  // ==================== 2. SYNCHRONISATION VIDÉO ====================
  
  socket.on(EVENTS.VIDEO_PLAY, ({ roomId, timestamp, videoId }) => {
    console.log(` Play dans ${roomId} à ${timestamp}s`);
    
    // Diffuser à tous sauf à l'émetteur
    socket.to(roomId).emit(EVENTS.VIDEO_PLAY, { 
      timestamp: timestamp || 0,
      videoId,
      emittedBy: socket.id,
      serverTime: Date.now()
    });
  });

  socket.on(EVENTS.VIDEO_PAUSE, ({ roomId, timestamp }) => {
    console.log(` Pause dans ${roomId} à ${timestamp}s`);
    socket.to(roomId).emit(EVENTS.VIDEO_PAUSE, { 
      timestamp,
      emittedBy: socket.id 
    });
  });

  socket.on(EVENTS.VIDEO_SEEK, ({ roomId, timestamp }) => {
    console.log(` Seek dans ${roomId} à ${timestamp}s`);
    socket.to(roomId).emit(EVENTS.VIDEO_SEEK, { 
      timestamp,
      emittedBy: socket.id 
    });
  });

  socket.on(EVENTS.VIDEO_CHANGE, ({ roomId, video }) => {
    console.log(` Changement vidéo dans ${roomId}: ${video.title}`);
    socket.to(roomId).emit(EVENTS.VIDEO_CHANGE, { 
      video,
      emittedBy: socket.id 
    });
  });

  // ==================== 3. CHAT ====================
  
  socket.on(EVENTS.SEND_MESSAGE, async ({ roomId, username, text }) => {
    try {
      if (!text || text.trim().length === 0) return;
      
      const message = {
        username,
        text: text.trim(),
        timestamp: new Date()
      };
      
      console.log(` [${roomId}] ${username}: ${text.substring(0, 30)}...`);
      
      // Sauvegarder en MongoDB si disponible
      if (mongoose.connection.readyState === 1) {
        const room = await Room.findOne({ roomId });
        if (room) {
          await room.addMessage(username, text);
        }
      } else {
        // Mode temporaire
        const room = tempRooms.get(roomId);
        if (room) {
          room.messages.push(message);
          if (room.messages.length > 100) {
            room.messages = room.messages.slice(-100);
          }
        }
      }
      
      // Diffuser à tous dans la room
      io.to(roomId).emit(EVENTS.RECEIVE_MESSAGE, message);
      
    } catch (error) {
      console.error(' Erreur sendMessage:', error);
    }
  });

  // ==================== 4. PLAYLIST ====================
  
  socket.on(EVENTS.ADD_TO_PLAYLIST, async ({ roomId, video, addedBy }) => {
    try {
      console.log(`Ajout playlist dans ${roomId}: ${video.title}`);
      
      // Sauvegarder
      if (mongoose.connection.readyState === 1) {
        const room = await Room.findOne({ roomId });
        if (room) {
          await room.addToPlaylist(video, addedBy);
          
          // Diffuser la playlist mise à jour
          io.to(roomId).emit(EVENTS.PLAYLIST_UPDATED, room.playlist);
          
          // Message système
          io.to(roomId).emit(EVENTS.RECEIVE_MESSAGE, {
            username: 'Système',
            text: `${addedBy} a ajouté "${video.title}" à la playlist`,
            timestamp: new Date(),
            isSystem: true
          });
        }
      }
      
    } catch (error) {
      console.error(' Erreur addToPlaylist:', error);
    }
  });
  //les evenement metiers 
  // Dans controllers/socketController.js, ajoute :
socket.on('sendMessage', ({ roomId, username, text }) => {
  console.log(` [${roomId}] ${username}: ${text}`);
  // ... ton code existant ...
});

socket.on('videoPlay', ({ roomId, timestamp, videoId }) => {
  console.log(` [${roomId}] Play à ${timestamp}s - Video: ${videoId}`);
  // ... ton code existant ...
});

  // ==================== 5. DÉCONNEXION ====================
  
  socket.on('disconnect', async () => {
    console.log(` [${new Date().toLocaleTimeString()}] Socket déconnecté: ${socket.id}`);
    
    try {
      // Chercher dans MongoDB
      if (mongoose.connection.readyState === 1) {
        const rooms = await Room.find({ 'users.socketId': socket.id });
        
        for (const room of rooms) {
          const user = room.users.find(u => u.socketId === socket.id);
          if (!user) continue;
          
          await room.removeUser(socket.id);
          
          // Message système
          io.to(room.roomId).emit(EVENTS.RECEIVE_MESSAGE, {
            username: 'Système',
            text: `${user.username} a quitté le salon`,
            timestamp: new Date(),
            isSystem: true
          });
          
          // Mettre à jour la liste des users
          io.to(room.roomId).emit(EVENTS.USER_LIST_UPDATE, room.users);
          
          // Supprimer la room si vide
          if (room.users.length === 0) {
            await Room.deleteOne({ roomId: room.roomId });
            console.log(` Salon ${room.roomId} supprimé (vide)`);
          }
        }
      } else {
        // Mode temporaire
        for (const [roomId, room] of tempRooms.entries()) {
          const userIndex = room.users.findIndex(u => u.socketId === socket.id);
          if (userIndex !== -1) {
            const username = room.users[userIndex].username;
            room.users.splice(userIndex, 1);
            
            // Notifier les autres
            io.to(roomId).emit(EVENTS.RECEIVE_MESSAGE, {
              username: 'Système',
              text: `${username} a quitté le salon`,
              timestamp: new Date(),
              isSystem: true
            });
            
            io.to(roomId).emit(EVENTS.USER_LIST_UPDATE, room.users);
            
            // Supprimer si vide
            if (room.users.length === 0) {
              tempRooms.delete(roomId);
            }
          }
        }
      }
    } catch (error) {
      console.error(' Erreur lors de la déconnexion:', error);
    }
  });

  // ==================== 6. PING/PONG ====================
  
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
};

module.exports = { handleSocketEvents };