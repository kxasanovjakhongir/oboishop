const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  year: { type: String, required: true },
  text: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);
