exports.syncState = (socket, io) => {

  socket.on("sync:state", ({ roomId, state }) => {

    socket.to(roomId).emit("sync:update", {
      videoTime: state.videoTime,
      isPlaying: state.isPlaying
    });

  });

};