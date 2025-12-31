import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './db.js';

import Room from './models/Room.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON body parsing

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

/* ------------------------------------------------------------
   API ROUTES
------------------------------------------------------------ */

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));

    // API routes should be above this catch-all
}

// POST /api/rooms: Create a new room
app.post('/api/rooms', async (req, res) => {
    try {
        // Generate a random ID (or let Mongo do it, but we want short readable IDs maybe? 
        // For now, let's use a random string)
        const roomId = Math.random().toString(36).substring(2, 9);

        const newRoom = new Room({
            roomId: roomId,
            playlist: [],
            messages: []
        });

        await newRoom.save();
        res.status(201).json({ roomId });
    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/rooms/:roomId: Check if room exists
app.get('/api/rooms/:roomId', async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});


/* ------------------------------------------------------------
   SOCKET.IO LOGIC
------------------------------------------------------------ */

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific room
    socket.on('join_room', async (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Optional: Send current room state (playlist/chat) to the user immediately
        const room = await Room.findOne({ roomId });
        if (room) {
            socket.emit('room_data', {
                playlist: room.playlist,
                messages: room.messages,
                currentVideo: room.currentVideo
            });
        }
    });

    // Send Message
    socket.on('send_message', async (data) => {
        const { roomId, message } = data; // message = { sender, text, date }

        // Save to DB
        try {
            await Room.updateOne(
                { roomId: roomId },
                { $push: { messages: message } }
            );
        } catch (e) { console.error("Error saving msg", e); }

        // Broadcast to Room ONLY
        io.to(roomId).emit('receive_message', message);
    });

    // Send Playlist Update (Add/Remove/Order)
    socket.on('update_playlist', async (data) => {
        const { roomId, playlist } = data;

        try {
            await Room.updateOne(
                { roomId: roomId },
                { $set: { playlist: playlist } }
            );
        } catch (e) { console.error("Error saving playlist", e); }

        io.to(roomId).emit('playlist_updated', playlist);
    });

    // Video Change (New video selected)
    socket.on('video_changed', async (data) => {
        const { roomId, video } = data;

        try {
            await Room.updateOne(
                { roomId: roomId },
                { $set: { currentVideo: video } }
            );
        } catch (e) { console.error("Error saving current video", e); }

        io.to(roomId).emit('video_changed', video);
    });

    // Video State Change (Play/Pause/Seek)
    socket.on('video_state_change', async (data) => {
        const { roomId, videoState } = data;
        // videoState = { isPlaying, currentTime, videoId ... }

        // Only persist selected data if needed
        // For now just broadcast
        socket.to(roomId).emit('video_state_updated', videoState);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});



// Handle SPA routing in production (Catch-all)
if (process.env.NODE_ENV === 'production') {
    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
