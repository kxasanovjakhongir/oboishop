import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSettings } from '../../api';
import SiteRatingWidget from '../ui/SiteRatingWidget';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const DEFAULT_SETTINGS = {
  phone: '+998 90 123 45 67',
  telegramUsername: 'wallpaperstudio',
  instagramUsername: 'wallpaperstudio',
  address: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi 108",
  workHoursWeekday: 'Du-Shan: 9:00 - 19:00',
  workHoursWeekend: 'Yak: 10:00 - 17:00',
  siteName: 'Wallpaper Studio',
  logo: '',
};

export default function Footer() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    getSettings().then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const telHref = `tel:${settings.phone?.replace(/[^+\d]/g, '')}`;

  const FOOTER_LINKS = [
    ['/', t('footer.links.home')],
    ['/catalog', t('footer.links.catalog')],
    ['/room', t('footer.links.studio')],
    ['/calculator', t('footer.links.calculator')],
    ['/about', t('footer.links.about')],
    ['/contact', t('footer.links.contact')],
  ];

  return (
    <footer className="bg-orange-950 text-stone-300">
      <div className="section py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {settings.logo ? (
                <img src={`${API}${settings.logo}`} alt={settings.siteName} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {settings.siteName?.[0] || 'W'}
                </div>
              )}
              <span className="text-xl font-bold text-white">{settings.siteName}</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-3">
              <a href={`https://t.me/${settings.telegramUsername}`} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center hover:bg-sky-600 transition-colors">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
                </svg>
              </a>
              <a href={`https://instagram.com/${settings.instagramUsername}`} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.pagesTitle')}</h3>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-orange-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contactTitle')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={telHref} className="hover:text-orange-400 transition-colors">{settings.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{settings.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{settings.workHoursWeekday}<br />{settings.workHoursWeekend}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-900 mt-10 pt-6 flex justify-center sm:justify-start">
          <SiteRatingWidget />
        </div>

        <div className="border-t border-orange-900 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-500">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. {t('footer.rights')}</p>
          <p>{t('footer.poweredBy')}</p>
        </div>
      </div>
    </footer>
  );
}
