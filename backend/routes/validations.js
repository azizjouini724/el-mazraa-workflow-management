const express = require('express');
const router = express.Router();
const Validation = require('../models/validation');
const ProductArticle = require('../models/ProductArticle');
const { auth } = require('../middleware/auth');
const { canValidateType } = require('../middleware/roles');
const notificationService = require('../services/notificationService');

const VALIDATION_SEQUENCE = [
  'marketing',
  'production',
  'qualite',
  'finance',
  'commercial',
  'controle',
  'informatique'
];

function getValidationStepsForNature(nature) {
  let steps = [...VALIDATION_SEQUENCE];
  if (nature === 'UCPC')                               steps[4] = 'essanaouber';
  else if (nature === 'GMS')                           steps[4] = 'gms';
  else if (nature === 'Export')                        steps[4] = 'export';
  else if (nature === 'Croquette' || nature === 'Réseaux') steps[4] = 'commercial';
  return steps;
}

const ALLOWED_FIELDS = {
  marketing:    ['sousFamille', 'gamme'],
  production:   ['uniteVente', 'facteurConversion', 'tare', 'maxRemplissage', 'maxMatiere', 'coutRevient', 'emballage'],
  qualite:      ['dlc', 'dlv'],
  finance:      ['tauxTVA', 'compteVente'],
  commercial:   ['prixGrosHT', 'prixGrosTTC', 'prixDetailTTC'],
  gms:          ['prixGrosHT', 'prixGrosTTC', 'prixDetailTTC'],
  export:       ['prixGrosHT', 'prixGrosTTC', 'prixDetailTTC'],
  essanaouber:  ['prixGrosHT', 'prixGrosTTC', 'prixDetailTTC'],
  controle:     ['chargeParKG', 'commentaireControle'],
  informatique: []
};

// ✅ GET TOUTES LES VALIDATIONS POUR UN TYPE
router.get('/all/:validationType', auth, async (req, res) => {
  try {
    const { validationType } = req.params;
    const validations = await Validation.find({
      type: validationType,
      status: { $in: ['pending', 'approved', 'waiting', 'rejected'] }
    })
    .populate({
      path: 'article',
      match: { status: { $ne: 'rejete' } },
      select: '_id creator nature description1 description2 societe familleArticle typeArticle status currentValidationStep validations createdAt',
      populate: { path: 'creator', select: 'name email' }
    })
    .populate('validator', 'name email')
    .sort({ createdAt: -1 });

    const filteredValidations = validations.filter(v => v.article !== null);
    res.json({ success: true, data: filteredValidations, count: filteredValidations.length });
  } catch (error) {
    console.error('GET ALL VALIDATIONS ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET VALIDATIONS EN ATTENTE
router.get('/pending/:validationType', auth, async (req, res) => {
  try {
    const { validationType } = req.params;
    const validations = await Validation.find({
      type: validationType,
      status: 'pending'
    })
    .populate({
      path: 'article',
      select: '_id creator nature description1 description2 societe familleArticle typeArticle status currentValidationStep validations createdAt',
      populate: { path: 'creator', select: 'name email' }
    })
    .populate('validator', 'name email')
    .sort({ createdAt: -1 });

    const uniqueValidations = [];
    const seenArticles = new Set();
    validations.forEach(v => {
      const articleId = v.article?._id?.toString();
      if (articleId && !seenArticles.has(articleId)) {
        seenArticles.add(articleId);
        uniqueValidations.push(v);
      }
    });

    res.json({ success: true, data: uniqueValidations, count: uniqueValidations.length });
  } catch (error) {
    console.error('GET PENDING ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET UNE VALIDATION PAR ID
router.get('/:validationId', auth, async (req, res) => {
  try {
    const validation = await Validation.findById(req.params.validationId)
      .populate('article')
      .populate('validator');
    if (!validation) {
      return res.status(404).json({ success: false, message: 'Validation non trouvée' });
    }
    res.json({ success: true, data: validation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ POST VALIDER
router.post(
  '/:validationId/validate',
  auth,
  async (req, res, next) => {
    try {
      const val = await Validation.findById(req.params.validationId);
      if (!val) {
        return res.status(404).json({ success: false, message: 'Validation non trouvée' });
      }
      req.validationType = val.type;
      return canValidateType(val.type)(req, res, next);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
  async (req, res) => {
    try {
      const { avis, rejectionComment, commentaire, ...dataFields } = req.body;

      const currentVal = await Validation.findById(req.params.validationId);
      if (!currentVal) {
        return res.status(404).json({ success: false, message: 'Validation non trouvée' });
      }

      if (currentVal.status !== 'pending') {
        return res.status(403).json({
          success: false,
          message: `Cette validation n'est pas en attente (${currentVal.status})`
        });
      }

      const article = await ProductArticle.findById(currentVal.article)
        .populate('creator', 'name email')
        .populate({ path: 'validations', populate: { path: 'validator', select: 'name email role' } });

      if (!article) {
        return res.status(404).json({ success: false, message: 'Article non trouvé' });
      }

      const articleTitle = `${article.nature} - ${article.description1.substring(0, 30)}`;

      // 1. Enregistrer décision
      currentVal.avis = avis;
      currentVal.status = avis === 'Favorable' ? 'approved' : 'rejected';
      currentVal.validatedAt = new Date();
      currentVal.validator = req.user.id;
      currentVal.commentaire = commentaire || '';

      if (avis === 'Défavorable') {
        currentVal.rejectionComment = rejectionComment;
      }

      // 2. ✅ Sauvegarder champs métiers sur la validation
      if (avis === 'Favorable') {
        const allowedFields = ALLOWED_FIELDS[currentVal.type] || [];
        allowedFields.forEach(field => {
          if (dataFields[field] !== undefined) {
            currentVal[field] = dataFields[field];
          }
        });
      }

      await currentVal.save();
      console.log(`✅ Validation ${currentVal.type} sauvegardée: ${currentVal.status}`);

      // 3. ✅ Copier dans article.finalData (visible dans MongoDB)
      if (avis === 'Favorable') {
        if (!article.finalData) article.finalData = {};
        const allowedFields = ALLOWED_FIELDS[currentVal.type] || [];
        allowedFields.forEach(field => {
          if (dataFields[field] !== undefined) {
            article.finalData[field] = dataFields[field];
          }
        });
        article.markModified('finalData');
        console.log(`✅ finalData mis à jour pour ${currentVal.type}:`, article.finalData);
      }

      // 4. REJET → arrêt workflow
      if (avis === 'Défavorable') {
        article.status = 'rejete';
        article.currentValidationStep = 'rejete';
        await article.save();

        await Validation.updateMany(
          { article: article._id, status: { $in: ['pending', 'waiting'] } },
          { status: 'cancelled', avis: 'Annulée' }
        );

        try {
          await notificationService.notifyValidationRejected(
            article.creator._id, currentVal.type, articleTitle, article._id, rejectionComment
          );
        } catch (e) {
          console.warn('Notif rejet (non bloquant):', e.message);
        }

        return res.json({ success: true, message: 'Article rejeté - Workflow arrêté' });
      }

      // 5. FAVORABLE → étape suivante
      const validationSteps = getValidationStepsForNature(article.nature);
      const currentStepIndex = validationSteps.indexOf(currentVal.type);
      const nextStepIndex = currentStepIndex + 1;

      if (nextStepIndex < validationSteps.length) {
        const nextStepType = validationSteps[nextStepIndex];

        const nextValidation = await Validation.findOne({
          article: article._id,
          type: nextStepType,
          status: 'waiting'
        }).populate('validator', 'name email');

        if (nextValidation) {
          nextValidation.status = 'pending';
          await nextValidation.save();
          article.currentValidationStep = nextStepType;
          console.log(`✅ Étape suivante activée: ${nextStepType}`);
        } else {
          console.warn(`⚠️ Validation ${nextStepType} non trouvée`);
        }

        await article.save();

        try {
          if (nextValidation?.validator) {
            await notificationService.notifyNextValidation(
              nextValidation.validator._id, nextStepType, articleTitle, article._id
            );
          }
          await notificationService.notifyValidationApproved(
            article.creator._id, currentVal.type, articleTitle, article._id
          );
        } catch (e) {
          console.warn('Notif approbation (non bloquant):', e.message);
        }

      } else {
        // 6. ✅ DERNIÈRE ÉTAPE — article QAD
        article.status = 'créé_en_qad';
        article.currentValidationStep = 'terminé';
        article.qadCode = `QAD-${Date.now()}`;
        article.qadCreatedAt = new Date();
        await article.save();

        console.log(`✅ Article finalisé! Code QAD: ${article.qadCode}`);
        console.log(`✅ finalData complet:`, JSON.stringify(article.finalData));

        try {
          await notificationService.notifyArticlePublished(
            article.creator._id, articleTitle, article._id
          );
        } catch (e) {
          console.warn('Notif publication (non bloquant):', e.message);
        }
      }

      res.json({ success: true, message: '✅ Validation approuvée' });

    } catch (error) {
      console.error('❌ VALIDATION ERROR:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;