import { createContext, useContext, useState } from "react";

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

    const addItem = (newItem) => {
        setItems(prev => [...prev, { id: crypto.randomUUID(), ...newItem }]);
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id, updatedFields) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    };

    const playVideo = (video) => {
        setCurrentVideo(video);
    };

    const clearPlaylist = () => {
        setItems([]);
    };

    const shufflePlaylist = () => {
        setItems(prev => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        });
    };

    return (
        <HomePlaylistContext.Provider value={{
            items, setItems, addItem, removeItem,
            currentVideo, playVideo,
            clearPlaylist, shufflePlaylist
        }}>
            {children}
        </HomePlaylistContext.Provider>
    )
}

export function usePlaylist() {
    const context = useContext(HomePlaylistContext);

    if (!context) {
        /* CORRECTION MESSAGE : Le bon nom du provider pour le débug */
        throw new Error("usePlaylist doit être utilisé à l'intérieur de HomePlaylistProvider");
    }

    return context;
}