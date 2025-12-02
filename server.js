import http from "http";
import app from "./app.js";
import { Server } from "socket.io";

import videoSocket from "./sockets/videoSocket.js";
import chatSocket from "./sockets/chatSocket.js";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Socket modules
io.on("connection", (socket) => {
  videoSocket(socket, io);
  chatSocket(socket, io);
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
