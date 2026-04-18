const roomData = {};

function initRoom(roomId) {
  if (!roomData[roomId]) {
    roomData[roomId] = {
      messages: [],
      annotations: [],
    };
  }
}

function addMessage(roomId, message) {
  initRoom(roomId);
  roomData[roomId].messages.push(message);
}

function getMessages(roomId) {
  initRoom(roomId);
  return roomData[roomId].messages;
}

function addAnnotation(roomId, annotation) {
  initRoom(roomId);
  roomData[roomId].annotations.push(annotation);
}

function getAnnotations(roomId) {
  initRoom(roomId);
  return roomData[roomId].annotations;
}

module.exports = {
  addMessage,
  getMessages,
  addAnnotation,
  getAnnotations,
};