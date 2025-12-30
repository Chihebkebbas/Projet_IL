// routes/roomRoutes.js - BACKEND Node.js ROUTES API
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Route GET /api/rooms
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Rooms - TogetherPlay Backend',
    version: '1.0.0',
    author: 'Lina ALILI',
    endpoints: [
      'POST /create - Créer un salon',
      'GET /:roomId - Infos salon',
      'GET /test - Tester API'
    ]
  });
});

// POST /api/rooms/create - Créer un salon
router.post('/create', async (req, res) => {
  try {
    const { roomName, username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur requis'
      });
    }

    // Créer un ID de salon simple
    const roomId = 'TP' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const room = new Room({
      roomId: roomId,
      roomName: roomName || `Salon de ${username}`,
      adminUsername: username,
      adminSocketId: 'pending', // Sera mis à jour lors de la connexion socket
      users: [],
      playlist: [],
      messages: [],
      isActive: true
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: ' Salon créé avec succès !',
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        adminUsername: room.adminUsername,
        createdAt: room.createdAt,
        inviteLink: `http://localhost:3000/join/${room.roomId}`
      }
    });

  } catch (error) {
    console.error(' Erreur création salon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du salon'
    });
  }
});

// GET /api/rooms/:roomId - Obtenir infos salon
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Salon non trouvé'
      });
    }

    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        users: room.users,
        currentVideo: room.currentVideo,
        playlist: room.playlist,
        createdAt: room.createdAt,
        isActive: room.isActive,
        userCount: room.users.length
      }
    });

  } catch (error) {
    console.error(' Erreur récupération salon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du salon'
    });
  }
});

// Route test
router.get('/test/connection', (req, res) => {
  res.json({
    success: true,
    message: 'API Rooms Backend fonctionnelle !',
    timestamp: new Date().toISOString(),
    developer: 'Lina ALILI',
    role: 'Lead Backend / Sockets'
  });
});

// ==================== EXPORT ====================

module.exports = router;