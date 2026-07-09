const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Wallpaper Studio' },
  logo: { type: String, default: '' },
  phone: { type: String, default: '+998 90 123 45 67' },
  telegramUsername: { type: String, default: 'wallpaperstudio' },
  instagramUsername: { type: String, default: 'wallpaperstudio' },
  email: { type: String, default: 'info@wallpaperstudio.uz' },
  address: { type: String, default: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi 108" },
  workHoursWeekday: { type: String, default: 'Du-Shan: 9:00 - 19:00' },
  workHoursWeekend: { type: String, default: 'Yak: 10:00 - 17:00' },
  statYears: { type: String, default: '10+' },
  statClients: { type: String, default: '5000+' },
  statSamples: { type: String, default: '1000+' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
