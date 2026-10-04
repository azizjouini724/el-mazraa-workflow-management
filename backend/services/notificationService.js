const Notification = require('../models/notification');
const User = require('../models/user');

/**
 * ✅ Créer une notification pour un article créé
 * IMPORTANT: Envoyer à TOUS les validateurs en même temps
 */
const notifyArticleCreated = async (userId, articleId, articleTitle) => {
  try {
    // ✅ Récupérer TOUS les validateurs
    const validators = await User.find({ role: { $regex: '^validateur_' } });
    
    console.log(`📢 Envoi notification création article à ${validators.length} validateurs`);

    // ✅ Créer une notification pour CHAQUE validateur
    for (const validator of validators) {
      const notification = new Notification({
        user: validator._id,
        title: 'Nouvel article à valider',
        message: `Un nouvel article "${articleTitle}" doit être validé. Commencez par la validation Marketing.`,
        type: 'article_created',
        article: articleId,
        isRead: false,
        createdAt: new Date()
      });

      await notification.save();
      console.log(`✅ Notification envoyée à validateur: ${validator.name}`);
    }

    // ✅ Notifier aussi le créateur
    const creatorNotification = new Notification({
      user: userId,
      title: 'Nouvel article créé',
      message: `Votre article "${articleTitle}" a été créé avec succès. En attente de validations.`,
      type: 'article_created',
      article: articleId,
      isRead: false,
      createdAt: new Date()
    });

    await creatorNotification.save();
    console.log(`✅ Notification créée pour créateur: ${articleId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur notification article créé:', error);
    return false;
  }
};

/**
 * ✅ Créer une notification pour la prochaine validation
 * Envoyer à TOUS les validateurs que c'est maintenant au tour de X
 */
const notifyNextValidation = async (validatorId, validationType, articleTitle, articleId) => {
  try {
    const typeLabels = {
      'marketing': 'Marketing',
      'production': 'Production',
      'qualite': 'Qualité',
      'finance': 'Finance',
      'commercial': 'Commercial',
      'gms': 'GMS',
      'export': 'Export',
      'essanaouber': 'Essanaouber',
      'controle': 'Contrôle de Gestion',
      'informatique': 'Informatique'
    };

    // ✅ Récupérer TOUS les validateurs
    const validators = await User.find({ role: { $regex: '^validateur_' } });
    
    console.log(`📢 Notifying all validators that ${validationType} is now active`);

    // ✅ Notifier TOUS les validateurs
    for (const validator of validators) {
      const notification = new Notification({
        user: validator._id,
        title: `Validation ${typeLabels[validationType]} en cours`,
        message: `L'article "${articleTitle}" est maintenant en attente de validation par ${typeLabels[validationType]}.`,
        type: 'validation_required',
        article: articleId,
        isRead: false,
        createdAt: new Date()
      });

      await notification.save();
      console.log(`✅ Notification envoyée à: ${validator.name}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur notification validation requise:', error);
    return false;
  }
};

/**
 * ✅ Créer une notification pour une validation approuvée
 * Envoyer à TOUS les validateurs que quelqu'un a approuvé
 */
const notifyValidationApproved = async (userId, validationType, articleTitle, articleId) => {
  try {
    const typeLabels = {
      'marketing': 'Marketing',
      'production': 'Production',
      'qualite': 'Qualité',
      'finance': 'Finance',
      'commercial': 'Commercial',
      'gms': 'GMS',
      'export': 'Export',
      'essanaouber': 'Essanaouber',
      'controle': 'Contrôle de Gestion',
      'informatique': 'Informatique'
    };

    // ✅ Récupérer TOUS les validateurs
    const validators = await User.find({ role: { $regex: '^validateur_' } });
    
    console.log(`📢 Notifying all validators that ${validationType} approved the article`);

    // ✅ Notifier TOUS les validateurs
    for (const validator of validators) {
      const notification = new Notification({
        user: validator._id,
        title: 'Validation approuvée',
        message: `L'article "${articleTitle}" a été approuvé par ${typeLabels[validationType]}.`,
        type: 'validation_approved',
        article: articleId,
        isRead: false,
        createdAt: new Date()
      });

      await notification.save();
      console.log(`✅ Notification envoyée à: ${validator.name}`);
    }

    // ✅ Notifier aussi le créateur
    const creatorNotification = new Notification({
      user: userId,
      title: 'Validation approuvée',
      message: `L'article "${articleTitle}" a été approuvé par le département ${typeLabels[validationType]}.`,
      type: 'validation_approved',
      article: articleId,
      isRead: false,
      createdAt: new Date()
    });

    await creatorNotification.save();
    console.log(`✅ Notification validation approuvée envoyée au créateur`);
    return true;
  } catch (error) {
    console.error('❌ Erreur notification validation approuvée:', error);
    return false;
  }
};

/**
 * ✅ Créer une notification pour une validation rejetée
 * Envoyer à TOUS les validateurs que l'article a été rejeté
 */
const notifyValidationRejected = async (userId, validationType, articleTitle, articleId, comment) => {
  try {
    const typeLabels = {
      'marketing': 'Marketing',
      'production': 'Production',
      'qualite': 'Qualité',
      'finance': 'Finance',
      'commercial': 'Commercial',
      'gms': 'GMS',
      'export': 'Export',
      'essanaouber': 'Essanaouber',
      'controle': 'Contrôle de Gestion',
      'informatique': 'Informatique'
    };

    // ✅ Récupérer TOUS les validateurs
    const validators = await User.find({ role: { $regex: '^validateur_' } });
    
    console.log(`📢 Notifying all validators that ${validationType} rejected the article`);

    // ✅ Notifier TOUS les validateurs
    for (const validator of validators) {
      const notification = new Notification({
        user: validator._id,
        title: '⚠️ Article rejeté',
        message: `L'article "${articleTitle}" a été rejeté par ${typeLabels[validationType]}. Raison: ${comment || 'Non spécifiée'}`,
        type: 'validation_rejected',
        article: articleId,
        isRead: false,
        createdAt: new Date()
      });

      await notification.save();
      console.log(`✅ Notification envoyée à: ${validator.name}`);
    }

    // ✅ Notifier aussi le créateur
    const creatorNotification = new Notification({
      user: userId,
      title: '❌ Validation rejetée',
      message: `Votre article "${articleTitle}" a été rejeté par le département ${typeLabels[validationType]}. Raison: ${comment || 'Non spécifiée'}`,
      type: 'validation_rejected',
      article: articleId,
      isRead: false,
      createdAt: new Date()
    });

    await creatorNotification.save();
    console.log(`✅ Notification validation rejetée envoyée au créateur`);
    return true;
  } catch (error) {
    console.error('❌ Erreur notification validation rejetée:', error);
    return false;
  }
};

/**
 * Créer une notification pour un article publié (créé en QAD)
 */
const notifyArticlePublished = async (userId, articleTitle, articleId) => {
  try {
    const notification = new Notification({
      user: userId,
      title: '✅ Article créé en QAD',
      message: `Félicitations! Votre article "${articleTitle}" a été créé en QAD après validation de tous les départements.`,
      type: 'article_published',
      article: articleId,
      isRead: false,
      createdAt: new Date()
    });

    await notification.save();
    console.log(`✅ Notification article publié: ${articleId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur notification article publié:', error);
    return false;
  }
};

/**
 * Créer une notification pour un article rejeté
 */
const notifyArticleRejected = async (userId, articleTitle, articleId) => {
  try {
    const notification = new Notification({
      user: userId,
      title: '❌ Article rejeté',
      message: `Votre article "${articleTitle}" a été rejeté. Un ou plusieurs départements ont refusé la validation.`,
      type: 'article_rejected',
      article: articleId,
      isRead: false,
      createdAt: new Date()
    });

    await notification.save();
    console.log(`✅ Notification article rejeté: ${articleId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur notification article rejeté:', error);
    return false;
  }
};

/**
 * Créer une notification pour tous les validateurs quand article créé en QAD
 */
const notifyArticleCreatedInQAD = async (validatorId, articleTitle, articleId, qadCode) => {
  try {
    const notification = new Notification({
      user: validatorId,
      title: '✅ Article créé en QAD',
      message: `L'article "${articleTitle}" a été complètement validé et créé en QAD avec le code: ${qadCode}`,
      type: 'article_created_in_qad',
      article: articleId,
      isRead: false,
      createdAt: new Date()
    });

    await notification.save();
    console.log(`✅ Notification QAD envoyée au validateur: ${validatorId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur notification QAD:', error);
    return false;
  }
};

module.exports = {
  notifyArticleCreated,
  notifyNextValidation,
  notifyValidationApproved,
  notifyValidationRejected,
  notifyArticlePublished,
  notifyArticleRejected,
  notifyArticleCreatedInQAD
};