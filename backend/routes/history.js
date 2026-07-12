const express = require('express');
const History = require('../models/History');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const history = await History.find().sort({ order: 1, createdAt: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { year, text, order } = req.body;
    const entry = new History({ year, text, order });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { year, text, order } = req.body;
    const entry = await History.findByIdAndUpdate(
      req.params.id,
      { year, text, order },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Tarix yozuvi topilmadi' });
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await History.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Tarix yozuvi topilmadi' });
    res.json({ message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
