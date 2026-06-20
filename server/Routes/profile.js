const express = require('express');
const validator = require('validator');
const User = require('../Models/User');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { _id } = req.user;
    const userData = await User.findById(_id);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { name, email, accountCreatedOn } = userData;
    res.json({ name, email, accountCreatedOn });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { _id } = req.user;
    const { name, email } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const userData = await User.findById(_id);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== userData.email) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    userData.name = name.trim();
    userData.email = normalizedEmail;
    await userData.save();

    res.json({
      message: 'Profile updated successfully',
      name: userData.name,
      email: userData.email,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
