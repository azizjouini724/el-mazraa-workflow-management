const express = require('express');
const History = require('../models/history');
const Article = require('../models/article');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET - Récupérer l'historique d'un article
router.get('/article/:articleId', async (req, res) => {
  try {
    // Vérifier que l'article existe
    const article = await Article.findById(req.params.articleId);
    if (!article) {
      return res.status(404).json({
        message: 'Article non trouvé'
      });
    }

    // Récupérer l'historique
    const history = await History.find({ article: req.params.articleId })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Historique récupéré',
      data: history
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
});

// GET - Récupérer tout l'historique (admin seulement)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Calculer la pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Récupérer l'historique
    const history = await History.find()
      .populate('user', 'name email role')
      .populate('article', 'title')
      .limit(pageSize)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Compter le total
    const total = await History.countDocuments();

    res.json({
      message: 'Historique complet récupéré',
      data: history,
      pagination: {
        total: total,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur',
      error: error.message
    });
  }
});

module.exports = router;