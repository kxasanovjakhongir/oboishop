import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSettings, getFeatures, getHistory } from '../api';
import SEO from '../components/ui/SEO';

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

function Section({ children, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

const DEFAULT_SETTINGS = { statYears: '10+', statClients: '5000+', statSamples: '1000+' };

export default function About() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [features, setFeatures] = useState([]);
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    getSettings().then((r) => setSettings(r.data)).catch(() => {});
    getFeatures().then((r) => setFeatures(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    // Admin-managed history overrides the translation fallback once it
    // loads — kept as the initial value so the section never flashes empty.
    getHistory().then((r) => { if (Array.isArray(r.data) && r.data.length) setTimeline(r.data); }).catch(() => {});
  }, []);

  const STATS = [
    { num: settings.statYears, label: t('about.stats.years'), icon: '🏆' },
    { num: settings.statClients, label: t('about.stats.clients'), icon: '😊' },
    { num: settings.statSamples, label: t('about.stats.samples'), icon: '🎨' },
    { num: '50+', label: t('about.stats.brands'), icon: '💎' },
  ];
  const TIMELINE = timeline || t('about.timeline', { returnObjects: true });

  return (
    <main className="bg-white dark:bg-stone-950">
      <SEO
        title={t('common.nav.about')}
        description="OboiShop haqida: tajribamiz, mijozlarimiz va 3D vizualizatsiya texnologiyasi bilan ishlash tartibimiz."
        path="/about"
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-950 to-orange-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl" />
        <div className="section relative text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-4">
            {t('about.badge')}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-6">
            {t('about.title1')} <br className="hidden sm:block" />
            <span className="text-orange-400">{t('about.titleHighlight')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-stone-300 text-lg max-w-2xl mx-auto">
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b border-stone-100 dark:border-stone-800">
        <div className="section">
          <Section className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fade}
                className="text-center p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <p className="text-3xl font-bold text-orange-600 mb-1">{s.num}</p>
                <p className="text-stone-500 dark:text-stone-400 text-sm">{s.label}</p>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Section>
              <motion.p variants={fade} className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-3">
                {t('about.storyLabel')}
              </motion.p>
              <motion.h2 variants={fade} className="text-3xl font-bold text-stone-800 dark:text-white mb-6">
                {t('about.storyTitle')}
              </motion.h2>
              <div className="space-y-4 text-stone-600 dark:text-stone-300 leading-relaxed">
                <motion.p variants={fade}>
                  {t('about.storyP1')}
                </motion.p>
                <motion.p variants={fade}>
                  {t('about.storyP2')}
                </motion.p>
                <motion.p variants={fade}>
                  {t('about.storyP3')}
                </motion.p>
              </div>
              <motion.div variants={fade} className="mt-8">
                <Link to="/3d-studio"
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">
                  {t('about.tryStudio')}
                </Link>
              </motion.div>
            </Section>

            {/* Timeline */}
            <Section className="space-y-0">
              {TIMELINE.map((item, i) => (
                <motion.div key={item._id || item.year} variants={fade}
                  className="flex gap-4 pb-8 last:pb-0 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 z-10">
                      {item.year.slice(2)}
                    </div>
                    {i < TIMELINE.length - 1 && <div className="w-0.5 flex-1 bg-orange-100 mt-1" />}
                  </div>
                  <div className="pt-2 pb-4">
                    <p className="text-sm font-bold text-orange-600 mb-1">{item.year}</p>
                    <p className="text-stone-600 dark:text-stone-300 text-sm">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </Section>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900">
        <div className="section">
          <Section>
            <motion.div variants={fade} className="text-center mb-12">
              <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">{t('about.featuresLabel')}</p>
              <h2 className="text-3xl font-bold text-stone-800 dark:text-white">{t('about.featuresTitle')}</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <motion.div key={f._id} variants={fade}
                  className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-stone-100 dark:border-stone-700 hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-stone-700 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-stone-800 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-red-600">
        <div className="section text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t('about.ctaTitle')}</h2>
          <p className="text-red-100 mb-8">{t('about.ctaText')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-600 font-bold px-8 py-4 rounded-2xl hover:bg-red-50 transition-colors">
              {t('about.viewCatalog')}
            </Link>
            <Link to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white border border-white/30 font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors">
              {t('about.contact')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
