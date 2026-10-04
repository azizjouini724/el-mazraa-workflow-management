const mongoose = require('mongoose');

const productArticleSchema = new mongoose.Schema({
  // ===== INFOS DE CRÉATION (Saisie par le demandeur) =====
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  societe: { 
    type: String, 
    enum: ['Mazraa', 'Dick', 'Essanaouber'], 
    required: true 
  },
  nature: { 
    type: String, 
    enum: ['GMS', 'Réseaux', 'UCPC', 'Croquette', 'Export'], 
    required: true 
  },
  description1: { 
    type: String, 
    required: true 
  },
  description2: { 
    type: String 
  },
  familleArticle: { 
    type: String, 
    required: true 
  },
  typeArticle: { 
    type: String, 
    enum: ['Frais', 'Congelé'], 
    required: true 
  },
  photo: { 
    type: String, 
    default: null 
  },

  // ===== DONNÉES TECHNIQUES (Remplies par les services durant le workflow) =====
  finalData: {
    // Marketing
    sousFamille: { type: String },
    gamme: { type: String },
    // Production
    uniteVente: { type: String },
    facteurConversion: { type: Number },
    tare: { type: Number },
    maxRemplissage: { type: Number },
    maxMatiere: { type: Number },
    chargeParKG: { type: Number },
    coutRevient: { type: Number },
    emballage: { type: String },
    // Qualité
    dlc: { type: Number },
    dlv: { type: Number },
    // Finance
    tauxTVA: { type: Number },
    compteVente: { type: String },
    // Commercial (GMS, Export, etc.)
    prixGrosHT: { type: Number },
    prixGrosTTC: { type: Number },
    prixDetailTTC: { type: Number },
    // Contrôle de Gestion
    commentaireControle: { type: String }
  },

  // ===== ÉTAT DU WORKFLOW =====

  status: { 
    type: String, 
    enum: ['en_validation', 'validé', 'rejete', 'créé_en_qad'],
    default: 'en_validation' 
  },
  
  // ✅ ÉTAPE ACTUELLE POUR LE SÉQUENÇAGE
  currentValidationStep: { 
    type: String,
    enum: ['marketing', 'production', 'qualite', 'finance', 'commercial', 'essanaouber', 'gms', 'export', 'controle', 'informatique', 'terminé', 'rejete'],
    default: 'marketing'  // ✅ Commence toujours par Marketing
  },
  
  // ✅ CODE QAD GÉNÉRÉ À LA FIN
  qadCode: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },

  qadCreatedAt: {
    type: Date,
    default: null
  },
  
  // ✅ LISTE DES VALIDATIONS
  validations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Validation' 
  }],

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// ✅ HOOK PRE-SAVE POUR METTRE À JOUR updatedAt
productArticleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ProductArticle', productArticleSchema);