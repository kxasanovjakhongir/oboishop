const express = require('express');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

router.post('/', writeLimiter, async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    const contact = new Contact({ name, phone, message });
    await contact.save();
    res.status(201).json({ message: 'Murojaatingiz qabul qilindi!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Murojaat topilmadi' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Murojaat topilmadi' });
    res.json({ message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
