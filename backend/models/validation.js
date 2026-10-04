const mongoose = require('mongoose');

const validationSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductArticle',
    required: true
  },

  validator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  type: {
    type: String,
    enum: [
      'marketing', 'production', 'qualite', 'finance', 'commercial',
      'essanaouber', 'gms', 'export', 'ucpc', 'controle', 'informatique'
    ],
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'waiting'],  // ✅ AJOUTÉ 'waiting'
    default: 'waiting'
  },

  // ✅ CORRECTION: avis peut être null au départ
  avis: {
    type: String,
    enum: [null, 'Favorable', 'Défavorable', 'Annulée'],
    default: null
  },

  // ===== CHAMPS SPÉCIFIQUES PAR SERVICE =====
  // Marketing
  sousFamille: String,
  gamme: String,

  // Production
  uniteVente: {
    type: String,
    enum: ['KG', 'PC', 'CT', 'SC']
  },
  facteurConversion: Number,
  tare: Number,
  maxRemplissage: Number,
  maxMatiere: Number,
  chargeParKG: Number,
  coutRevient: Number,
  emballage: String,

  // Qualité
  nombreJoursDLC: Number,
  nombreJoursDLV: Number,
  dlc: Number,
  dlv: Number,

  // Finance & Comptabilité
  tauxTVA: {
    type: Number,
    enum: [0, 7, 19]
  },
  compteVente: String,

  // Commercial / GMS / Export / UCPC
  prixGrosHT: Number,
  prixGrosTTC: Number,
  prixDetailTTC: Number,

  // Contrôle de Gestion
  commentaire: String,
  commentaireControle: String,
  chargeParKGControle: Number,

  // Si rejeté
  rejectionComment: String,
  rejectedToStep: {
    type: Number,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  validatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Validation = mongoose.model('Validation', validationSchema);
module.exports = Validation;