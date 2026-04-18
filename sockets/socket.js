const {
  addUserToRoom,
  removeUserFromRoom,
  getRoomUsers,
} = require("../rooms/roomManager");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM
    socket.on("joinRoom", ({ roomId, username }) => {
      if (!roomId || !username) return;

      socket.join(roomId);
      addUserToRoom(roomId, socket.id, username);

      io.to(roomId).emit("roomUsers", getRoomUsers(roomId));
    });

    // LEAVE ROOM
    socket.on("leaveRoom", ({ roomId }) => {
      socket.leave(roomId);
      removeUserFromRoom(roomId, socket.id);

      io.to(roomId).emit("roomUsers", getRoomUsers(roomId));
    });

    // CHAT
    socket.on("sendMessage", ({ roomId, message, username }) => {
      if (!message) return;

      io.to(roomId).emit("receiveMessage", {
        message,
        username,
        time: new Date(),
      });
    });

    // VIDEO PLAY
    socket.on("videoPlay", ({ roomId, currentTime }) => {
      io.to(roomId).emit("videoPlay", { currentTime });
    });

    // VIDEO PAUSE (FIX BUG 🔥)
    socket.on("videoPause", ({ roomId, currentTime }) => {
      io.to(roomId).emit("videoPause", { currentTime });
    });

    // VIDEO SEEK
    socket.on("videoSeek", ({ roomId, currentTime }) => {
      io.to(roomId).emit("videoSeek", { currentTime });
    });

    // ANNOTATION
    socket.on("addAnnotation", ({ roomId, text, time, username }) => {
      if (!text) return;

      io.to(roomId).emit("newAnnotation", {
        text,
        time,
        username,
      });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};