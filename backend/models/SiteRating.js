const mongoose = require('mongoose');

const siteRatingSchema = new mongoose.Schema({
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  name: { type: String, default: '' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SiteRating', siteRatingSchema);
