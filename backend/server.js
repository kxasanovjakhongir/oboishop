require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const seedAdmin = async () => {
  const Admin = require('./models/Admin');
  const exists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (!exists) {
    await Admin.create({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
    logger.info('Admin yaratildi:', process.env.ADMIN_USERNAME);
  }
};

const seedFeatures = async () => {
  const Feature = require('./models/Feature');
  const count = await Feature.countDocuments();
  if (count === 0) {
    await Feature.insertMany([
      { icon: '🎨', title: 'Keng assortiment', description: 'Turli uslub, rang va materialda 1000+ namuna', order: 0 },
      { icon: '🏠', title: '3D Vizualizatsiya', description: "7 ta virtual xonada real ko'rinishini ko'ring", order: 1 },
      { icon: '🚚', title: 'Tez yetkazish', description: "Toshkent bo'ylab 1-2 ish kuni ichida", order: 2 },
      { icon: '💎', title: 'Sifat kafolati', description: 'Barcha mahsulotlar sertifikatlangan va kafolatlangan', order: 3 },
      { icon: '🤝', title: 'Bepul maslahat', description: 'Mutaxassis dizaynerlardan maslahat oling', order: 4 },
      { icon: '🔄', title: 'Qulay qaytarish', description: '14 kun ichida qaytarish imkoniyati', order: 5 },
    ]);
    logger.info('Afzalliklar (features) seed qilindi');
  }
};

const seedHistory = async () => {
  const History = require('./models/History');
  const count = await History.countDocuments();
  if (count === 0) {
    await History.insertMany([
      { year: '2014', text: "Toshkentda kichik oboy do'koni sifatida faoliyat boshlandi", order: 0 },
      { year: '2017', text: 'Assortiment 500+ namunaga yetdi, 2 ta yangi filial ochildi', order: 1 },
      { year: '2020', text: 'Online savdo platformasi ishga tushirildi', order: 2 },
      { year: '2023', text: '3D Virtual Studio texnologiyasi joriy qilindi', order: 3 },
      { year: '2024', text: "5000+ baxtli mijoz va 1000+ oboy namunasi", order: 4 },
    ]);
    logger.info('Tarix (history) seed qilindi');
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    logger.info('MongoDB ulandi');
    await seedAdmin();
    await seedFeatures();
    await seedHistory();
    app.listen(process.env.PORT, () => {
      logger.info(`Server http://localhost:${process.env.PORT} da ishlamoqda (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => logger.error(err, { phase: 'mongodb-connect' }));

process.on('unhandledRejection', (err) => logger.error(err, { phase: 'unhandledRejection' }));
process.on('uncaughtException', (err) => logger.error(err, { phase: 'uncaughtException' }));
