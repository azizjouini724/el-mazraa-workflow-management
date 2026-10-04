const mongoose = require('mongoose');

// Schéma (structure) d'un commentaire
const commentSchema = new mongoose.Schema({
  // Article commenté
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },

  // Auteur du commentaire
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Contenu du commentaire
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  },

  // Type de commentaire (question, suggestion, remarque, etc.)
  type: {
    type: String,
    enum: ['question', 'suggestion', 'remarque', 'feedback'],
    default: 'remarque'
  },

  // Date de création
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Date de dernière modification
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Créer le modèle Comment
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;