module.exports = function(socket, io) {

  socket.on("video:play", ({ roomId, time }) => {

    socket.to(roomId).emit("video:play", {
      time
    });

  });

  socket.on("video:pause", ({ roomId, time }) => {

    socket.to(roomId).emit("video:pause", {
      time
    });

  });

  socket.on("video:seek", ({ roomId, time }) => {

    socket.to(roomId).emit("video:seek", {
      time
    });

  });

};