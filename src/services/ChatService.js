const Message = require("../models/message");

const messageStore = []; // stockage en mémoire (MVP)

class ChatService {
    ajouterMessage(userId, username, text, salonId) {
        if (!text || text.trim() === "" || text.length > 300) {
            return { success: false, error: "Message invalide." };
        }

        const newMsg = new Message(userId, username, text, salonId);
        messageStore.push(newMsg);

        return { success: true, message: newMsg.toJSON() };
    }

    supprimerMessage(messageId, userId, isAdmin) {
        const index = messageStore.findIndex(msg => msg.id === messageId);

        if (index === -1)
            return { success: false, error: "Message introuvable." };

        const message = messageStore[index];

        if (message.userId !== userId && !isAdmin)
            return { success: false, error: "Permission refusée." };

        messageStore.splice(index, 1);

        return { success: true, messageId };
    }

    getMessages(salonId) {
        return messageStore
            .filter(msg => msg.salonId === salonId)
            .map(msg => msg.toJSON());
    }
}

module.exports = new ChatService();
