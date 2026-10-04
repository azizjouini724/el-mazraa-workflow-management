const mongoose = require('mongoose');

// Fonction pour se connecter à MongoDB
const connectDB = async () => {
  try {
    // Se connecter à MongoDB avec l'URL dans .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connecté avec succès!');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    // Arrêter le serveur si MongoDB ne marche pas
    process.exit(1);
  }
};

module.exports = connectDB;