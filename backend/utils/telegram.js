const sendTelegramMessage = async (text) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('Telegram bot sozlanmagan (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID yo\'q) — xabar yuborilmadi');
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('Telegram xabar yuborilmadi:', res.status, body);
    }
  } catch (err) {
    console.error('Telegram xabar yuborishda xato:', err.message);
  }
};

module.exports = { sendTelegramMessage };
