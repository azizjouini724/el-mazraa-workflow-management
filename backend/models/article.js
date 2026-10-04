const express = require('express');
const router = express.Router();
const ProductArticle = require('../models/ProductArticle');
const Validation = require('../models/validation');
const User = require('../models/user');
const { auth } = require('../middleware/auth');

router.post('/create', auth, async (req, res) => {
  try {
    console.log('🚀 CRÉATION DEMANDE:', req.user);
    
    const newArticle = new ProductArticle({
      creator: req.user.id,
      societe: req.body.societe || 'Mazraa',
      nature: req.body.nature || 'Réseaux', 
      description1: req.body.description1 || 'Test',
      familleArticle: req.body.familleArticle || 'Test',
      typeArticle: req.body.typeArticle || 'Frais'
    });

    await newArticle.save();
    
    // ✅ CRÉER VALIDATION MARKETING SIMPLE
    const marketingValidation = new Validation({
      article: newArticle._id,
      type: 'marketing',
      status: 'pending',
      validator: null // Sera visible par TOUS
    });
    await marketingValidation.save();

    console.log('✅ ARTICLE + VALIDATION CREE');
    res.json({ success: true, articleId: newArticle._id });
  } catch (error) {
    console.error('❌ ERREUR:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending/:type', auth, async (req, res) => {
  try {
    console.log('🔍 RECHERCHE:', req.params.type, req.user);
    
    const validations = await Validation.find({
      type: req.params.type,
      status: 'pending'
    }).populate('article');

    console.log(`✅ ${validations.length} trouvés`);
    res.json({ success: true, data: validations });
  } catch (error) {
    console.error('❌ ERREUR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
