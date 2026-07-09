const express = require('express');
const Feature = require('../models/Feature');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const features = await Feature.find().sort({ order: 1, createdAt: 1 });
    res.json(features);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { icon, title, description, order } = req.body;
    const feature = new Feature({ icon, title, description, order });
    await feature.save();
    res.status(201).json(feature);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { icon, title, description, order } = req.body;
    const feature = await Feature.findByIdAndUpdate(
      req.params.id,
      { icon, title, description, order },
      { new: true }
    );
    if (!feature) return res.status(404).json({ message: 'Afzallik topilmadi' });
    res.json(feature);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const feature = await Feature.findByIdAndDelete(req.params.id);
    if (!feature) return res.status(404).json({ message: 'Afzallik topilmadi' });
    res.json({ message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
