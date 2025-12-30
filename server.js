const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import des modules
const connectDB = require('./config/db');
const { handleSocketEvents } = require('./controllers/socketController');
const roomRoutes = require('./routes/roomRoutes');
// errorHandler est optionnel, on le crée directement
const errorHandler = (err, req, res, next) => {
  console.error(' Erreur:', err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

// Initialisation
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données
connectDB();

// Routes API
app.use('/api/rooms', roomRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TogetherPlay Backend API',
    version: '1.0.0',
    author: 'Lina ALILI - Lead Backend/Sockets',
    endpoints: {
      rooms: '/api/rooms',
      health: '/api/health',
      createRoom: 'POST /api/rooms/create'
    },
    socket: {
      status: 'active',
      clients: io.engine.clientsCount
    }
  });
});

// Route santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected'
  });
});

// Gestion des sockets
io.on('connection', (socket) => {
  console.log(`🔌 Nouveau client connecté: ${socket.id}`);
  handleSocketEvents(socket, io);
});

// Gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(` SERVEUR TOGETHERPLAY DÉMARRÉ`);
  console.log(` Port: ${PORT}`);
  console.log(` API: http://localhost:${PORT}`);
  console.log(` Socket.IO: ws://localhost:${PORT}`);
  console.log(` Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(` MongoDB: ${process.env.MONGO_URI ? 'Connecté' : 'Non configuré'}`);
  console.log('='.repeat(50));
  console.log(' Développeur: Lina ALILI');
  console.log(' Rôle: Lead Backend / Sockets');
  console.log('='.repeat(50));
});

// Gestion des erreurs non catchées
process.on('unhandledRejection', (err) => {
  console.error(' Erreur non gérée:', err);
  server.close(() => process.exit(1));
});