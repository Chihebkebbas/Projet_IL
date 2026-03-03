import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    playlist: [
        {
            id: String,
            videoId: String,
            title: String,
            thumbnail: String,
            duration: String,
            addedBy: String
        }
    ],
    currentVideo: {
        id: String,
        videoId: String,
        title: String,
        thumbnail: String,
        isPlaying: { type: Boolean, default: false },
        startedAt: Number // Timestamp to sync position
    },
    messages: [
        {
            sender: String, // "me" or Username
            text: String,
            date: { type: Date, default: Date.now }
        }
    ],
    markers: [
        {
            time: Number,
            text: String,
            author: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Optional: Rooms expire after 24 hours (TTL)
    }
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
