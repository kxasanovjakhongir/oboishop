import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';
import { getSettings } from '../../api';

const LANGS = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
const DEFAULT_SETTINGS = { phone: '+998 90 123 45 67', telegramUsername: 'wallpaperstudio', siteName: 'Wallpaper Studio', logo: '' };

export default function Header() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const { isDark, toggleDark, favorites, cart } = useStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const NAV_LINKS = [
    { to: '/', label: t('common.nav.home') },
    { to: '/3d-studio', label: t('common.nav.studio') },
    { to: '/catalog', label: t('common.nav.catalog') },
    { to: '/calculator', label: t('common.nav.calculator') },
    { to: '/about', label: t('common.nav.about') },
    { to: '/contact', label: t('common.nav.contact') },
  ];

  useEffect(() => {
    getSettings().then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const telHref = `tel:${settings.phone?.replace(/[^+\d]/g, '')}`;

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      // Hide the sticky header on scroll-down, reveal it again on scroll-up
      // — only past 80px so it doesn't flicker right at the top, and never
      // while the mobile menu is open (would hide the panel's own trigger).
      if (!open) setHidden(y > lastScrollY.current && y > 80);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white dark:bg-stone-900 shadow-md' : 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm'} ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="section">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            {settings.logo ? (
              <img src={`${API}${settings.logo}`} alt={settings.siteName} className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:bg-orange-700 transition-colors">
                {settings.siteName?.[0] || 'W'}
              </div>
            )}
            <span className="text-xl font-bold text-stone-800 dark:text-white hidden sm:block whitespace-nowrap">
              {settings.siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Search + Contacts */}
          <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
            <form onSubmit={handleSearch} className="hidden xl:flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('header.searchPlaceholder')}
                className="bg-transparent px-3 py-2 text-sm outline-none w-32 lg:w-40 text-stone-800 dark:text-white placeholder-stone-400"
              />
              <button type="submit" className="px-2.5 py-2 text-stone-500 dark:text-stone-400 hover:text-orange-600 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            <a href={telHref} title={settings.phone} aria-label={t('header.callAria', { phone: settings.phone })}
              className="hidden xl:flex items-center justify-center w-9 h-9 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-orange-600 transition-colors flex-shrink-0">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>

            <a href={`https://t.me/${settings.telegramUsername}`} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center w-9 h-9 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex-shrink-0" title="Telegram">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
              </svg>
            </a>

            {/* Language switcher */}
            <div className="hidden lg:flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 flex-shrink-0">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => i18n.changeLanguage(code)}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                    i18n.resolvedLanguage === code ? 'bg-orange-600 text-white' : 'text-stone-500 dark:text-stone-400 hover:text-orange-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Favorites */}
            <Link to="/favorites" className={`relative w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700 transition-colors flex-shrink-0 touch-manipulation ${favorites.length > 0 ? 'text-red-600' : 'text-stone-600 dark:text-stone-300'}`} title={t('header.favorites')}>
              <svg className="w-5 h-5" fill={favorites.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className={`relative w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700 transition-colors flex-shrink-0 touch-manipulation ${cartCount > 0 ? 'text-orange-600' : 'text-stone-600 dark:text-stone-300'}`} title={t('header.cart')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.887-4.706 2.283-7.184.075-.472-.298-.899-.776-.899H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700 transition-colors text-stone-600 dark:text-stone-300 flex-shrink-0 touch-manipulation"
              title={isDark ? t('header.lightMode') : t('header.darkMode')}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Burger */}
            <button onClick={() => setOpen(!open)} className="xl:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700 transition-colors flex-shrink-0 text-stone-600 dark:text-stone-300 touch-manipulation">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="xl:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="xl:hidden fixed inset-x-0 top-16 lg:top-20 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl"
            >
              <div className="section py-4 space-y-1 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <form onSubmit={handleSearch} className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden mb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('header.searchPlaceholder')}
                    className="bg-transparent px-4 py-3 text-sm outline-none flex-1 text-stone-800 dark:text-white placeholder-stone-400"
                  />
                  <button type="submit" className="px-3 w-12 h-12 flex items-center justify-center text-stone-500 dark:text-stone-400 touch-manipulation">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
                <div className="flex items-center gap-1.5 px-4 pb-3">
                  {LANGS.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => i18n.changeLanguage(code)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors touch-manipulation ${
                        i18n.resolvedLanguage === code ? 'bg-orange-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <a href={telHref} className="flex sm:hidden items-center gap-2 px-4 py-3.5 text-sm font-medium text-stone-600 dark:text-stone-300 touch-manipulation">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {settings.phone}
                </a>
                {NAV_LINKS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3.5 rounded-xl text-sm font-medium transition-colors touch-manipulation ${
                        isActive ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
