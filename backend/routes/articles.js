const express = require('express');
const router = express.Router();
const ProductArticle = require('../models/ProductArticle');
const Validation = require('../models/validation');
const { auth } = require('../middleware/auth');
const { getAllValidatorsForType } = require('../utils/roleMapper');
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
  if (nature === 'UCPC') steps[4] = 'essanaouber';
  else if (nature === 'GMS') steps[4] = 'gms';
  else if (nature === 'Export') steps[4] = 'export';
  else if (nature === 'Croquette' || nature === 'Réseaux') steps[4] = 'commercial';
  return steps;
}

// ✅ 1. POST - CRÉER UN ARTICLE
router.post('/create', auth, async (req, res) => {
  try {
    const { societe, nature, description1, description2, familleArticle, typeArticle, photo } = req.body;

    if (!societe || !nature || !description1 || !familleArticle || !typeArticle) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    const newArticle = new ProductArticle({
      creator: req.user.id,
      societe, nature, description1, description2, familleArticle, typeArticle, photo,
      status: 'en_validation',
      currentValidationStep: 'marketing',
      validations: []
    });

    await newArticle.save();
    console.log(`✅ Article créé: ${newArticle._id}`);

    const articleTitle = `${nature} - ${description1.substring(0, 30)}`;
    await notificationService.notifyArticleCreated(
      req.user.id,
      newArticle._id,
      articleTitle
    );

    const validationSteps = getValidationStepsForNature(nature);

    // Créer les 7 validations
    for (let i = 0; i < validationSteps.length; i++) {
      const validationType = validationSteps[i];
      const validators = await getAllValidatorsForType(validationType);
      
      if (validators.length === 0) {
        console.warn(`⚠️ Aucun validateur pour: ${validationType}`);
        continue;
      }

      const primaryValidator = validators[0];
      
      const validation = new Validation({
        article: newArticle._id,
        type: validationType,
        status: i === 0 ? 'pending' : 'waiting',
        validator: primaryValidator._id,
        avis: null,
        commentaire: '',
        rejectionComment: ''
      });
      
      await validation.save();
      newArticle.validations.push(validation._id);

      console.log(`✅ Validation ${validationType} créée (${validation.status})`);
    }

    await newArticle.save();

    // Notifier le premier validateur
    const firstValidator = await getAllValidatorsForType(validationSteps[0]);
    if (firstValidator.length > 0) {
      await notificationService.notifyNextValidation(
        firstValidator[0]._id,
        validationSteps[0],
        articleTitle,
        newArticle._id
      );
      console.log(`✅ ${validationSteps[0]} notifié`);
    }

    res.status(201).json({
      success: true,
      message: `✅ Demande créée - ${validationSteps[0].toUpperCase()} en attente`,
      data: newArticle._id
    });

  } catch (error) {
    console.error('❌ CREATE ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ 2. GET TOUTES LES DEMANDES DE L'UTILISATEUR
router.get('/all', auth, async (req, res) => {
  try {
    console.log('📋 Fetching articles for user:', req.user.id);
    
    const articles = await ProductArticle.find({ creator: req.user.id })
      .populate('creator', 'name email')
      .populate({
        path: 'validations',
        populate: { path: 'validator', select: 'name email role' }
      })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${articles.length} articles`);
    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('❌ GET ALL ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ 3. GET UN ARTICLE PAR ID
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('📋 Fetching article by ID:', req.params.id);
    
    const article = await ProductArticle.findById(req.params.id)
      .populate('creator', 'name email')
      .populate({
        path: 'validations',
        populate: { path: 'validator', select: 'name email role' }
      });

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article non trouvé' });
    }

    console.log('✅ Article found:', article._id);
    res.json({ success: true, data: article });
  } catch (error) {
    console.error('❌ GET BY ID ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ 4. GET TOUS LES ARTICLES EN QAD
router.get('/qad/all', auth, async (req, res) => {
  try {
    console.log('📋 Fetching QAD articles');
    
    const articles = await ProductArticle.find({ status: 'créé_en_qad' })
      .populate('creator', 'name email')
      .populate({
        path: 'validations',
        populate: { path: 'validator', select: 'name email role' }
      })
      .sort({ qadCreatedAt: -1 });
    
    console.log(`✅ Found ${articles.length} QAD articles`);
    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('❌ GET QAD ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;