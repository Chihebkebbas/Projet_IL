import Room from './models/Room.js';

const roomMembers = {}; // { roomId: [{ socketId, username }] }
const roomAdmins = {}; // { roomId: username }

export default function socketHandler(io) {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a specific room
        socket.on('join_room', async (data) => {
            const roomId = typeof data === 'string' ? data : data.roomId;
            const username = typeof data === 'object' ? data.username : "Invité";

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

        // Send Playlist Update
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
                    break; // assumption: a socket only belongs to one room
                }
            }
        });
    });
}
