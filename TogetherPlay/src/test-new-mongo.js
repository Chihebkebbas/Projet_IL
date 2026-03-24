import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testConnection() {
    console.log("Testing connection with string from .env.local:");
    console.log(process.env.MONGODB_URI.substring(0, 30) + '...');
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ SUCCÈS ! La connexion a réussi avec le nouveau format long.");
        process.exit(0);
    } catch (e) {
        console.error("❌ ECHEC :", e.message);
        process.exit(1);
    }
}
testConnection();
