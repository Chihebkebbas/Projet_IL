const { addUserToRoom, removeUserFromRoom } = require("../rooms/roomManager");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 🔹 rejoindre un salon
    socket.on("joinRoom", ({ roomId, username }) => {
      socket.join(roomId);

      addUserToRoom(roomId, socket.id, username);

      console.log(`${username} joined room ${roomId}`);

      io.to(roomId).emit("userJoined", {
        userId: socket.id,
        username,
      });
    });

    // 🔹 quitter salon
    socket.on("leaveRoom", ({ roomId }) => {
      socket.leave(roomId);
      removeUserFromRoom(roomId, socket.id);

      io.to(roomId).emit("userLeft", socket.id);
    });

    // 🔹 CHAT
    socket.on("sendMessage", ({ roomId, message, username }) => {
      io.to(roomId).emit("receiveMessage", {
        message,
        username,
        time: new Date(),
      });
    });

    // 🔹 PLAY VIDEO
    socket.on("videoPlay", ({ roomId, currentTime }) => {
      socket.to(roomId).emit("videoPlay", { currentTime });
    });

    // 🔹 PAUSE VIDEO
    socket.on("videoPause", ({ roomId, currentTime }) => {
      socket.to(roomId).emit("videoPause", { currentTime });
    });

    // 🔹 SEEK VIDEO
    socket.on("videoSeek", ({ roomId, currentTime }) => {
      socket.to(roomId).emit("videoSeek", { currentTime });
    });

    // 🔹 AJOUT ANNOTATION
    socket.on("addAnnotation", ({ roomId, text, time, username }) => {
      io.to(roomId).emit("newAnnotation", {
        text,
        time,
        username,
      });
    });

    // 🔹 déconnexion
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};