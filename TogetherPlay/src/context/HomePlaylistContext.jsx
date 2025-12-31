import { createContext, useContext, useState } from "react";
import socket from "../services/socket.js";

import thum1 from "../assets/images/thumbnail-1.jpg"
import thum2 from "../assets/images/thumbnail-2.jpg"
import thum3 from "../assets/images/thumbnail-3.jpg"
import thum4 from "../assets/images/thumbnail-4.jpg"
//Modification 
const HomePlaylistContext = createContext(undefined);

// Données initiales
const initialPlaylist = [
    { id: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up (Official Music Video)", thumbnail: thum1 },
    { id: "jfKfPfyJRdk", title: "lofi hip hop radio - beats to relax/study to", thumbnail: thum2 },
    { id: "k3Vfj-e1Ma4", title: "React Router 6 - Full Course", thumbnail: thum3 },
    { id: "SqcY0GlETPk", title: "React Tutorial for Beginners", thumbnail: thum4 }
];

export function HomePlaylistProvider({ children }) {
    const [items, setItems] = useState(initialPlaylist);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [roomId, setRoomId] = useState(null);

    // Helper to emit update
    const emitUpdate = (newItems) => {
        if (roomId) {
            socket.emit("update_playlist", { roomId, playlist: newItems });
        }
    };

    const emitVideoChange = (video) => {
        if (roomId) {
            // We reuse the same event or a specific one
            // Current implementation of server listens to 'video_state_change' but that's for play/pause/seek
            // We might want to persist current video in room data?
            // Optional: The server stores "currentVideo". We can emit an update for that.
            // For now let's just use a custom event or reuse 'room_data' if backend supports it?
            // Backend has NO specific event to update ONLY the current video reference in DB (except via video_state_change maybe?)
            // Let's assume we just play it locally, and maybe later sync it.
            // Implementing basic sync:
            // socket.emit("video_changed", { roomId, video }); -> We need to handle this on server if we want persistence
        }
    };

    const addItem = (newItem) => {
        setItems(prev => {
            const next = [...prev, { id: crypto.randomUUID(), ...newItem }];
            emitUpdate(next);
            return next;
        });
    };

    const removeItem = (id) => {
        setItems(prev => {
            const next = prev.filter(item => item.id !== id);
            emitUpdate(next);
            return next;
        });
    };

    const updateItem = (id, updatedFields) => {
        setItems(prev => {
            const next = prev.map(item => item.id === id ? { ...item, ...updatedFields } : item);
            emitUpdate(next);
            return next;
        });
    };

    const playVideo = (video) => {
        setCurrentVideo(video);
        emitVideoChange(video);
    };

    const clearPlaylist = () => {
        setItems([]);
        emitUpdate([]);
    };

    const shufflePlaylist = () => {
        setItems(prev => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            emitUpdate(shuffled);
            return shuffled;
        });
    };

    // Function to update from socket (captured from server) without emitting
    const updatePlaylistFromSocket = (newItems) => {
        setItems(newItems);
    };

    // Special setter for DND which replaces the whole list
    const setItemsAndSync = (newItemsOrFn) => {
        // This one is tricky because setItems accepts a function or value.
        // Playlist.jsx passes a function.
        setItems(prev => {
            const result = typeof newItemsOrFn === 'function' ? newItemsOrFn(prev) : newItemsOrFn;
            emitUpdate(result);
            return result;
        });
    };

    return (
        <HomePlaylistContext.Provider value={{
            items, setItems: setItemsAndSync, // Expose strict sync version
            addItem, removeItem,
            currentVideo, playVideo,
            clearPlaylist, shufflePlaylist,
            roomId, setRoomId,
            updatePlaylistFromSocket
        }}>
            {children}
        </HomePlaylistContext.Provider>
    )
}

export function usePlaylist() {
    const context = useContext(HomePlaylistContext);

    if (!context) {
        throw new Error("usePlaylist doit être utilisé à l'intérieur de HomePlaylistProvider");
    }

    return context;
}