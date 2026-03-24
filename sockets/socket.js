const videoEvents = require("./events/videoEvents");
const annotationEvents = require("./events/annotationEvents");
const roomManager = require("./rooms/roomManager");

module.exports = function(io) {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("room:join", ({ roomId, username }) => {
      roomManager.joinRoom(socket, roomId, username, io);
    });

    socket.on("disconnect", () => {
      roomManager.leaveRoom(socket, io);
    });

    videoEvents(socket, io);
    annotationEvents(socket, io);

  });

};