const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  role: {
    type: String,
    enum: [
      'user',
      'admin',
      'demandeur',
      'validateur_marketing',
      'validateur_production',
      'validateur_qualite',
      'validateur_finance',
      'validateur_commercial',
      'validateur_essanaouber',
      'validateur_gms',
      'validateur_export',
      'validateur_ucpc',
      'validateur_controle',
      'validateur_informatique'
    ],
    default: 'user'
  },
  
  department: {
    type: String,
    enum: [
      'marketing',
      'production',
      'qualite',
      'finance',
      'commercial',
      'essanaouber',
      'gms',
      'export',
      'ucpc',
      'controle',
      'informatique'
    ]
  },
  
  photoPath: {
    type: String,
    default: null
  },
  
  phone: {
    type: String,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(passwordToCheck) {
  return await bcrypt.compare(passwordToCheck, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;