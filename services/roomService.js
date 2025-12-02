import { rooms } from "../data/rooms.js";
import generateCode from "../utils/generateCode.js";

export function createRoom(roomName) {
  const code = generateCode();

  rooms[code] = {
    name: roomName,
    members: [],
    playlist: [],
    currentVideo: null,
    currentTime: 0,
    isPlaying: false
  };

  return code;
}

export function joinRoom(code, username) {
  if (!rooms[code]) return null;

  rooms[code].members.push(username);
  return rooms[code];
}
