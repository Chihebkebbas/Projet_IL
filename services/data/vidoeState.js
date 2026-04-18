const videoStates = {};

function setVideoState(roomId, state) {
  videoStates[roomId] = state;
}

function getVideoState(roomId) {
  return videoStates[roomId] || {
    currentTime: 0,
    isPlaying: false,
  };
}

module.exports = {
  setVideoState,
  getVideoState,
};