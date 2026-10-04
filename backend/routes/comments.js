const express = require('express');
const Comment = require('../models/comment');
const Article = require('../models/article');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET - Récupérer les commentaires d'un article
router.get('/article/:articleId', async (req, res) => {
  try {
    // Vérifier que l'article existe
    const article = await Article.findById(req.params.articleId);
    if (!article) {
      return res.status(404).json({
        message: 'Article non trouvé'
      });
    }

    // Récupérer les commentaires
    const comments = await Comment.find({ article: req.params.articleId })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Commentaires récupérés',
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des commentaires',
      error: error.message
    });
  }
});

// GET - Récupérer un commentaire
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name email role')
      .populate('article', 'title');

    if (!comment) {
      return res.status(404).json({
        message: 'Commentaire non trouvé'
      });
    }

    res.json({
      message: 'Commentaire trouvé',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur',
      error: error.message
    });
  }
});

// POST - Créer un commentaire (authentification requise)
router.post('/', auth, async (req, res) => {
  try {
    const { article, content, type } = req.body;

    // Vérifier les champs obligatoires
    if (!article || !content) {
      return res.status(400).json({
        message: 'article et content sont requis'
      });
    }

    // Vérifier que l'article existe
    const articleExists = await Article.findById(article);
    if (!articleExists) {
      return res.status(404).json({
        message: 'Article non trouvé'
      });
    }

    // Créer le commentaire
    const newComment = new Comment({
      article,
      author: req.user.id,
      content,
      type: type || 'remarque'
    });

    await newComment.save();
    await newComment.populate('author', 'name email role');

    res.status(201).json({
      message: 'Commentaire créé avec succès',
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la création du commentaire',
      error: error.message
    });
  }
});

// PUT - Modifier un commentaire (seulement l'auteur)
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, type } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: 'Commentaire non trouvé'
      });
    }

    // Vérifier que c'est l'auteur
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Vous ne pouvez modifier que vos propres commentaires'
      });
    }

    // Mettre à jour
    if (content) comment.content = content;
    if (type) comment.type = type;
    comment.updatedAt = Date.now();

    await comment.save();
    await comment.populate('author', 'name email role');

    res.json({
      message: 'Commentaire mis à jour',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur',
      error: error.message
    });
  }
});

// DELETE - Supprimer un commentaire (seulement l'auteur)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: 'Commentaire non trouvé'
      });
    }

    // Vérifier que c'est l'auteur
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Vous ne pouvez supprimer que vos propres commentaires'
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Commentaire supprimé'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur',
      error: error.message
    });
  }
});

module.exports = router;