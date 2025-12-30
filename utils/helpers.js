// Fonctions utilitaires
const helpers = {
  // Générer un ID de salon
  generateRoomId: () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Évite les confusions
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Valider un nom d'utilisateur
  validateUsername: (username) => {
    if (!username || username.trim().length === 0) {
      return false;
    }
    const trimmed = username.trim();
    return trimmed.length >= 2 && trimmed.length <= 20;
  },

  // Valider un ID de salon
  validateRoomId: (roomId) => {
    return roomId && roomId.length === 8 && /^[A-Z0-9]+$/.test(roomId);
  },

  // Formater la durée (secondes → HH:MM:SS)
  formatDuration: (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  },

  // Limiter le texte (pour logs)
  truncateText: (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  // Obtenir le timestamp actuel formaté
  getTimestamp: () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }
};

module.exports = helpers;