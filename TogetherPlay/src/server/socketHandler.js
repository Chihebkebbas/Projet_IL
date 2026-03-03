import Room from './models/Room.js';

export default function socketHandler(io) {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a specific room
        socket.on('join_room', async (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);

            // Send current room state
            try {
                const room = await Room.findOne({ roomId });
                if (room) {
                    socket.emit('room_data', {
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

        // Add Marker
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

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
        });
    });
}
