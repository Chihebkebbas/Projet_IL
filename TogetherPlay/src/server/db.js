import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env vars
// Try loading .env.local first (common in Vite projects), then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("❌ MONGODB_URI is missing in .env or .env.local");
            // We don't exit process here to let the server run without DB if needed (but API will fail)
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
