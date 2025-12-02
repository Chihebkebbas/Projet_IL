import { createRoom, joinRoom } from "../services/roomService.js";

export function handleCreateRoom(req, res) {
  const { roomName } = req.body;
  const roomCode = createRoom(roomName);
  res.json({ roomCode });
}

export function handleJoinRoom(req, res) {
  const { roomCode, username } = req.body;

  const room = joinRoom(roomCode, username);
  if (!room) return res.status(404).json({ error: "Salon introuvable" });

  res.json(room);
}
