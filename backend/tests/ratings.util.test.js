const db = require('./setup');
const { recomputeWallpaperRating } = require('../utils/ratings');
const Review = require('../models/Review');
const Wallpaper = require('../models/Wallpaper');
const Category = require('../models/Category');

beforeAll(async () => db.connect());
afterAll(async () => db.closeDatabase());

describe('recomputeWallpaperRating', () => {
  it('rounds the average to one decimal place', async () => {
    const category = await Category.create({ name: 'Kategoriya' });
    const wallpaper = await Wallpaper.create({ name: 'Oboy', price: 1000, category: category._id });
    await Review.create([
      { wallpaper: wallpaper._id, name: 'A', stars: 5 },
      { wallpaper: wallpaper._id, name: 'B', stars: 4 },
      { wallpaper: wallpaper._id, name: 'C', stars: 4 },
    ]);

    await recomputeWallpaperRating(wallpaper._id);

    const updated = await Wallpaper.findById(wallpaper._id);
    expect(updated.ratingAverage).toBeCloseTo(4.3, 1);
    expect(updated.ratingCount).toBe(3);
  });

  it('resets to zero when a wallpaper has no reviews', async () => {
    const category = await Category.create({ name: 'Kategoriya 2' });
    const wallpaper = await Wallpaper.create({ name: 'Sharhsiz oboy', price: 1000, category: category._id });

    await recomputeWallpaperRating(wallpaper._id);

    const updated = await Wallpaper.findById(wallpaper._id);
    expect(updated.ratingAverage).toBe(0);
    expect(updated.ratingCount).toBe(0);
  });
});
