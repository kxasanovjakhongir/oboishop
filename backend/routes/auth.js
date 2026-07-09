const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Login yoki parol noto\'g\'ri' });
    }
    const token = jwt.sign({ id: admin._id, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
