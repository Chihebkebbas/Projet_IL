const rooms = {};

function addUserToRoom(roomId, socketId, username) {
  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }

  rooms[roomId].push({ socketId, username });
}

function removeUserFromRoom(roomId, socketId) {
  if (!rooms[roomId]) return;

  rooms[roomId] = rooms[roomId].filter(
    (user) => user.socketId !== socketId
  );
}

module.exports = {
  addUserToRoom,
  removeUserFromRoom,
};