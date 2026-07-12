const express = require('express');
const Wallpaper = require('../models/Wallpaper');
const auth = require('../middleware/auth');
const { uploadImages, uploadTexture } = require('../middleware/upload');
const multer = require('multer');

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
  try {
    const { category, color, brand, minPrice, maxPrice, sort, featured, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (color) filter.color = { $regex: color, $options: 'i' };
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (featured === 'true') filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { views: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const wallpapers = await Wallpaper.find(filter).populate('category').sort(sortOption);
    res.json(wallpapers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const wallpapers = await Wallpaper.find({ featured: true }).populate('category').limit(8);
    res.json(wallpapers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/discounted', async (req, res) => {
  try {
    const wallpapers = await Wallpaper.find({ discount: { $gt: 0 } }).populate('category').limit(8);
    res.json(wallpapers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id).populate('category');
    if (!wallpaper) return res.status(404).json({ message: 'Oboy topilmadi' });
    await Wallpaper.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json(wallpaper);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin routes
const uploadFields = uploadImages.fields([
  { name: 'images', maxCount: 5 },
  { name: 'texture', maxCount: 1 },
]);

router.post('/', auth, uploadFields, async (req, res) => {
  try {
    const { name, description, price, category, color, brand, width, length, material, stock, featured, discount } = req.body;
    const images = req.files?.images?.map(f => `/uploads/images/${f.filename}`) || [];
    const texture = req.files?.texture?.[0] ? `/uploads/textures/${req.files.texture[0].filename}` : '';
    const last = await Wallpaper.findOne({ sku: /^OB-\d+$/ }).sort({ sku: -1 }).select('sku').lean();
    const lastNum = last ? parseInt(last.sku.split('-')[1], 10) : 0;
    const sku = `OB-${String(lastNum + 1).padStart(4, '0')}`;

    const wallpaper = new Wallpaper({
      name, description, price: Number(price), category, color, brand,
      width, length, material, images, texture, sku,
      stock: stock !== 'false',
      featured: featured === 'true',
      discount: Number(discount) || 0,
    });
    await wallpaper.save();
    await wallpaper.populate('category');
    res.status(201).json(wallpaper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, uploadFields, async (req, res) => {
  try {
    const { name, description, price, category, color, brand, width, length, material, stock, featured, discount } = req.body;
    const update = { name, description, price: Number(price), category, color, brand, width, length, material };
    if (stock !== undefined) update.stock = stock !== 'false';
    if (featured !== undefined) update.featured = featured === 'true';
    if (discount !== undefined) update.discount = Number(discount) || 0;
    if (req.files?.images?.length) update.$push = { images: { $each: req.files.images.map(f => `/uploads/images/${f.filename}`) } };
    if (req.files?.texture?.[0]) update.texture = `/uploads/textures/${req.files.texture[0].filename}`;

    const wallpaper = await Wallpaper.findByIdAndUpdate(req.params.id, update, { new: true }).populate('category');
    if (!wallpaper) return res.status(404).json({ message: 'Oboy topilmadi' });
    res.json(wallpaper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/stock', auth, async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findByIdAndUpdate(
      req.params.id,
      { stock: Boolean(req.body.stock) },
      { new: true }
    ).populate('category');
    if (!wallpaper) return res.status(404).json({ message: 'Oboy topilmadi' });
    res.json(wallpaper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findByIdAndDelete(req.params.id);
    if (!wallpaper) return res.status(404).json({ message: 'Oboy topilmadi' });
    res.json({ message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
