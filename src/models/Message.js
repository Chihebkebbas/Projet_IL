const { v4: uuidv4 } = require("uuid");

class Message {
    constructor(userId, username, text, salonId) {
        this.id = uuidv4();
        this.userId = userId;
        this.username = username;
        this.text = text;
        this.salonId = salonId;
        this.timestamp = Date.now();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            username: this.username,
            text: this.text,
            salonId: this.salonId,
            timestamp: this.timestamp
        };
    }
}

module.exports = Message;
