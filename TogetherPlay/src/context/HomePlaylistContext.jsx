import {createContext, useContext, useState} from "react";

import thum1 from "../assets/images/thumbnail-1.jpg"
import thum2 from "../assets/images/thumbnail-2.jpg"
import thum3 from "../assets/images/thumbnail-3.jpg"
import thum4 from "../assets/images/thumbnail-4.jpg"

const HomePlaylistContext = createContext(undefined);

// Données initiales
const initialPlaylist = [
    { id: "1", title: "Résumé : Le BARÇA fête son retour au CAMP NOU contre BILBAO et met la pression sur le REAL !", thumbnail: thum1 },
    { id: "2", title: "QUI EST L'IMPOSTEUR ? (ft Aya Nakamura & Géraldine Nakache)", thumbnail: thum2 },
    { id: "3", title: "J'ai codé un algorithme qui reconnaît les gens dans le métro", thumbnail: thum3 },
    { id: "4", title: "\"Your Dream Body Won't Make You Happy.\" | David Laid on Fitness, Perfection & Obsession", thumbnail: thum4 }
];

// Fonctions d’action pour gérer la playlist
const addItem = (newItem) => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), ...newItem }]);
};

const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
};

const updateItem = (id, updatedFields) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
};

export function HomePlaylistProvider({children}) {
    const [items, setItems] = useState(initialPlaylist);

    const addItem = (newItem) => {
        setItems(prev => [...prev, { id: crypto.randomUUID(), ...newItem }]);
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id, updatedFields) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    };


    return (
        <HomePlaylistContext.Provider value={{items, setItems, addItem, removeItem}}>
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