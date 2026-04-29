import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

import connectDB from './db.js';
import Room from './models/Room.js';
import socketHandler from './socketHandler.js';
import { searchVideos, getSuggestions } from './youtube.js';
import { expressLimiter } from './rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '32kb' }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] }
});

/* ------------------------------------------------------------
   API ROUTES
------------------------------------------------------------ */

const apiLimiter = expressLimiter({ windowMs: 60 * 1000, max: 60 });
const ytLimiter = expressLimiter({ windowMs: 60 * 1000, max: 30 });

// Generate a short, collision-checked room ID.
async function generateRoomId() {
    for (let i = 0; i < 5; i++) {
        const id = randomUUID().replace(/-/g, '').slice(0, 8);
        const exists = await Room.exists({ roomId: id });
        if (!exists) return id;
    }
    throw new Error('Could not allocate room id');
}

// Health-check (used by Docker HEALTHCHECK and load balancers)
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/rooms', apiLimiter, async (req, res) => {
    try {
        const adminRaw = (req.body?.admin ?? '').toString().trim();
        if (!adminRaw || adminRaw.length > 30) {
            return res.status(400).json({ error: "Nom d'utilisateur invalide" });
        }
        const roomId = await generateRoomId();
        await new Room({
            roomId,
            admin: adminRaw,
            playlist: [],
            messages: []
        }).save();
        res.status(201).json({ roomId });
    } catch (err) {
        console.error('Error creating room:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/api/rooms/:roomId', apiLimiter, async (req, res) => {
    try {
        const id = String(req.params.roomId).trim();
        if (!/^[a-zA-Z0-9]{4,16}$/.test(id)) {
            return res.status(400).json({ error: 'Room id invalide' });
        }
        const room = await Room.findOne({ roomId: id }, { roomId: 1, admin: 1 });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json({ roomId: room.roomId, admin: room.admin });
    } catch {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/api/youtube/search', ytLimiter, async (req, res) => {
    try {
        const results = await searchVideos(req.query.q);
        res.json(results);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

app.get('/api/youtube/suggestions', ytLimiter, async (_req, res) => {
    try {
        const results = await getSuggestions();
        res.json(results);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/* ------------------------------------------------------------
   SOCKET.IO
------------------------------------------------------------ */

socketHandler(io);

/* ------------------------------------------------------------
   STATIC (production)
------------------------------------------------------------ */

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));
    app.get(/.*/, (_req, res) => {
        res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
    });
}

httpServer.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
