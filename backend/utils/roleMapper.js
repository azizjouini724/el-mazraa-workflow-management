const User = require('../models/user');

const ROLE_MAPPINGS = {
  'marketing': 'validateur_marketing',
  'production': 'validateur_production', 
  'qualite': 'validateur_qualite',
  'finance': 'validateur_finance',
  'commercial': 'validateur_commercial',
  'controle': 'validateur_controle',
  'informatique': 'validateur_informatique',
  'essanaouber': 'validateur_essanaouber',
  'gms': 'validateur_gms',
  'export': 'validateur_export',
  'ucpc': 'validateur_ucpc'
};

// ✅ ANCIEN: Retourne UN SEUL validateur (le premier)
const getValidatorForType = async (validationType) => {
  try {
    const role = ROLE_MAPPINGS[validationType];
    
    if (!role) {
      console.warn(`⚠️ Aucun rôle trouvé pour: ${validationType}`);
      return null;
    }

    const user = await User.findOne({ role }).select('_id name email role');
    
    if (!user) {
      console.warn(`⚠️ Aucun utilisateur trouvé avec le rôle: ${role}`);
      return null;
    }

    console.log(`✅ Validateur trouvé pour ${validationType}: ${user.name} (${user.role})`);
    return user._id;
  } catch (error) {
    console.error(`❌ Erreur getValidatorForType:`, error);
    return null;
  }
};

// ✅ NOUVEAU: Retourne TOUS les validateurs d'un type
const getAllValidatorsForType = async (validationType) => {
  try {
    const role = ROLE_MAPPINGS[validationType];
    
    if (!role) {
      console.warn(`⚠️ Aucun rôle trouvé pour: ${validationType}`);
      return [];
    }

    const users = await User.find({ role }).select('_id name email role');
    
    if (!users || users.length === 0) {
      console.warn(`⚠️ Aucun utilisateur trouvé avec le rôle: ${role}`);
      return [];
    }

    console.log(`✅ ${users.length} validateur(s) trouvé(s) pour ${validationType}`);
    return users;
  } catch (error) {
    console.error(`❌ Erreur getAllValidatorsForType:`, error);
    return [];
  }
};

module.exports = { 
  getValidatorForType,
  getAllValidatorsForType
};