import Room from './models/Room.js';

const roomMembers = {}; // { roomId: [{ socketId, username }] }
const roomAdmins = {}; // { roomId: username }
//join 
export default function socketHandler(io) {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a specific room
        socket.on('join_room', async (data) => {
            const roomId = typeof data === 'string' ? data : data.roomId;
            const username = typeof data === 'object' ? data.username : "Invité";
             socket.data.username = username;

            socket.join(roomId);
            console.log(`User ${socket.id} (${username}) joined room ${roomId}`);

            // Track member in room cleanly (prevent duplicates)
            if (!roomMembers[roomId]) roomMembers[roomId] = [];
            const isDuplicate = roomMembers[roomId].some(m => m.socketId === socket.id);
            if (!isDuplicate) {
                roomMembers[roomId].push({ socketId: socket.id, username });
            }

            // Broadcast updated members list AFTER fetching admin
            // Send current room state
            try {
                const room = await Room.findOne({ roomId });
                if (room) {
                    roomAdmins[roomId] = room.admin;
                    
                    io.to(roomId).emit('members_updated', {
                        members: roomMembers[roomId],
                        admin: room.admin
                    });

                    socket.emit('room_data', {
                        admin: room.admin,
                        playlist: room.playlist,
                        messages: room.messages,
                        currentVideo: room.currentVideo,
                        markers: room.markers
                    });
                }
            } catch (e) {
                console.error("Error fetching room data", e);
            }
        });

        // Send Message
        socket.on('send_message', async (data) => {
            const { roomId, message } = data;
            try {
                await Room.updateOne(
                    { roomId: roomId },
                    { $push: { messages: message } }
                );
            } catch (e) { console.error("Error saving msg", e); }
            io.to(roomId).emit('receive_message', message);
        });

        // Request Message History explicitly on mount
        socket.on('get_messages', async (roomId) => {
            try {
                const room = await Room.findOne({ roomId });
                if (room) {
                    socket.emit('message_history', room.messages);
                }
            } catch (e) { console.error("Error fetching msgs", e); }
        });

        // Send Playlist Update
            socket.on('update_playlist', async (data) => {
            const { roomId, playlist } = data;

            try {
                const room = await Room.findOne({ roomId });

                if (!room) {
                    socket.emit('playlist_error', { message: "Room introuvable." });
                    return;
                }

                const currentUsername = socket.data.username;
                const isAdmin = room.admin === currentUsername;

                const oldPlaylist = room.playlist || [];
                const newPlaylist = playlist || [];

                // Si la nouvelle playlist est plus petite => suppression
                const isDeletion = newPlaylist.length < oldPlaylist.length;

                if (isDeletion && !isAdmin) {
                    socket.emit('playlist_error', {
                        message: "Seul l'admin peut supprimer une vidéo de la playlist."
                    });
                    return;
                }

                await Room.updateOne(
                    { roomId },
                    { $set: { playlist } }
                );

                io.to(roomId).emit('playlist_updated', playlist);

            } catch (e) {
                console.error("Error saving playlist", e);
                socket.emit('playlist_error', { message: "Erreur serveur." });
            }
        });

        // Video Change
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

        // Video State Change
        socket.on('video_state_change', (data) => {
            const { roomId, videoState } = data;
            socket.to(roomId).emit('video_state_updated', videoState);
        });

        // Ajouter une annotation dans la base de données
        socket.on('add_marker', async (data) => {
            const { roomId, marker } = data;
            try {
                await Room.updateOne(
                    { roomId: roomId },
                    { $push: { markers: marker } }
                );
            } catch (e) {
                console.error("Error saving marker", e);
            }
            io.to(roomId).emit('receive_marker', marker);
        });

        // Kick a member
        socket.on('kick_user', async (data) => {
            const { roomId, targetSocketId } = data;
            const room = await Room.findOne({ roomId });
            if (room) {
                io.to(targetSocketId).emit('kicked');
                const targetSocket = io.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    targetSocket.leave(roomId);
                }
                // Update tracking
                if (roomMembers[roomId]) {
                    roomMembers[roomId] = roomMembers[roomId].filter(m => m.socketId !== targetSocketId);
                    io.to(roomId).emit('members_updated', {
                        members: roomMembers[roomId],
                        admin: roomAdmins[roomId]
                    });
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
            // Remove user from room tracking
            for (const [roomId, members] of Object.entries(roomMembers)) {
                const index = members.findIndex(m => m.socketId === socket.id);
                if (index !== -1) {
                    members.splice(index, 1);
                    io.to(roomId).emit('members_updated', {
                        members: members,
                        admin: roomAdmins[roomId]
                    });
                    if (members.length === 0) {
                        delete roomMembers[roomId];
                        delete roomAdmins[roomId];
                    }
                    break; 
                }
            }
        });
    });
}
