const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  color: { type: String, default: '' },
  brand: { type: String, default: '' },
  images: [{ type: String }],
  texture: { type: String, default: '' },
  width: { type: String, default: '1.06m' },
  length: { type: String, default: '10m' },
  material: { type: String, default: '' },
  stock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Wallpaper', wallpaperSchema);
