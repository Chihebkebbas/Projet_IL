require("dotenv").config();
const connectDB = require("./src/config/db");

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const playlistRoutes = require("./src/routes/playlist.routes");
const youtubeRoutes = require("./src/routes/youtube.routes");


const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/salons", playlistRoutes);
app.use("/api/youtube", youtubeRoutes);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {

    console.log(" Nouveau client connecté :", socket.id);

    // Simulations temporaires (S1)
    const userId = socket.handshake.query.userId || socket.id;
    const username = socket.handshake.query.username || `User-${socket.id.substring(0, 4)}`;

    socket.data = { userId, username };

    socket.on("disconnect", () => {
        console.log("Client déconnecté :", socket.id);
    });
});

// === Lancement du serveur ===
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
