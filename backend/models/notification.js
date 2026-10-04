const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'article_created',
      'article_published',
      'article_rejected',
      'article_created_in_qad',
      'validation_requested',
      'validation_approved',
      'validation_rejected',
      'validation_required'
    ],
    default: 'article_created'
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductArticle'
  },
  validation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Validation'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);