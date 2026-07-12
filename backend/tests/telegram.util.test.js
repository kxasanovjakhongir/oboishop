const db = require('./setup');
const Settings = require('../models/Settings');
const { sendTelegramMessage } = require('../utils/telegram');

describe('sendTelegramMessage', () => {
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalChatId = process.env.TELEGRAM_CHAT_ID;
  const originalFetch = global.fetch;

  beforeAll(async () => db.connect());
  afterEach(async () => {
    await Settings.deleteMany({});
    process.env.TELEGRAM_BOT_TOKEN = originalToken;
    process.env.TELEGRAM_CHAT_ID = originalChatId;
    global.fetch = originalFetch;
  });
  afterAll(async () => db.closeDatabase());

  it('no-ops without throwing when nothing is configured', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    global.fetch = jest.fn();

    await expect(sendTelegramMessage('salom')).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('falls back to env vars when no Settings document overrides them', async () => {
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

  it('uses the DB-stored token and sends to every configured chat id, overriding env vars', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'env-token';
    process.env.TELEGRAM_CHAT_ID = 'env-chat';
    await Settings.create({ telegramBotToken: 'db-token', telegramChatIds: ['111', '222', '333'] });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    await sendTelegramMessage('Yangi buyurtma');

    expect(global.fetch).toHaveBeenCalledTimes(3);
    global.fetch.mock.calls.forEach(([url]) => {
      expect(url).toBe('https://api.telegram.org/botdb-token/sendMessage');
    });
    const chatIdsSent = global.fetch.mock.calls.map(([, opts]) => JSON.parse(opts.body).chat_id).sort();
    expect(chatIdsSent).toEqual(['111', '222', '333']);
  });

  it('does not throw when the Telegram API errors for one of several recipients', async () => {
    await Settings.create({ telegramBotToken: 'test-token', telegramChatIds: ['12345', '67890'] });
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 400, text: async () => 'Bad Request' })
      .mockResolvedValueOnce({ ok: true });

    await expect(sendTelegramMessage('salom')).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
