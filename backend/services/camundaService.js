const Validation = require('../models/validation');
const Article = require('../models/article');

// Types de validations requises pour un article
const REQUIRED_VALIDATIONS = [
  'commercial',
  'finance',
  'production',
  'qualite',
  'controle',
  'informatique',
  'marketing'
];

/**
 * Fonction pour démarrer un workflow Camunda quand on crée un article
 * Elle crée automatiquement les validations requises
 */
const startWorkflow = async (articleId, authorId) => {
  try {
    console.log(`🔄 Démarrage du workflow pour l'article ${articleId}`);

    // Créer les validations automatiquement pour chaque type requis
    for (const validationType of REQUIRED_VALIDATIONS) {
      const newValidation = new Validation({
        article: articleId,
        type: validationType,
        status: 'pending',
        // Pour la simulation, on utilise l'auteur comme validateur
        // En réalité, on assignerait à des validateurs spécifiques
        validator: authorId
      });

      await newValidation.save();
      console.log(`✅ Validation créée pour type: ${validationType}`);
    }

    // Mettre à jour le statut de l'article à "pending"
    await Article.findByIdAndUpdate(articleId, { status: 'pending' });
    console.log(`✅ Article ${articleId} en attente de validation`);

    return {
      success: true,
      message: 'Workflow démarré avec succès',
      validationsCreated: REQUIRED_VALIDATIONS.length
    };
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du workflow:', error);
    throw error;
  }
};

/**
 * Fonction pour vérifier si toutes les validations sont complètes
 * Si OUI → publie l'article
 * Si UN rejet → rejette l'article
 */
const checkWorkflowStatus = async (articleId) => {
  try {
    // Récupérer toutes les validations de cet article
    const validations = await Validation.find({ article: articleId });

    // Vérifier s'il y a au moins une validation rejetée
    const rejectedValidation = validations.find(v => v.status === 'rejected');
    if (rejectedValidation) {
      // L'article est rejeté
      await Article.findByIdAndUpdate(articleId, { status: 'rejected' });
      console.log(`❌ Article ${articleId} REJETÉ`);
      return {
        status: 'rejected',
        message: 'Article rejeté par une validation',
        rejectedBy: rejectedValidation.type
      };
    }

    // Vérifier si TOUTES les validations sont approuvées
    const allApproved = validations.every(v => v.status === 'approved');
    if (allApproved) {
      // L'article est publié
      await Article.findByIdAndUpdate(articleId, { status: 'published' });
      console.log(`✅ Article ${articleId} PUBLIÉ`);
      return {
        status: 'published',
        message: 'Article publié avec succès'
      };
    }

    // En attente de validations
    return {
      status: 'pending',
      message: 'En attente de validations',
      totalValidations: validations.length,
      approvedCount: validations.filter(v => v.status === 'approved').length
    };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du workflow:', error);
    throw error;
  }
};

/**
 * Fonction pour obtenir le résumé du workflow d'un article
 */
const getWorkflowStatus = async (articleId) => {
  try {
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error('Article non trouvé');
    }

    const validations = await Validation.find({ article: articleId })
      .populate('validator', 'name email role');

    return {
      article: {
        id: article._id,
        title: article.title,
        status: article.status
      },
      validations: validations,
      summary: {
        total: validations.length,
        approved: validations.filter(v => v.status === 'approved').length,
        rejected: validations.filter(v => v.status === 'rejected').length,
        pending: validations.filter(v => v.status === 'pending').length
      }
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du workflow:', error);
    throw error;
  }
};

module.exports = {
  startWorkflow,
  checkWorkflowStatus,
  getWorkflowStatus
};