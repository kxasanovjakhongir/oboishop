import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getWallpapers, getDiscounted, getCategories, getSettings, getFeatures, getFeaturedSiteRatings } from '../api';
import WallpaperCard from '../components/ui/WallpaperCard';
import SEO, { SITE_URL, SITE_NAME } from '../components/ui/SEO';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const fade = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

function AnimSection({ children, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

const DEFAULT_SETTINGS = { phone: '+998 90 123 45 67', statYears: '10+', statClients: '5000+', statSamples: '1000+' };

const FEATURE_THEMES = [
  { grad: 'from-orange-400 to-amber-500', glow: 'bg-orange-400', hoverText: 'group-hover:text-orange-600 dark:group-hover:text-orange-400' },
  { grad: 'from-sky-400 to-blue-500', glow: 'bg-sky-400', hoverText: 'group-hover:text-sky-600 dark:group-hover:text-sky-400' },
  { grad: 'from-emerald-400 to-teal-500', glow: 'bg-emerald-400', hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' },
  { grad: 'from-fuchsia-400 to-purple-500', glow: 'bg-fuchsia-400', hoverText: 'group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400' },
  { grad: 'from-rose-400 to-pink-500', glow: 'bg-rose-400', hoverText: 'group-hover:text-rose-600 dark:group-hover:text-rose-400' },
  { grad: 'from-yellow-400 to-orange-500', glow: 'bg-yellow-400', hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400' },
];

export default function Home() {
  const { t } = useTranslation();
  const STATIC_TESTIMONIALS = t('home.testimonials', { returnObjects: true });
  const [wallpapers, setWallpapers] = useState([]);
  const [discounted, setDiscounted] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [features, setFeatures] = useState([]);
  const [siteTestimonials, setSiteTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWallpapers(), getDiscounted(), getCategories(), getSettings(), getFeatures(), getFeaturedSiteRatings()])
      .then(([f, d, c, s, ft, sr]) => {
        setWallpapers(Array.isArray(f.data) ? f.data : []);
        setDiscounted(Array.isArray(d.data) ? d.data : []);
        setCategories(Array.isArray(c.data) ? c.data : []);
        setSettings(s.data);
        setFeatures(Array.isArray(ft.data) ? ft.data : []);
        setSiteTestimonials(Array.isArray(sr.data) ? sr.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Real customer feedback (admin-featured) takes priority; static copy fills in until there's enough
  const TESTIMONIALS = siteTestimonials.length > 0
    ? siteTestimonials.map((r) => ({
        id: r._id,
        name: r.name || t('home.anonymousClient'),
        role: t('home.verifiedCustomer'),
        text: r.comment,
        stars: r.stars,
      }))
    : STATIC_TESTIMONIALS.map((x, i) => ({ id: i, stars: 5, ...x }));

  const testimonialCarousel = TESTIMONIALS.length > 3;
  const [tIndex, setTIndex] = useState(0);
  useEffect(() => {
    if (!testimonialCarousel) return;
    const id = setInterval(() => setTIndex((i) => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(id);
  }, [testimonialCarousel, TESTIMONIALS.length]);

  const visibleTestimonials = testimonialCarousel
    ? [0, 1, 2].map((off) => TESTIMONIALS[(tIndex + off) % TESTIMONIALS.length])
    : TESTIMONIALS;

  const telHref = `tel:${settings.phone?.replace(/[^+\d]/g, '')}`;
  const STATS = [
    { num: settings.statSamples, label: t('home.statSamples') },
    { num: settings.statClients, label: t('home.statClients') },
    { num: settings.statYears, label: t('home.statYears') },
    { num: '50+', label: t('home.statBrands') },
  ];

  // Rotating hero showcase — cycles through every wallpaper photo endlessly
  const heroImages = wallpapers.filter((w) => w.images?.[0]).map((w) => `${API}${w.images[0]}`);
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (heroImages.length < 2) return;
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(id);
  }, [heroImages.length]);

  const homeWallpapers = wallpapers.slice(0, 8);

  return (
    <main>
      <SEO
        path="/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.svg`,
          telephone: settings.phone,
          address: settings.address ? { '@type': 'PostalAddress', streetAddress: settings.address } : undefined,
        }}
      />
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-orange-950">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950 via-orange-700 to-orange-400" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-800/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="section relative z-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                {t('home.badge')}
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {t('home.heroTitlePrefix')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  {t('home.heroTitleHighlight')}
                </span>{' '}
                {t('home.heroTitleSuffix')}
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="text-stone-300 text-lg leading-relaxed mb-8">
                {t('home.heroSubtitle')}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4">
                <Link to="/catalog"
                  className="group inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/40 hover:-translate-y-0.5">
                  {t('home.browseCatalog')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link to="/3d-studio"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/20 transition-all hover:-translate-y-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  {t('home.openStudio')}
                </Link>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10">
                  {heroImages.length > 0 ? (
                    <AnimatePresence mode="sync">
                      <motion.img
                        key={heroImages[heroIdx]}
                        src={heroImages[heroIdx]}
                        alt="Oboy namunasi"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-600/20 backdrop-blur-sm" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-end justify-center pb-10">
                    <div className="text-center">
                      <p className="text-white text-lg font-medium">{t('home.heroCardTitle')}</p>
                      <p className="text-orange-300 text-sm mt-1">{t('home.heroCardSubtitle')}</p>
                    </div>
                  </div>
                </div>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">🎨</div>
                  <div>
                    <p className="text-xs text-stone-500">{t('home.samples')}</p>
                    <p className="text-lg font-bold text-stone-800">{settings.statSamples}</p>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">✅</div>
                  <div>
                    <p className="text-xs text-stone-500">{t('home.clients')}</p>
                    <p className="text-lg font-bold text-stone-800">{settings.statClients}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="section py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                  <p className="text-2xl font-bold text-orange-400">{s.num}</p>
                  <p className="text-stone-400 text-sm mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CATEGORIES ══════════ */}
      <section className="py-20">
        <div className="section">
          <AnimSection>
            <motion.div variants={fade} className="flex items-end justify-between mb-10">
              <div>
                <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">{t('home.categoriesLabel')}</p>
                <h2 className="text-3xl font-bold text-stone-800 dark:text-white">{t('home.categoriesTitle')}</h2>
              </div>
              <Link to="/catalog" className="text-orange-600 font-semibold text-sm hover:underline hidden sm:block">{t('common.viewAll')} →</Link>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {(categories.length > 0 ? categories : [
                { name: t('home.defaultCategories.classic'), icon: '🏛️' }, { name: t('home.defaultCategories.modern'), icon: '🔷' },
                { name: t('home.defaultCategories.minimal'), icon: '◻️' }, { name: t('home.defaultCategories.kids'), icon: '🌈' },
                { name: t('home.defaultCategories.kitchen'), icon: '🍳' }, { name: t('home.defaultCategories.premium'), icon: '✨' },
              ]).map((cat) => (
                <motion.div key={cat._id || cat.name} variants={fade}>
                  <Link to={`/catalog?category=${cat._id || cat.name}`}
                    className="group flex flex-col items-center gap-4 p-7 bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    {cat.image ? (
                      <img src={`${API}${cat.image}`} alt={cat.name} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-orange-50 dark:bg-stone-700 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {cat.icon || '🎨'}
                      </div>
                    )}
                    <span className="text-base font-semibold text-stone-700 dark:text-stone-200 group-hover:text-orange-600 transition-colors text-center">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ══════════ FEATURED ══════════ */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900">
        <div className="section">
          <AnimSection>
            <motion.div variants={fade} className="flex items-end justify-between mb-10">
              <div>
                <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">{t('home.wallpapersLabel')}</p>
                <h2 className="text-3xl font-bold text-stone-800 dark:text-white">{t('home.wallpapersTitle')}</h2>
              </div>
              <Link to="/catalog" className="text-orange-600 font-semibold text-sm hover:underline hidden sm:block">{t('common.viewAll')} →</Link>
            </motion.div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-stone-200 dark:bg-stone-700" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
                      <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                      <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : homeWallpapers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {homeWallpapers.map((w, i) => (
                  <motion.div key={w._id} variants={fade} transition={{ delay: i * 0.05 }}>
                    <WallpaperCard wallpaper={w} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-stone-400 dark:text-stone-500">
                <p className="text-5xl mb-4">🎨</p>
                <p className="text-lg font-medium">{t('home.noProducts')}</p>
                <p className="text-sm mt-1">{t('home.noProductsHint')}</p>
              </div>
            )}
          </AnimSection>
        </div>
      </section>

      {/* ══════════ 3D STUDIO CTA ══════════ */}
      <section className="py-20">
        <div className="section">
          <AnimSection>
            <motion.div variants={fade}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950 to-orange-800 text-white p-10 lg:p-16">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-amber-600/10 rounded-full blur-2xl" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm px-4 py-2 rounded-full mb-4">
                    {t('home.studioCtaBadge')}
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-3">{t('home.studioCtaTitle')}</h2>
                  <p className="text-stone-300 text-lg max-w-lg">
                    {t('home.studioCtaText')}
                  </p>
                  <div className="flex items-center gap-6 mt-5 justify-center lg:justify-start text-sm text-stone-400">
                    <span>✅ {t('home.studioCtaFeature1')}</span>
                    <span>✅ {t('home.studioCtaFeature2')}</span>
                    <span>✅ {t('home.studioCtaFeature3')}</span>
                  </div>
                </div>
                <Link to="/3d-studio"
                  className="flex-shrink-0 group bg-orange-600 hover:bg-orange-500 text-white font-bold px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-orange-900/50 hover:-translate-y-1 flex items-center gap-3 text-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  {t('home.studioCtaButton')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </AnimSection>
        </div>
      </section>

      {/* ══════════ WHY US ══════════ */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-orange-300/20 dark:bg-orange-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-300/20 dark:bg-sky-800/10 rounded-full blur-3xl" />
        <div className="section relative">
          <AnimSection>
            <motion.div variants={fade} className="text-center mb-12">
              <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">{t('home.whyUsLabel')}</p>
              <h2 className="text-3xl font-bold text-stone-800 dark:text-white">{t('home.whyUsTitle')}</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const theme = FEATURE_THEMES[i % FEATURE_THEMES.length];
                return (
                  <motion.div key={f._id} variants={fade} whileHover={{ y: -6 }}
                    className="relative overflow-hidden bg-white dark:bg-stone-800 rounded-2xl p-6 border border-stone-100 dark:border-stone-700 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${theme.glow} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.grad} flex items-center justify-center text-2xl mb-4 shadow-lg shadow-black/10 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}>
                      {f.icon}
                    </div>
                    <h3 className={`font-bold text-base mb-2 text-stone-800 dark:text-white ${theme.hoverText} transition-colors`}>{f.title}</h3>
                    <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{f.description}</p>
                    <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${theme.grad} transition-all duration-500`} />
                  </motion.div>
                );
              })}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ══════════ DISCOUNTED ══════════ */}
      {discounted.length > 0 && (
        <section className="py-20">
          <div className="section">
            <AnimSection>
              <motion.div variants={fade} className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-red-500 font-semibold text-sm uppercase tracking-wide mb-2">{t('home.discountsLabel')}</p>
                  <h2 className="text-3xl font-bold text-stone-800 dark:text-white">{t('home.discountsTitle')}</h2>
                </div>
                <Link to="/catalog?discount=true" className="text-orange-600 font-semibold text-sm hover:underline hidden sm:block">{t('common.viewAll')} →</Link>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {discounted.map((w, i) => (
                  <motion.div key={w._id} variants={fade} transition={{ delay: i * 0.05 }}>
                    <WallpaperCard wallpaper={w} />
                  </motion.div>
                ))}
              </div>
            </AnimSection>
          </div>
        </section>
      )}

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900">
        <div className="section">
          <AnimSection>
            <motion.div variants={fade} className="text-center mb-12">
              <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">{t('home.testimonialsLabel')}</p>
              <h2 className="text-3xl font-bold text-stone-800 dark:text-white">{t('home.testimonialsTitle')}</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {visibleTestimonials.map((tItem) => (
                  <motion.div
                    key={tItem.id}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-stone-100 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < (tItem.stars || 5) ? 'text-amber-400' : 'text-stone-200 dark:text-stone-600'}>★</span>
                      ))}
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-5 italic">"{tItem.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {tItem.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-white text-sm">{tItem.name}</p>
                        <p className="text-stone-400 dark:text-stone-500 text-xs">{tItem.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {testimonialCarousel && (
              <div className="flex justify-center gap-2 mt-8">
                {TESTIMONIALS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === tIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-stone-300 dark:bg-stone-600'}`}
                  />
                ))}
              </div>
            )}
          </AnimSection>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="py-16 bg-red-600">
        <div className="section text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t('home.finalCtaTitle')}</h2>
          <p className="text-red-100 mb-8 text-lg">{t('home.finalCtaText')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={telHref}
              className="inline-flex items-center justify-center gap-2 bg-white text-red-600 font-bold px-8 py-4 rounded-2xl hover:bg-red-50 transition-colors shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('common.call')}
            </a>
            <Link to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white border border-white/30 font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors">
              {t('home.sendMessage')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
