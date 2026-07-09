const express = require('express');
const Order = require('../models/Order');
const Wallpaper = require('../models/Wallpaper');
const auth = require('../middleware/auth');
const { sendTelegramMessage } = require('../utils/telegram');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

const STATUS_LABELS = {
  new: 'Yangi',
  confirmed: 'Tasdiqlangan',
  delivered: 'Yetkazilgan',
  cancelled: 'Bekor qilingan',
};

router.get('/', auth, async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', writeLimiter, async (req, res) => {
  try {
    const { items, customerName, phone, address, comment } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Savat bo\'sh' });
    }
    if (!customerName?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: 'Ism va telefon raqami majburiy' });
    }

    const orderItems = [];
    for (const item of items) {
      const wallpaper = await Wallpaper.findById(item.wallpaperId);
      if (!wallpaper) continue;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = wallpaper.discount > 0
        ? Math.round(wallpaper.price * (1 - wallpaper.discount / 100))
        : wallpaper.price;
      orderItems.push({
        wallpaper: wallpaper._id,
        name: wallpaper.name,
        image: wallpaper.images?.[0] || '',
        price,
        quantity,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'Buyurtma uchun mahsulotlar topilmadi' });
    }

    const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;

    const order = await Order.create({
      orderNumber,
      items: orderItems,
      totalPrice,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address?.trim() || '',
      comment: comment?.trim() || '',
    });

    const itemsText = orderItems.map((i) => `• ${i.name} × ${i.quantity} — ${(i.price * i.quantity).toLocaleString()} so'm`).join('\n');
    const message = [
      `🛒 <b>Yangi buyurtma #${order.orderNumber}</b>`,
      '',
      itemsText,
      '',
      `💰 <b>Jami:</b> ${totalPrice.toLocaleString()} so'm`,
      '',
      `👤 <b>Mijoz:</b> ${order.customerName}`,
      `📞 <b>Telefon:</b> ${order.phone}`,
      order.address ? `📍 <b>Manzil:</b> ${order.address}` : null,
      order.comment ? `💬 <b>Izoh:</b> ${order.comment}` : null,
    ].filter(Boolean).join('\n');
    sendTelegramMessage(message);

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUS_LABELS[status]) return res.status(400).json({ message: "Noto'g'ri holat" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Buyurtma topilmadi' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Buyurtma topilmadi' });
    res.json({ message: "O'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
