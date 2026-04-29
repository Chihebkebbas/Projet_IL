// services/messagesStorage.js

const STORAGE_KEY = "messages";

// Lire l'historique local du chat. Si rien n'existe encore, on renvoie une liste vide.
export function getMessages() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

// Enregistrer tout l'historique du chat sous une seule clé locale.
export function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// Utilitaire pratique pour étendre l'historique sans réécrire la logique dans plusieurs composants.
export function addMessage(message) {
    const current = getMessages();
    const updated = [...current, message];
    saveMessages(updated);
    return updated;
}

// Supprimer l'historique local du chat, par exemple pour repartir d'un état propre.
export function clearMessages() {
    localStorage.removeItem(STORAGE_KEY);
}
