const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  wallpaper: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallpaper', required: true },
  name: { type: String, required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
