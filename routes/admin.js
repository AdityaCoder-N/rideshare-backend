const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middlewares/fetchUser');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET;

// Route to create an admin
router.post('/create-admin', [
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Enter a valid Password').isLength({ min: 3 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    let admin = await Admin.findOne({ email: req.body.email });

    if (admin) {
      return res.status(400).json({ success: false, error: 'Admin with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(req.body.password, salt);

    admin = await Admin.create({
      name: req.body.name,
      password: secPassword,
      email: req.body.email
    });

    const data = {
      admin: {
        id: admin.id
      }
    };

    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.status(200).json({ success, authToken });
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

// Route to delete an admin
router.delete('/delete-admin/:adminId', async (req, res) => {
  try {
    const adminId = req.params.adminId;

    // Delete the admin
    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Route to verify a user
router.post('/verify-user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Get the user by ID
      const user = await User.findById(userId);
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      // Check if the user is an admin (admins can't be verified)
      if (user.isAdmin) {
        return res.status(400).json({ success: false, error: 'Admins cannot be verified' });
      }
  
      // Check if the user is already verified
      if (user.verified) {
        return res.status(400).json({ success: false, error: 'User is already verified' });
      }
  
      // Update the user's verification status to true
      user.verified = true;
      await user.save();
  
      res.status(200).json({ success: true, message: 'User verified successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route to fetch unverified users
router.get('/get-unverified-users', async (req, res) => {
    try {
      // Fetch unverified users
      const unverifiedUsers = await User.find({ verified: false });
  
      res.status(200).json({ success: true, unverifiedUsers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


  
router.delete('/delete-all-users', async (req, res) => {
    try {
      // Delete all users
      await User.deleteMany({});
      res.status(200).json({ success: true, message: 'All users deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
  
module.exports = router;
