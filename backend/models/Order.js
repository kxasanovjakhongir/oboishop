const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  wallpaper: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallpaper' },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
  totalPrice: { type: Number, required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: '' },
  comment: { type: String, default: '' },
  status: { type: String, enum: ['new', 'confirmed', 'delivered', 'cancelled'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
