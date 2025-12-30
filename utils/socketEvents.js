module.exports = {
  // Connexion/Salon
  JOIN_ROOM: 'joinRoom',
  ROOM_JOINED: 'roomJoined',
  LEAVE_ROOM: 'leaveRoom',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  USER_LIST_UPDATE: 'userListUpdate',
  
  // Vidéo
  VIDEO_PLAY: 'videoPlay',
  VIDEO_PAUSE: 'videoPause',
  VIDEO_SEEK: 'videoSeek',
  VIDEO_CHANGE: 'videoChange',
  VIDEO_BUFFERING: 'videoBuffering',
  VIDEO_ENDED: 'videoEnded',
  SYNC_REQUEST: 'syncRequest',
  SYNC_RESPONSE: 'syncResponse',
  
  // Chat
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_MESSAGE: 'receiveMessage',
  MESSAGE_HISTORY: 'messageHistory',
  
  // Playlist
  ADD_TO_PLAYLIST: 'addToPlaylist',
  REMOVE_FROM_PLAYLIST: 'removeFromPlaylist',
  PLAYLIST_UPDATED: 'playlistUpdated',
  PLAY_NEXT_VIDEO: 'playNextVideo',
  PLAY_PREVIOUS_VIDEO: 'playPreviousVideo',
  REORDER_PLAYLIST: 'reorderPlaylist',
  
  // Administration
  KICK_USER: 'kickUser',
  USER_KICKED: 'userKicked',
  TRANSFER_ADMIN: 'transferAdmin',
  ADMIN_CHANGED: 'adminChanged',
  UPDATE_ROOM_SETTINGS: 'updateRoomSettings',
  
  // Système
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  PING: 'ping',
  PONG: 'pong',
  CONNECTION_STATUS: 'connectionStatus',
  
  // État
  GET_ROOM_STATE: 'getRoomState',
  ROOM_STATE: 'roomState',
  USER_STATE: 'userState'
};