const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendPasswordResetEmail } = require('../services/emailService');

let multer, path, fs, uploadDir, upload;

try {
  multer = require('multer');
  path = require('path');
  fs = require('fs');

  uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'photo-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({
    storage: storage,
    limits: {
      fileSize: 2 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Format d\'image non valide'));
      }
      cb(null, true);
    }
  });
} catch (err) {
  console.warn('Multer non installé');
}

const router = express.Router();

// MIDDLEWARE AUTHENTIFICATION
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token manquant' 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          success: false,
          message: 'Token invalide ou expiré' 
        });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur authentification' 
    });
  }
};

// MIDDLEWARE ADMIN
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Accès réservé aux administrateurs' 
    });
  }
  next();
};

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email et password requis' 
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou password incorrect' 
      });
    }
    
    if (user.isActive === false) {
      return res.status(403).json({ 
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou password incorrect' 
      });
    }
    
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoPath: user.photoPath ? `/uploads/${user.photoPath}` : null,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email requis' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien a été envoyé'
      });
    }

    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailResult = await sendPasswordResetEmail(email, resetLink);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      });
    }

    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement'
    });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token et mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 6 caractères'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Lien expiré ou invalide'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation'
    });
  }
});

// REGISTER (Admin uniquement)
router.post('/register', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Tous les champs requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Minimum 6 caractères' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }
    
    const newUser = new User({
      name,
      email,
      password,
      role: role || 'user',
      isActive: true
    });
    
    await newUser.save();
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé',
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    // ✅ LOG DÉTAILLÉ pour voir le vrai problème
    console.error('❌ REGISTER ERROR:', error.message);
    console.error('❌ DETAILS:', JSON.stringify(error.errors, null, 2));
    
    // ✅ Retourner le vrai message d'erreur
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message // ✅ message réel
    });
  }
});
// GET ALL USERS (Admin)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('_id name email role isActive createdAt updatedAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors du chargement'
    });
  }
});

// GET USER BY ID (Admin)
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('_id name email role isActive createdAt updatedAt');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur'
    });
  }
});

// UPDATE USER (Admin)
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, active } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Email déjà utilisé' 
        });
      }
      user.email = email;
    }
    if (role) user.role = role;
    if (active !== undefined) user.isActive = active;
    
    user.updatedAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur'
    });
  }
});

// DELETE USER (Admin)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Impossible de supprimer votre compte' 
      });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé',
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur'
    });
  }
});

// GET CURRENT USER
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('_id name email role isActive photoPath phone createdAt updatedAt');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        photoPath: user.photoPath ? `/uploads/${user.photoPath}` : null,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur'
    });
  }
});

// UPDATE PROFILE (Utilisateur authentifié)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email requis'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email déjà utilisé'
        });
      }
    }

    user.name = name;
    user.email = email;
    if (phone) user.phone = phone;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Profil mis à jour',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photoPath: user.photoPath ? `/uploads/${user.photoPath}` : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur'
    });
  }
});

// CHANGE PASSWORD
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Ancien et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 6 caractères'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Ancien mot de passe incorrect'
      });
    }

    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe changé',
      data: {
        updatedAt: user.updatedAt  // ✅ AJOUTE CETTE LIGNE
      }

    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur'
    });
  }
});

// UPLOAD PHOTO
if (upload) {
  router.post('/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        if (req.file && fs) {
          fs.unlink(req.file.path, (err) => {});
        }
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      if (user.photoPath && fs) {
        const oldPhotoPath = path.join(__dirname, '../uploads', user.photoPath);
        fs.unlink(oldPhotoPath, (err) => {});
      }

      user.photoPath = req.file.filename;
      user.updatedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Photo téléchargée',
        data: {
          photoPath: `/uploads/${req.file.filename}`
        }
      });
    } catch (error) {
      if (req.file && fs) {
        fs.unlink(req.file.path, (err) => {});
      }
      res.status(500).json({
        success: false,
        message: 'Erreur'
      });
    }
  });
}

module.exports = router;