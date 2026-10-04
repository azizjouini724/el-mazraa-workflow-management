const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

connectDB();

// ✅ CORS corrigé — autorise tous les ports localhost en dev
app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile, curl) et tout localhost
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    // En prod, remplace par ton vrai domaine
    const allowedOrigins = (process.env.FRONTEND_URL || '').split(',');
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Non autorisé par CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Helmet sans bloquer les images du même serveur
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // permet les images depuis l'API
  contentSecurityPolicy: false // désactivé en dev pour éviter les blocages
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Trop de requêtes, réessayez dans 15 minutes.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Servir les photos de profil correctement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes        = require('./routes/auth');
const articleRoutes     = require('./routes/articles');
const validationRoutes  = require('./routes/validations');
const notificationRoutes= require('./routes/notifications');
const statsRoutes       = require('./routes/stats');
const historyRoutes     = require('./routes/history');
const commentRoutes     = require('./routes/comments');
const exportRoutes      = require('./routes/export');

app.use('/api/auth',          authRoutes);
app.use('/api/articles',      articleRoutes);
app.use('/api/validations',   validationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats',         statsRoutes);
app.use('/api/history',       historyRoutes);
app.use('/api/comments',      commentRoutes);
app.use('/api/export',        exportRoutes);

// Handler erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.message);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));

module.exports = app;