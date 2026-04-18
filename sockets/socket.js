const {
  addUserToRoom,
  removeUserFromRoom,
  getRoomUsers,
} = require("../rooms/roomManager");

const {
  setVideoState,
  getVideoState,
} = require("../state/videoState");

const {
  addMessage,
  getMessages,
  addAnnotation,
  getAnnotations,
} = require("../data/store");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM
    socket.on("joinRoom", ({ roomId, username }) => {
      socket.join(roomId);

      addUserToRoom(roomId, socket.id, username);

      // envoyer utilisateurs
      io.to(roomId).emit("roomUsers", getRoomUsers(roomId));

      // envoyer état vidéo actuel
      socket.emit("videoState", getVideoState(roomId));

      // envoyer historique chat
      socket.emit("chatHistory", getMessages(roomId));

      // envoyer annotations
      socket.emit("annotations", getAnnotations(roomId));
    });

    // CHAT
    socket.on("sendMessage", ({ roomId, message, username }) => {
      const msg = {
        message,
        username,
        time: new Date(),
      };

      addMessage(roomId, msg);

      io.to(roomId).emit("receiveMessage", msg);
    });

    // PLAY
    socket.on("videoPlay", ({ roomId, currentTime }) => {
      setVideoState(roomId, {
        currentTime,
        isPlaying: true,
      });

      io.to(roomId).emit("videoPlay", { currentTime });
    });

    // PAUSE (FIX PRO 🔥)
    socket.on("videoPause", ({ roomId, currentTime }) => {
      setVideoState(roomId, {
        currentTime,
        isPlaying: false,
      });

      io.to(roomId).emit("videoPause", { currentTime });
    });

    // SEEK
    socket.on("videoSeek", ({ roomId, currentTime }) => {
      setVideoState(roomId, {
        currentTime,
        isPlaying: false,
      });

      io.to(roomId).emit("videoSeek", { currentTime });
    });

    // ANNOTATION
    socket.on("addAnnotation", ({ roomId, text, time, username }) => {
      const annotation = {
        text,
        time,
        username,
      };

      addAnnotation(roomId, annotation);

      io.to(roomId).emit("newAnnotation", annotation);
    });

    // LEAVE
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};