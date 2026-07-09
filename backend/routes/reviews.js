const express = require('express');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const { recomputeWallpaperRating } = require('../utils/ratings');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

router.get('/all', auth, async (req, res) => {
  try {
    const reviews = await Review.find().populate('wallpaper', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { wallpaper } = req.query;
    if (!wallpaper) return res.status(400).json({ message: "Oboy id'si ko'rsatilmagan" });
    const reviews = await Review.find({ wallpaper }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', writeLimiter, async (req, res) => {
  try {
    const { wallpaper, name, stars, comment } = req.body;
    const review = await Review.create({ wallpaper, name, stars, comment });
    await recomputeWallpaperRating(wallpaper);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Sharh topilmadi' });
    await recomputeWallpaperRating(review.wallpaper);
    res.json({ message: "O'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
