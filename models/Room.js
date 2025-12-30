const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roomSchema = new mongoose.Schema({
  // Identification
  roomId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().slice(0, 8).toUpperCase() // Ex: "A1B2C3D4"
  },
  roomName: {
    type: String,
    required: true,
    default: 'Salon Ensemble'
  },
  
  // Administration
  adminSocketId: {
    type: String,
    required: true
  },
  adminUsername: {
    type: String,
    required: true
  },
  
  // Utilisateurs
  users: [{
    username: {
      type: String,
      required: true
    },
    socketId: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }],
  
  // Vidéo en cours
  currentVideo: {
    videoId: String,
    title: String,
    thumbnail: String,
    duration: Number, // en secondes
    timestamp: {      // position actuelle
      type: Number,
      default: 0
    },
    isPlaying: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Playlist
  playlist: [{
    videoId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String
    },
    duration: {
      type: Number,
      default: 0
    },
    addedBy: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Chat
  messages: [{
    username: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  }],
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour la recherche et l'expiration
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
roomSchema.index({ roomId: 1 }, { unique: true });
roomSchema.index({ 'users.socketId': 1 });

// Méthodes du modèle
roomSchema.methods.addUser = function(username, socketId) {
  this.users.push({
    username,
    socketId,
    joinedAt: new Date(),
    isAdmin: this.users.length === 0 // Premier utilisateur = admin
  });
  this.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.removeUser = function(socketId) {
  this.users = this.users.filter(user => user.socketId !== socketId);
  this.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.addMessage = function(username, text, isSystem = false) {
  const message = {
    username,
    text,
    timestamp: new Date(),
    isSystem
  };
  
  // Garder seulement les 100 derniers messages
  this.messages.push(message);
  if (this.messages.length > 100) {
    this.messages = this.messages.slice(-100);
  }
  
  this.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.addToPlaylist = function(video, addedBy) {
  const playlistItem = {
    videoId: video.videoId,
    title: video.title,
    thumbnail: video.thumbnail,
    duration: video.duration || 0,
    addedBy,
    addedAt: new Date(),
    order: this.playlist.length
  };
  
  this.playlist.push(playlistItem);
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Room', roomSchema);