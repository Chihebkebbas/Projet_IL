import mongoose from 'mongoose';
import dotenv from 'dotenv';


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On remonte de 'src/server' vers la racine du projet ('TogetherPlay')
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
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
