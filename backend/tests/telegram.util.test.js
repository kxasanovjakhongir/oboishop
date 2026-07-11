const { sendTelegramMessage } = require('../utils/telegram');

describe('sendTelegramMessage', () => {
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalChatId = process.env.TELEGRAM_CHAT_ID;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = originalToken;
    process.env.TELEGRAM_CHAT_ID = originalChatId;
    global.fetch = originalFetch;
  });

  it('no-ops without throwing when the bot is not configured', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    global.fetch = jest.fn();

    await expect(sendTelegramMessage('salom')).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('posts to the Telegram Bot API when configured', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = '12345';
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    await sendTelegramMessage('Yangi buyurtma');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-token/sendMessage',
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).toEqual({ chat_id: '12345', text: 'Yangi buyurtma', parse_mode: 'HTML' });
  });

  it('does not throw when the Telegram API responds with an error', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = '12345';
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, text: async () => 'Bad Request' });

    await expect(sendTelegramMessage('salom')).resolves.toBeUndefined();
  });
});
