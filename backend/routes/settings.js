const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const { uploadSettings } = require('../middleware/upload');

const router = express.Router();

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

router.get('/', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', auth, uploadSettings.single('logo'), async (req, res) => {
  try {
    const {
      siteName, phone, telegramUsername, instagramUsername, email, address,
      workHoursWeekday, workHoursWeekend, statYears, statClients, statSamples,
      telegramBotToken, telegramChatIds,
    } = req.body;
    const settings = await getOrCreateSettings();
    Object.assign(settings, {
      siteName, phone, telegramUsername, instagramUsername, email, address,
      workHoursWeekday, workHoursWeekend, statYears, statClients, statSamples,
      telegramBotToken,
    });
    // Admin enters one chat ID per line (or comma-separated) in a textarea —
    // split it into the array the bot notifier iterates over.
    if (typeof telegramChatIds === 'string') {
      settings.telegramChatIds = telegramChatIds.split(/[\n,]+/).map((id) => id.trim()).filter(Boolean);
    }
    if (req.file) settings.logo = `/uploads/images/${req.file.filename}`;
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
