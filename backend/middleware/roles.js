// Middleware pour vérifier les rôles et permissions

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 * Exemple: checkRole(['admin', 'validateur_commercial'])
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Vérifier que l'utilisateur a un des rôles autorisés
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôles requis: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};

/**
 * Vérifier si l'utilisateur est admin
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Accès refusé: Admin requis'
    });
  }
  next();
};

/**
 * Vérifier si l'utilisateur est un validateur
 */
const isValidator = (req, res, next) => {
  const validatorRoles = [
    'validateur_commercial',
    'validateur_finance',
    'validateur_production',
    'validateur_marketing',
    'validateur_qualite',
    'validateur_controle',
    'validateur_informatique'
  ];

  if (!validatorRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: 'Accès refusé: Validateur requis'
    });
  }
  next();
};

/**
 * Vérifier si l'utilisateur est un utilisateur normal
 */
const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({
      message: 'Accès refusé: Utilisateur normal requis'
    });
  }
  next();
};

/**
 * Vérifier si l'utilisateur peut valider un type spécifique
 */
const canValidateType = (validationType) => {
  return (req, res, next) => {
    // Mapper les rôles aux types de validation
    const roleToType = {
      'validateur_commercial': 'commercial',
      'validateur_finance': 'finance',
      'validateur_production': 'production',
      'validateur_marketing': 'marketing',
      'validateur_qualite': 'qualite',
      'validateur_controle': 'controle',
      'validateur_gms': 'gms',
      'validateur_informatique': 'informatique'
    };

    const userValidationType = roleToType[req.user.role];

    // Admin peut valider n'importe quel type
    if (req.user.role === 'admin') {
      return next();
    }

    // Vérifier que le type de validation correspond au rôle
    if (userValidationType !== validationType) {
      return res.status(403).json({
        message: `Vous ne pouvez valider que les articles de type: ${userValidationType}`
      });
    }

    next();
  };
};

module.exports = {
  checkRole,
  isAdmin,
  isValidator,
  isUser,
  canValidateType
};