const express = require('express');
const Wallpaper = require('../models/Wallpaper');
const Category = require('../models/Category');
const Contact = require('../models/Contact');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const [wallpapers, categories, contacts, unread, orders, newOrders, revenueAgg] = await Promise.all([
      Wallpaper.countDocuments(),
      Category.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'new' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);
    res.json({
      wallpapers,
      categories,
      contacts,
      unread,
      orders,
      newOrders,
      revenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
