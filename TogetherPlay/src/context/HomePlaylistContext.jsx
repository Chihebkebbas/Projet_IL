import { createContext, useContext, useState, useCallback, useMemo } from "react";
import socket from "../services/socket.js";

import thum1 from "../assets/images/thumbnail-1.jpg"
import thum2 from "../assets/images/thumbnail-2.jpg"
import thum3 from "../assets/images/thumbnail-3.jpg"
import thum4 from "../assets/images/thumbnail-4.jpg"
//Modification 
const HomePlaylistContext = createContext(undefined);

// Données initiales
const initialPlaylist = [
    { id: "dQw4w9WgXcQ", videoId: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up (Official Music Video)", thumbnail: thum1 },
    { id: "jfKfPfyJRdk", videoId: "jfKfPfyJRdk", title: "lofi hip hop radio - beats to relax/study to", thumbnail: thum2 },
    { id: "k3Vfj-e1Ma4", videoId: "k3Vfj-e1Ma4", title: "React Router 6 - Full Course", thumbnail: thum3 },
    { id: "SqcY0GlETPk", videoId: "SqcY0GlETPk", title: "React Tutorial for Beginners", thumbnail: thum4 }
];

export function HomePlaylistProvider({ children }) {
    const [items, setItems] = useState(initialPlaylist);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [roomId, setRoomId] = useState(null);

    // Helper to emit update
    const emitUpdate = useCallback((newItems) => {
        if (roomId) {
            socket.emit("update_playlist", { roomId, playlist: newItems });
        }
    }, [roomId]);

    const emitVideoChange = useCallback((video) => {
        if (roomId) {
            socket.emit("video_changed", { roomId, video });
        }
    }, [roomId]);

    const addItem = useCallback((newItem) => {
        setItems(prev => {
            const next = [...prev, { id: crypto.randomUUID(), ...newItem }];
            emitUpdate(next);
            return next;
        });
    }, [emitUpdate]);

    const removeItem = useCallback((id) => {
        setItems(prev => {
            const next = prev.filter(item => item.id !== id);
            emitUpdate(next);
            return next;
        });
    }, [emitUpdate]);

    const updateItem = useCallback((id, updatedFields) => {
        setItems(prev => {
            const next = prev.map(item => item.id === id ? { ...item, ...updatedFields } : item);
            emitUpdate(next);
            return next;
        });
    }, [emitUpdate]);

    const playVideo = useCallback((video) => {
        setCurrentVideo(video);
        emitVideoChange(video);
    }, [emitVideoChange]);

    const playNext = useCallback(() => {
        if (items.length > 0) {
            const nextVideo = items[0];
            playVideo(nextVideo);
            removeItem(nextVideo.id);
        }
    }, [items, playVideo, removeItem]);

    const clearPlaylist = useCallback(() => {
        setItems([]);
        emitUpdate([]);
    }, [emitUpdate]);

    const shufflePlaylist = useCallback(() => {
        setItems(prev => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            emitUpdate(shuffled);
            return shuffled;
        });
    }, [emitUpdate]);

    // Function to update from socket (captured from server) without emitting
    const updatePlaylistFromSocket = useCallback((newItems) => {
        setItems(newItems);
    }, []);

    const playVideoFromSocket = useCallback((video) => {
        setCurrentVideo(video);
    }, []);

    // Special setter for DND which replaces the whole list
    const setItemsAndSync = useCallback((newItemsOrFn) => {
        // This one is tricky because setItems accepts a function or value.
        // Playlist.jsx passes a function.
        setItems(prev => {
            const result = typeof newItemsOrFn === 'function' ? newItemsOrFn(prev) : newItemsOrFn;
            emitUpdate(result);
            return result;
        });
    }, [emitUpdate]);

    const value = useMemo(() => ({
        items, setItems: setItemsAndSync, // Expose strict sync version
        addItem, removeItem,
        currentVideo, playVideo,
        clearPlaylist, shufflePlaylist,
        roomId, setRoomId,
        updatePlaylistFromSocket,
        playVideoFromSocket,
        playNext
    }), [
        items, setItemsAndSync, addItem, removeItem, currentVideo, playVideo,
        clearPlaylist, shufflePlaylist, roomId, updatePlaylistFromSocket,
        playVideoFromSocket, playNext
    ]);

    return (
        <HomePlaylistContext.Provider value={value}>
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