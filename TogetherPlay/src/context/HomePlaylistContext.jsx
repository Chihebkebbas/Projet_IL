import { createContext, useContext, useState, useCallback, useMemo, useRef } from "react";
import socket from "../services/socket.js";

const HomePlaylistContext = createContext(undefined);

export function HomePlaylistProvider({ children }) {
    const [items, setItemsState] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [admin, setAdmin] = useState(null);

    // Mirrors `items` so callbacks can read the latest list without
    // becoming dependent on it (which would invalidate every consumer).
    const itemsRef = useRef([]);
    const setItems = useCallback((next) => {
        itemsRef.current = typeof next === 'function' ? next(itemsRef.current) : next;
        setItemsState(itemsRef.current);
    }, []);

    // ──────────────────────────────────────────────────────────────
    //  Playlist mutations: optimistic locally for instant feedback.
    //  The server's `playlist_updated` broadcast is the single source
    //  of truth and reconciles divergent clients (e.g. concurrent
    //  edits) once it arrives.
    // ──────────────────────────────────────────────────────────────

    const addItem = useCallback((newItem) => {
        const item = {
            id: newItem?.id || crypto.randomUUID(),
            ...newItem,
            addedBy: localStorage.getItem("username") || ''
        };
        // Optimistic: append locally so the user sees it instantly.
        setItems(prev => prev.some(p => p.id === item.id) ? prev : [...prev, item]);
        if (!roomId) return;
        socket.emit("playlist_add", { roomId, item });
    }, [roomId, setItems]);

    const removeItem = useCallback((id) => {
        // Optimistic: remove locally.
        setItems(prev => prev.filter(i => i.id !== id));
        if (!roomId) return;
        socket.emit("playlist_remove", { roomId, itemId: id });
    }, [roomId, setItems]);

    // Drag-and-drop reorder: optimistic locally for snappy UX,
    // then reconciled by the server's broadcast. Accepts a fn or array
    // to match dnd-kit's `arrayMove` flow.
    const reorderItems = useCallback((newItemsOrFn) => {
        const next = typeof newItemsOrFn === 'function'
            ? newItemsOrFn(itemsRef.current)
            : newItemsOrFn;
        setItems(next);
        if (!roomId) return;
        socket.emit("playlist_reorder", { roomId, orderIds: next.map(i => i.id) });
    }, [roomId, setItems]);

    const clearPlaylist = useCallback(() => {
        setItems([]);
        if (!roomId) return;
        socket.emit("playlist_clear", { roomId });
    }, [roomId, setItems]);

    const shufflePlaylist = useCallback(() => {
        const current = itemsRef.current;
        if (current.length <= 1 || !roomId) return;
        const shuffled = [...current];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setItems(shuffled);
        socket.emit("playlist_reorder", { roomId, orderIds: shuffled.map(i => i.id) });
    }, [roomId, setItems]);

    // ──────────────────────────────────────────────────────────────
    //  Current video — server-authoritative as well.
    //  Local state is updated only when the server confirms via
    //  `video_changed` (handled in HomePage).
    // ──────────────────────────────────────────────────────────────

    const playVideo = useCallback((video) => {
        // Optimistic local switch for instant feedback. The server's
        // `video_changed` broadcast will reconcile if a concurrent
        // switch happened on another client.
        setCurrentVideo(video);
        if (!roomId) return;
        socket.emit("video_changed", { roomId, video });
    }, [roomId]);

    // Triggered on YouTube `onEnd`. Tells the server to atomically
    // pop the front of the playlist and switch to it.
    const playNext = useCallback(() => {
        if (!roomId) return;
        const fromVideoId = currentVideo?.videoId || currentVideo?.id || null;
        socket.emit("playlist_advance", { roomId, fromVideoId });
    }, [roomId, currentVideo]);

    // ──────────────────────────────────────────────────────────────
    //  Server → client handlers (called from HomePage).
    // ──────────────────────────────────────────────────────────────

    const updatePlaylistFromSocket = useCallback((newItems) => {
        const safe = Array.isArray(newItems) ? newItems : [];
        itemsRef.current = safe;
        setItemsState(safe);
    }, []);

    const playVideoFromSocket = useCallback((video) => {
        setCurrentVideo(video || null);
    }, []);

    const updateMarkersFromSocket = useCallback((initialMarkers) => {
        setMarkers(initialMarkers || []);
    }, []);

    const addMarkerFromSocket = useCallback((newMarker) => {
        setMarkers(prev => [...prev, newMarker]);
    }, []);

    const me = (typeof window !== 'undefined' && localStorage.getItem("username")) || null;
    const isAdmin = !!admin && admin === me;

    const value = useMemo(() => ({
        items, setItems: reorderItems,
        addItem, removeItem,
        currentVideo, playVideo,
        clearPlaylist, shufflePlaylist,
        roomId, setRoomId,
        admin, setAdmin, isAdmin,
        updatePlaylistFromSocket,
        playVideoFromSocket,
        playNext,
        markers, updateMarkersFromSocket, addMarkerFromSocket
    }), [
        items, reorderItems, addItem, removeItem,
        currentVideo, playVideo, clearPlaylist, shufflePlaylist,
        roomId, admin, isAdmin, updatePlaylistFromSocket, playVideoFromSocket, playNext,
        markers, updateMarkersFromSocket, addMarkerFromSocket
    ]);

    return (
        <HomePlaylistContext.Provider value={value}>
            {children}
        </HomePlaylistContext.Provider>
    );
}

export function usePlaylist() {
    const context = useContext(HomePlaylistContext);
    if (!context) throw new Error("usePlaylist doit être utilisé à l'intérieur de HomePlaylistProvider");
    return context;
}
