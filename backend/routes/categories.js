const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { uploadCategory } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Kategoriya topilmadi' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, uploadCategory.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/images/${req.file.filename}` : '';
    const category = new Category({ name, image });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, uploadCategory.single('image'), async (req, res) => {
  try {
    const update = { name: req.body.name };
    if (req.file) update.image = `/uploads/images/${req.file.filename}`;
    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!category) return res.status(404).json({ message: 'Kategoriya topilmadi' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Kategoriya topilmadi' });
    res.json({ message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
