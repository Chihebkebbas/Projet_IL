import mongoose from 'mongoose';

const uri = "mongodb+srv://Chiheb:chihebProjetIL@clusterprojetil.js8gu6d.mongodb.net/?appName=ClusterProjetIL";

async function testConnection() {
    console.log("Tentative de connexion à MongoDB (Timeout 5s)...");
    
    try {
        console.log("\n1️⃣ Test avec format SRV standard...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Connexion réussie ! (Standard)");
        process.exit(0);
    } catch (err) {
        console.error("❌ Échec (Standard) :", err.message);
    }

    try {
        console.log("\n2️⃣ Test avec format IPv4 forcé (family: 4)...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
        console.log("✅ Connexion réussie ! (IPv4 forcé)");
        process.exit(0);
    } catch (err) {
        console.error("❌ Échec (IPv4 forcé) :", err.message);
    }

    console.log("\n3️⃣ Test de la résolution DNS (Problème de réseau typique Universités/Mac)...");
    import('dns').then(dns => {
        dns.resolveSrv('_mongodb._tcp.clusterprojetil.js8gu6d.mongodb.net', (err, addresses) => {
            if (err) {
                console.error("❌ Erreur DNS SRV :", err.message);
                console.error("\n👉 CONCLUSION : Votre réseau actuel (ou fournisseur de DNS) bloque les requêtes MongoDB SRV. Vous pouvez le résoudre en changeant vos serveurs DNS pour 8.8.8.8 (Google) ou 1.1.1.1 (Cloudflare) dans les réglages réseau de votre Mac, ou en vous connectant à un autre réseau (ex: partage de co 4G).");
            } else {
                console.log("✅ Succès DNS SRV :", addresses);
                console.log("\n👉 CONCLUSION : Le DNS fonctionne, l'adresse IP de ce Mac n'est VRAIMENT pas autorisée sur la Whitelist de MongoDB Atlas.");
            }
            process.exit(1);
        });
    });
}

testConnection();
