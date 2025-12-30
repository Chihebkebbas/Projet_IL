class SyncHandler {
  constructor() {
    this.roomStates = new Map();
  }

  // Synchroniser la vidéo pour tous les utilisateurs
  syncVideo(roomId, action, data, emitterSocketId) {
    const syncData = {
      ...data,
      action,
      emitterSocketId,
      serverTimestamp: Date.now(),
      syncId: this.generateSyncId()
    };

    return syncData;
  }

  // Gérer le décalage réseau
  calculateNetworkLag(clientTimestamp) {
    const serverTimestamp = Date.now();
    return serverTimestamp - clientTimestamp;
  }

  // Générer un ID de synchronisation
  generateSyncId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Vérifier si la synchronisation est nécessaire
  shouldSync(roomId, lastSyncTime, threshold = 1000) {
    const now = Date.now();
    const lastSync = this.roomStates.get(roomId)?.lastSync || 0;
    
    return (now - lastSync) > threshold;
  }

  // Mettre à jour l'état de la room
  updateRoomState(roomId, state) {
    if (!this.roomStates.has(roomId)) {
      this.roomStates.set(roomId, {});
    }
    
    const roomState = this.roomStates.get(roomId);
    this.roomStates.set(roomId, {
      ...roomState,
      ...state,
      lastUpdated: Date.now()
    });
  }

  // Récupérer l'état de la room
  getRoomState(roomId) {
    return this.roomStates.get(roomId) || {};
  }
}

module.exports = new SyncHandler();