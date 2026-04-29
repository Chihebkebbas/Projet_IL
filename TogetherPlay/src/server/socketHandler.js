import Room from './models/Room.js';
import { rateLimit } from './rateLimit.js';

const roomMembers = {}; // { roomId: [{ socketId, username }] }
const roomAdmins = {};  // { roomId: username }
const roomPlayback = {}; // { roomId: { isPlaying, currentTime, updatedAt } }

const PLAYLIST_MAX = 100;
const MARKER_MAX = 200;
const MESSAGE_MAX = 300;
const USERNAME_MAX = 30;
const HEARTBEAT_MS = 3000;

function sanitizeStr(value, max) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > max) return null;
    return trimmed;
}

function sanitizeRoomId(id) {
    if (typeof id !== 'string') return null;
    return /^[a-zA-Z0-9]{4,16}$/.test(id) ? id : null;
}

function sanitizePlaylistItem(item, fallbackUser) {
    if (!item || typeof item !== 'object') return null;
    const safe = {
        id: sanitizeStr(item.id, 64),
        videoId: sanitizeStr(item.videoId, 32),
        title: sanitizeStr(item.title, 200) || 'Sans titre',
        thumbnail: sanitizeStr(item.thumbnail, 500) || '',
        duration: sanitizeStr(item.duration, 16) || '',
        addedBy: sanitizeStr(item.addedBy, USERNAME_MAX) || fallbackUser || ''
    };
    if (!safe.id || !safe.videoId) return null;
    return safe;
}

function isAdmin(socket, roomId) {
    return !!socket.data.username && roomAdmins[roomId] === socket.data.username;
}

function checkRate(socket, kind, max, windowMs) {
    const r = rateLimit({ key: `socket:${kind}:${socket.id}`, windowMs, max });
    if (!r.allowed) {
        socket.emit('rate_limited', { kind, retryAfterMs: r.retryAfterMs });
        return false;
    }
    return true;
}

// Compute the effective playback state for a room at the current instant.
// Server time is the trusted reference; clients adjust using `updatedAt`.
function effectivePlayback(roomId) {
    const p = roomPlayback[roomId];
    if (!p) return { isPlaying: false, currentTime: 0, updatedAt: Date.now() };
    return { ...p };
}

export default function socketHandler(io) {
    // Heartbeat: re-broadcast playback state for rooms that are playing,
    // so any client that drifted (buffering, tab in background) re-aligns.
    setInterval(() => {
        for (const [roomId, p] of Object.entries(roomPlayback)) {
            if (!p?.isPlaying) continue;
            io.to(roomId).emit('video_state_updated', {
                ...p,
                serverTime: Date.now()
            });
        }
    }, HEARTBEAT_MS);

    io.on('connection', (socket) => {
        socket.data.username = null;
        socket.data.roomId = null;

        socket.on('join_room', async (data) => {
            if (!checkRate(socket, 'join', 10, 60_000)) return;

            const roomId = sanitizeRoomId(typeof data === 'string' ? data : data?.roomId);
            const username = sanitizeStr(typeof data === 'object' ? data?.username : null, USERNAME_MAX) || 'Invité';
            if (!roomId) return socket.emit('room_error', { message: 'Salon invalide.' });

            try {
                const room = await Room.findOne({ roomId });
                if (!room) return socket.emit('room_error', { message: 'Salon introuvable.' });

                if (socket.data.roomId && socket.data.roomId !== roomId) {
                    socket.leave(socket.data.roomId);
                }

                socket.data.username = username;
                socket.data.roomId = roomId;
                socket.join(roomId);

                if (!roomMembers[roomId]) roomMembers[roomId] = [];

                // Single-session invariant: same username in same room → kick previous.
                const stale = roomMembers[roomId].filter(
                    m => m.username === username && m.socketId !== socket.id
                );
                for (const old of stale) {
                    const oldSocket = io.sockets.sockets.get(old.socketId);
                    if (oldSocket) {
                        oldSocket.emit('session_replaced');
                        oldSocket.leave(roomId);
                        oldSocket.data.roomId = null;
                    }
                }
                roomMembers[roomId] = roomMembers[roomId].filter(
                    m => m.username !== username || m.socketId === socket.id
                );

                if (!roomMembers[roomId].some(m => m.socketId === socket.id)) {
                    roomMembers[roomId].push({ socketId: socket.id, username });
                }
                roomAdmins[roomId] = room.admin;

                // Hydrate in-memory playback cache from DB on first member.
                if (!roomPlayback[roomId]) {
                    roomPlayback[roomId] = room.playback?.updatedAt
                        ? {
                            isPlaying: !!room.playback.isPlaying,
                            currentTime: Number(room.playback.currentTime) || 0,
                            updatedAt: Number(room.playback.updatedAt) || Date.now()
                        }
                        : { isPlaying: false, currentTime: 0, updatedAt: Date.now() };
                }

                io.to(roomId).emit('members_updated', {
                    members: roomMembers[roomId],
                    admin: room.admin
                });

                socket.emit('room_data', {
                    admin: room.admin,
                    playlist: room.playlist,
                    messages: room.messages,
                    currentVideo: room.currentVideo,
                    markers: room.markers,
                    playback: effectivePlayback(roomId),
                    serverTime: Date.now()
                });
            } catch (e) {
                console.error('Error fetching room data', e);
                socket.emit('room_error', { message: 'Erreur serveur.' });
            }
        });

        socket.on('send_message', async (data) => {
            if (!checkRate(socket, 'msg', 20, 10_000)) return;

            const roomId = sanitizeRoomId(data?.roomId);
            const text = sanitizeStr(data?.message?.text, MESSAGE_MAX);
            if (!roomId || !text || socket.data.roomId !== roomId || !socket.data.username) return;

            const message = {
                sender: socket.data.username,
                text,
                date: new Date()
            };
            try {
                await Room.updateOne({ roomId }, { $push: { messages: message } });
            } catch (e) { console.error('Error saving msg', e); }
            io.to(roomId).emit('receive_message', message);
        });

        socket.on('get_messages', async (raw) => {
            const roomId = sanitizeRoomId(raw);
            if (!roomId || socket.data.roomId !== roomId) return;
            try {
                const room = await Room.findOne({ roomId }, { messages: 1 });
                if (room) socket.emit('message_history', room.messages);
            } catch (e) { console.error('Error fetching msgs', e); }
        });

        // ──────────────────────────────────────────────────────────────
        //  ATOMIC PLAYLIST OPERATIONS
        //  Each operation is server-authoritative. The full updated
        //  playlist is broadcast to all room members (including sender)
        //  so every client converges to the exact same state.
        // ──────────────────────────────────────────────────────────────

        socket.on('playlist_add', async (data) => {
            if (!checkRate(socket, 'pl_add', 30, 10_000)) return;

            const roomId = sanitizeRoomId(data?.roomId);
            if (!roomId || socket.data.roomId !== roomId || !socket.data.username) return;

            const safe = sanitizePlaylistItem(data?.item, socket.data.username);
            if (!safe) {
                return socket.emit('playlist_error', { message: 'Vidéo invalide.' });
            }

            try {
                const room = await Room.findOne({ roomId }, { playlist: 1 });
                if (!room) return socket.emit('playlist_error', { message: 'Salon introuvable.' });

                const current = room.playlist || [];
                if (current.length >= PLAYLIST_MAX) {
                    return socket.emit('playlist_error', { message: 'Playlist pleine.' });
                }
                if (current.some(p => p.id === safe.id)) {
                    // Idempotent: already added.
                    return socket.emit('playlist_updated', current);
                }

                const updated = [...current, safe];
                await Room.updateOne({ roomId }, { $set: { playlist: updated } });
                io.to(roomId).emit('playlist_updated', updated);
            } catch (e) {
                console.error('Error adding to playlist', e);
                socket.emit('playlist_error', { message: 'Erreur serveur.' });
            }
        });

        socket.on('playlist_remove', async (data) => {
            if (!checkRate(socket, 'pl_remove', 30, 10_000)) return;

            const roomId = sanitizeRoomId(data?.roomId);
            const itemId = sanitizeStr(data?.itemId, 64);
            if (!roomId || !itemId || socket.data.roomId !== roomId) return;

            if (!isAdmin(socket, roomId)) {
                return socket.emit('playlist_error', {
                    message: "Seul l'admin peut retirer une vidéo."
                });
            }

            try {
                const room = await Room.findOne({ roomId }, { playlist: 1 });
                if (!room) return socket.emit('playlist_error', { message: 'Salon introuvable.' });
                const updated = (room.playlist || []).filter(p => p.id !== itemId);
                await Room.updateOne({ roomId }, { $set: { playlist: updated } });
                io.to(roomId).emit('playlist_updated', updated);
            } catch (e) {
                console.error('Error removing from playlist', e);
                socket.emit('playlist_error', { message: 'Erreur serveur.' });
            }
        });

        socket.on('playlist_reorder', async (data) => {
            if (!checkRate(socket, 'pl_reorder', 30, 10_000)) return;

            const roomId = sanitizeRoomId(data?.roomId);
            const orderIds = Array.isArray(data?.orderIds)
                ? data.orderIds.filter(id => typeof id === 'string').slice(0, PLAYLIST_MAX)
                : null;
            if (!roomId || !orderIds || socket.data.roomId !== roomId) return;

            try {
                const room = await Room.findOne({ roomId }, { playlist: 1 });
                if (!room) return socket.emit('playlist_error', { message: 'Salon introuvable.' });

                const current = room.playlist || [];
                const byId = new Map(current.map(p => [p.id, p]));
                const reordered = [];
                const seen = new Set();
                for (const id of orderIds) {
                    if (seen.has(id)) continue;
                    const it = byId.get(id);
                    if (it) {
                        reordered.push(it);
                        seen.add(id);
                    }
                }
                // Append any items not in the new order (race safety).
                for (const it of current) {
                    if (!seen.has(it.id)) reordered.push(it);
                }

                await Room.updateOne({ roomId }, { $set: { playlist: reordered } });
                io.to(roomId).emit('playlist_updated', reordered);
            } catch (e) {
                console.error('Error reordering playlist', e);
                socket.emit('playlist_error', { message: 'Erreur serveur.' });
            }
        });

        socket.on('playlist_clear', async (data) => {
            if (!checkRate(socket, 'pl_clear', 5, 10_000)) return;

            const roomId = sanitizeRoomId(data?.roomId);
            if (!roomId || socket.data.roomId !== roomId) return;

            if (!isAdmin(socket, roomId)) {
                return socket.emit('playlist_error', {
                    message: "Seul l'admin peut vider la playlist."
                });
            }

            try {
                await Room.updateOne({ roomId }, { $set: { playlist: [] } });
                io.to(roomId).emit('playlist_updated', []);
            } catch (e) {
                console.error('Error clearing playlist', e);
                socket.emit('playlist_error', { message: 'Erreur serveur.' });
            }
        });

        // Atomically advance to the next playlist item. Idempotent:
        // if `fromVideoId` no longer matches the room's current video,
        // someone else already advanced — we skip.
        socket.on('playlist_advance', async (data) => {
            if (!checkRate(socket, 'pl_advance', 10, 10_000)) return;

            const roomId = sanitizeRoomId(data?.roomId);
            const fromVideoId = sanitizeStr(data?.fromVideoId, 32);
            if (!roomId || socket.data.roomId !== roomId) return;

            try {
                const room = await Room.findOne({ roomId }, { currentVideo: 1, playlist: 1 });
                if (!room) return;

                // Skip if a different client already advanced.
                if (fromVideoId && room.currentVideo?.videoId !== fromVideoId) return;

                if (!room.playlist || room.playlist.length === 0) return;

                const next = {
                    id: room.playlist[0].id,
                    videoId: room.playlist[0].videoId,
                    title: room.playlist[0].title || 'Sans titre',
                    thumbnail: room.playlist[0].thumbnail || ''
                };
                const newPlaylist = room.playlist.slice(1);
                const playback = {
                    isPlaying: true,
                    currentTime: 0,
                    updatedAt: Date.now()
                };
                roomPlayback[roomId] = playback;

                await Room.updateOne({ roomId }, {
                    $set: { currentVideo: next, playback, playlist: newPlaylist }
                });

                io.to(roomId).emit('playlist_updated', newPlaylist);
                io.to(roomId).emit('video_changed', {
                    video: next,
                    playback: { ...playback, serverTime: Date.now() }
                });
            } catch (e) {
                console.error('Error advancing playlist', e);
            }
        });

        // Anyone in the room can change the active video. Resets playback.
        socket.on('video_changed', async (data) => {
            if (!checkRate(socket, 'changeVid', 10, 10_000)) return;

            const roomId = sanitizeRoomId(data?.roomId);
            const video = data?.video;
            if (!roomId || socket.data.roomId !== roomId) return;

            const safeVideo = video && typeof video === 'object' ? {
                id: sanitizeStr(video.id, 64),
                videoId: sanitizeStr(video.videoId, 32) || sanitizeStr(video.id, 32),
                title: sanitizeStr(video.title, 200) || 'Sans titre',
                thumbnail: sanitizeStr(video.thumbnail, 500) || ''
            } : null;
            if (!safeVideo || !safeVideo.videoId) return;

            const playback = {
                isPlaying: true,
                currentTime: 0,
                updatedAt: Date.now()
            };
            roomPlayback[roomId] = playback;

            try {
                await Room.updateOne(
                    { roomId },
                    { $set: { currentVideo: safeVideo, playback } }
                );
            } catch (e) { console.error('Error saving current video', e); }

            io.to(roomId).emit('video_changed', {
                video: safeVideo,
                playback: { ...playback, serverTime: Date.now() }
            });
        });

        // Anyone in the room can pause / resume / seek. Server is authoritative.
        socket.on('video_state_change', async (data) => {
            if (!checkRate(socket, 'state', 60, 10_000)) return;
            const roomId = sanitizeRoomId(data?.roomId);
            if (!roomId || socket.data.roomId !== roomId) return;

            const state = data?.videoState;
            if (!state || typeof state !== 'object') return;

            const playback = {
                isPlaying: !!state.isPlaying,
                currentTime: Math.max(0, Number(state.currentTime) || 0),
                updatedAt: Date.now()
            };
            roomPlayback[roomId] = playback;

            try {
                await Room.updateOne({ roomId }, { $set: { playback } });
            } catch (e) { console.error('Error saving playback', e); }

            // Broadcast to everyone except the sender (sender already at this state).
            socket.to(roomId).emit('video_state_updated', {
                ...playback,
                serverTime: Date.now()
            });
        });

        socket.on('add_marker', async (data) => {
            if (!checkRate(socket, 'marker', 10, 10_000)) return;
            const roomId = sanitizeRoomId(data?.roomId);
            const marker = data?.marker;
            if (!roomId || socket.data.roomId !== roomId || !socket.data.username) return;

            const safe = {
                videoId: sanitizeStr(marker?.videoId, 32),
                time: Math.max(0, Number(marker?.time) || 0),
                text: sanitizeStr(marker?.text, MARKER_MAX),
                author: socket.data.username
            };
            if (!safe.videoId || !safe.text) return;
            try {
                await Room.updateOne({ roomId }, { $push: { markers: safe } });
            } catch (e) { console.error('Error saving marker', e); }
            io.to(roomId).emit('receive_marker', safe);
        });

        socket.on('kick_user', async (data) => {
            const roomId = sanitizeRoomId(data?.roomId);
            const targetSocketId = typeof data?.targetSocketId === 'string' ? data.targetSocketId : null;
            if (!roomId || !targetSocketId || socket.data.roomId !== roomId) return;
            if (!isAdmin(socket, roomId)) {
                return socket.emit('kick_error', { message: "Seul l'admin peut exclure un membre." });
            }
            if (targetSocketId === socket.id) return;

            const targetSocket = io.sockets.sockets.get(targetSocketId);
            if (targetSocket) {
                targetSocket.emit('kicked');
                targetSocket.leave(roomId);
            }
            if (roomMembers[roomId]) {
                roomMembers[roomId] = roomMembers[roomId].filter(m => m.socketId !== targetSocketId);
                io.to(roomId).emit('members_updated', {
                    members: roomMembers[roomId],
                    admin: roomAdmins[roomId]
                });
            }
        });

        socket.on('disconnect', () => {
            const roomId = socket.data.roomId;
            if (!roomId || !roomMembers[roomId]) return;
            roomMembers[roomId] = roomMembers[roomId].filter(m => m.socketId !== socket.id);
            io.to(roomId).emit('members_updated', {
                members: roomMembers[roomId],
                admin: roomAdmins[roomId]
            });
            if (roomMembers[roomId].length === 0) {
                delete roomMembers[roomId];
                delete roomAdmins[roomId];
                delete roomPlayback[roomId];
            }
        });
    });
}
