const mongoose = require('mongoose');
const Review = require('../models/Review');
const Wallpaper = require('../models/Wallpaper');

async function recomputeWallpaperRating(wallpaperId) {
  const [agg] = await Review.aggregate([
    { $match: { wallpaper: new mongoose.Types.ObjectId(wallpaperId) } },
    { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } },
  ]);
  await Wallpaper.findByIdAndUpdate(wallpaperId, {
    ratingAverage: agg ? Math.round(agg.avg * 10) / 10 : 0,
    ratingCount: agg ? agg.count : 0,
  });
}

module.exports = { recomputeWallpaperRating };
