const Settings = require('../models/Settings');

const sendTelegramMessage = async (text) => {
  let botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  let chatIds = process.env.TELEGRAM_CHAT_ID ? [process.env.TELEGRAM_CHAT_ID] : [];

  // Admin-panel-configured token/recipients (Sozlamalar) take priority over
  // the .env fallback, which exists for deployments that never touch it.
  try {
    const settings = await Settings.findOne();
    if (settings?.telegramBotToken) botToken = settings.telegramBotToken;
    if (settings?.telegramChatIds?.length) chatIds = settings.telegramChatIds;
  } catch (err) {
    console.error('Telegram sozlamalarini bazadan o\'qishda xato:', err.message);
  }

  if (!botToken || chatIds.length === 0) {
    console.warn('Telegram bot sozlanmagan (token yoki chat ID yo\'q) — xabar yuborilmadi');
    return;
  }

  await Promise.all(chatIds.map(async (chatId) => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error('Telegram xabar yuborilmadi:', chatId, res.status, body);
      }
    } catch (err) {
      console.error('Telegram xabar yuborishda xato:', chatId, err.message);
    }
  }));
};

module.exports = { sendTelegramMessage };
