const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();


// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    data: Buffer,
    contentType: String
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Multer configuration for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create user with image
router.post('/users', upload.single('image'), async (req, res) => {
  try {
    const { name, mobile, address } = req.body;

    // Validation
    if (!name || !mobile || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile, and address are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Create new user
    const newUser = new User({
      name,
      mobile,
      address,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: savedUser._id,
        name: savedUser.name,
        mobile: savedUser.mobile,
        address: savedUser.address,
        createdAt: savedUser.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all users (without image data for performance)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-image').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-image');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user image
router.get('/users/:id/image', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user || !user.image.data) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.set('Content-Type', user.image.contentType);
    res.send(user.image.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;
