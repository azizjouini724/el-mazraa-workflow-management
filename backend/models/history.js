const mongoose = require('mongoose');

// Schéma (structure) d'un historique
const historySchema = new mongoose.Schema({
  // Article concerné
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },

  // Utilisateur qui a fait l'action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type d'action (created, updated, status_changed, etc.)
  action: {
    type: String,
    enum: ['created', 'updated', 'status_changed', 'deleted', 'commented'],
    required: true
  },

  // Description de ce qui a changé
  description: {
    type: String,
    required: true
  },

  // Ancienne valeur (optionnel)
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },

  // Nouvelle valeur (optionnel)
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },

  // Détails supplémentaires
  details: {
    type: mongoose.Schema.Types.Mixed
  },

  // Date de l'action
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Créer le modèle History
const History = mongoose.model('History', historySchema);

module.exports = History;