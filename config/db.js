const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('  MONGO_URI non défini dans .env');
      console.log(' Utilisation de MongoDB en mémoire (données temporaires)');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(' MongoDB connecté avec succès');
    console.log(` Base de données: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);

    // Événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error(' Erreur MongoDB:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(' MongoDB déconnecté');
    });

  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    console.log('Le serveur continue sans MongoDB (mode salon éphémère)');
  }
};

module.exports = connectDB;