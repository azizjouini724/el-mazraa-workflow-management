const express = require('express');
const Article = require('../models/article');
const Validation = require('../models/validation');
const User = require('../models/user');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

const router = express.Router();

// GET - Récupérer toutes les statistiques (admin seulement)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    // Statistiques Articles
    const totalArticles = await Article.countDocuments();
    const articlesbyStatus = await Article.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Statistiques Validations
    const totalValidations = await Validation.countDocuments();
    const validationsByStatus = await Validation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const validationsByType = await Validation.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // Statistiques Utilisateurs
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Articles créés ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const articlesThisMonth = await Article.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Taux d'approbation
    const approvedValidations = await Validation.countDocuments({ status: 'approved' });
    const rejectedValidations = await Validation.countDocuments({ status: 'rejected' });
    const approvalRate = totalValidations > 0 
      ? ((approvedValidations / totalValidations) * 100).toFixed(2)
      : 0;

    res.json({
      message: 'Statistiques récupérées',
      data: {
        articles: {
          total: totalArticles,
          byStatus: articlesbyStatus,
          thisMonth: articlesThisMonth
        },
        validations: {
          total: totalValidations,
          byStatus: validationsByStatus,
          byType: validationsByType,
          approved: approvedValidations,
          rejected: rejectedValidations,
          approvalRate: `${approvalRate}%`
        },
        users: {
          total: totalUsers,
          byRole: usersByRole
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// GET - Statistiques pour l'utilisateur connecté
router.get('/user/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Articles de l'utilisateur
    const myArticles = await Article.countDocuments({ author: userId });
    const myArticlesByStatus = await Article.aggregate([
      { $match: { author: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Validations de l'utilisateur
    const myValidations = await Validation.countDocuments({ validator: userId });
    const myValidationsByStatus = await Validation.aggregate([
      { $match: { validator: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Articles approuvés/rejetés par cet utilisateur
    const myApproved = await Validation.countDocuments({
      validator: userId,
      status: 'approved'
    });

    const myRejected = await Validation.countDocuments({
      validator: userId,
      status: 'rejected'
    });

    res.json({
      message: 'Dashboard utilisateur',
      data: {
        articles: {
          total: myArticles,
          byStatus: myArticlesByStatus
        },
        validations: {
          total: myValidations,
          byStatus: myValidationsByStatus,
          approved: myApproved,
          rejected: myRejected
        }
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