const express = require('express');
const SiteRating = require('../models/SiteRating');
const auth = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const [agg] = await SiteRating.aggregate([
      { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } },
    ]);
    res.json({
      average: agg ? Math.round(agg.avg * 10) / 10 : 0,
      count: agg ? agg.count : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const ratings = await SiteRating.find({ featured: true, comment: { $ne: '' } }).sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const ratings = await SiteRating.find().sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', writeLimiter, async (req, res) => {
  try {
    const { stars, comment, name } = req.body;
    const rating = await SiteRating.create({ stars, comment, name });
    res.status(201).json(rating);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/feature', auth, async (req, res) => {
  try {
    const { featured } = req.body;
    const rating = await SiteRating.findByIdAndUpdate(req.params.id, { featured: !!featured }, { new: true });
    if (!rating) return res.status(404).json({ message: 'Baholash topilmadi' });
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const rating = await SiteRating.findByIdAndDelete(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Baholash topilmadi' });
    res.json({ message: "O'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
