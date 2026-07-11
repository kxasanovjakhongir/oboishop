import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createContact, getSettings } from '../api';
import SEO from '../components/ui/SEO';
import { formatUzPhone } from '../utils/phone';

const DEFAULT_SETTINGS = {
  phone: '+998 90 123 45 67',
  telegramUsername: 'wallpaperstudio',
  instagramUsername: 'wallpaperstudio',
  email: 'info@wallpaperstudio.uz',
  address: "Yunusobod tumani, Amir Temur 108",
  workHoursWeekday: 'Du–Shan: 9:00–19:00',
  workHoursWeekend: 'Yak: 10:00–17:00',
};

export default function Contact() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSettings().then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const telHref = `tel:${settings.phone?.replace(/[^+\d]/g, '')}`;

  const CONTACTS = [
    { icon: '📞', label: t('contact.labels.phone'), value: settings.phone, href: telHref, color: 'bg-green-50 text-green-600' },
    { icon: '✈️', label: t('contact.labels.telegram'), value: `@${settings.telegramUsername}`, href: `https://t.me/${settings.telegramUsername}`, color: 'bg-sky-50 text-sky-600' },
    { icon: '📸', label: t('contact.labels.instagram'), value: `@${settings.instagramUsername}`, href: `https://instagram.com/${settings.instagramUsername}`, color: 'bg-pink-50 text-pink-600' },
    { icon: '📧', label: t('contact.labels.email'), value: settings.email, href: `mailto:${settings.email}`, color: 'bg-orange-50 text-orange-600' },
    { icon: '📍', label: t('contact.labels.address'), value: settings.address, href: null, color: 'bg-red-50 text-red-600' },
    { icon: '🕐', label: t('contact.labels.hours'), value: `${settings.workHoursWeekday}, ${settings.workHoursWeekend}`, href: null, color: 'bg-purple-50 text-purple-600' },
  ];

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createContact(form);
      setSuccess(true);
      setForm({ name: '', phone: '', message: '' });
    } catch {
      setError(t('contact.sendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      <SEO
        title={t('common.nav.contact')}
        description={`Biz bilan bog'laning: ${settings.phone}, Telegram, yoki manzilimizga tashrif buyuring — ${settings.address}.`}
        path="/contact"
      />
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-950 to-orange-800 text-white py-16">
        <div className="section text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-3">
            {t('contact.badge')}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl font-bold mb-3">
            {t('contact.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-stone-400 text-lg">
            {t('contact.subtitle')}
          </motion.p>
        </div>
      </section>

      <div className="section py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ── Contact info ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm">
              <h2 className="font-bold text-stone-800 dark:text-white text-lg mb-5">{t('contact.infoTitle')}</h2>
              <div className="space-y-3">
                {CONTACTS.map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${c.color}`}>
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-medium leading-none mb-1">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-orange-600 transition-colors">
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <a href={`https://t.me/${settings.telegramUsername}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-4 rounded-2xl transition-colors w-full shadow-lg shadow-sky-100">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
              </svg>
              {t('contact.telegramWrite')}
            </a>

            <a href={telHref}
              className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-4 rounded-2xl transition-colors w-full shadow-lg shadow-green-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('common.call')}
            </a>
          </div>

          {/* ── Form ── */}
          <div className="lg:col-span-3 bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm">
            <h2 className="font-bold text-stone-800 dark:text-white text-lg mb-6">{t('contact.formTitle')}</h2>

            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
                <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">{t('contact.successTitle')}</h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6">{t('contact.successText')}</p>
                <button onClick={() => setSuccess(false)}
                  className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors">
                  {t('contact.sendAnother')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200 mb-2">{t('contact.nameLabel')}</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      autoComplete="name"
                      placeholder={t('contact.namePlaceholder')}
                      className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-stone-50 dark:bg-stone-800 dark:text-white focus:bg-white dark:focus:bg-stone-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200 mb-2">{t('contact.phoneLabel')}</label>
                    <input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: formatUzPhone(e.target.value) }))} required
                      placeholder="+998 90 123 45 67"
                      className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-stone-50 dark:bg-stone-800 dark:text-white focus:bg-white dark:focus:bg-stone-800" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200 mb-2">{t('contact.messageLabel')}</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required
                    rows={6} placeholder={t('contact.messagePlaceholder')}
                    className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none bg-stone-50 dark:bg-stone-800 dark:text-white focus:bg-white dark:focus:bg-stone-800" />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-100 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('contact.sending')}
                    </>
                  ) : t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
