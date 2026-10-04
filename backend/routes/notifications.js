const express = require('express');
const Notification = require('../models/notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET - Récupérer toutes les notifications de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    // Récupérer les paramètres
    const { unreadOnly = false, page = 1, limit = 10 } = req.query;

    // Construire le filtre
    let filter = { user: req.user.id };

    // Filtrer seulement les non-lues si demandé
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    // Calculer la pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Récupérer les notifications
    const notifications = await Notification.find(filter)
      .populate('article', 'title status')
      .populate('validation', 'type status')
      .limit(pageSize)
      .skip(skip)
      .sort({ createdAt: -1 }); // Récent en premier

    // Compter le total
    const total = await Notification.countDocuments(filter);

    // Compter les non-lues
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      message: 'Notifications récupérées',
      data: notifications,
      unreadCount: unreadCount,
      pagination: {
        total: total,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('❌ GET NOTIFICATIONS ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
});

// GET - Compter les notifications non-lues
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    console.log(`✅ Unread count for ${req.user.id}: ${count}`);

    res.json({
      success: true,
      message: 'Nombre de notifications non-lues',
      count: count
    });
  } catch (error) {
    console.error('❌ UNREAD COUNT ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      error: error.message
    });
  }
});

// PUT - Marquer une notification comme lue
router.put('/:id/read', auth, async (req, res) => {
  try {
    // Trouver et mettre à jour la notification
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    console.log(`✅ Notification ${req.params.id} marked as read`);

    res.json({
      success: true,
      message: 'Notification marquée comme lue',
      data: notification
    });
  } catch (error) {
    console.error('❌ MARK AS READ ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      error: error.message
    });
  }
});

// PUT - Marquer toutes les notifications comme lues
router.put('/read-all', auth, async (req, res) => {
  try {
    // Mettre à jour toutes les notifications de l'utilisateur
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read`);

    res.json({
      success: true,
      message: 'Toutes les notifications marquées comme lues',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ MARK ALL AS READ ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      error: error.message
    });
  }
});

// DELETE - Supprimer une notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    console.log(`✅ Notification ${req.params.id} deleted`);

    res.json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    console.error('❌ DELETE NOTIFICATION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      error: error.message
    });
  }
});

module.exports = router;