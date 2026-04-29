import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    admin: { type: String, required: true },
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
        thumbnail: String
    },
    playback: {
        isPlaying: { type: Boolean, default: false },
        currentTime: { type: Number, default: 0 },
        updatedAt: { type: Number, default: 0 }
    },
    messages: [
        {
            sender: { type: String, required: true },
            text: { type: String, required: true, maxlength: 300 },
            date: { type: Date, default: Date.now }
        }
    ],
    markers: [
        {
            videoId: { type: String, required: true, index: true },
            time: { type: Number, required: true, min: 0 },
            text: { type: String, required: true, maxlength: 200 },
            author: { type: String, required: true }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
