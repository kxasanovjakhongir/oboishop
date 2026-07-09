import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getWallpapers } from '../api';

const DEFAULT_ROLL = { width: 0.53, length: 10 };

const WASTE_FACTOR = 1.1; // rapport moslash va kesish uchun ~10% zaxira

const num = (v) => Math.max(0, parseFloat(v) || 0);
const fmt = (n, locale) => (Math.round(n * 100) / 100).toLocaleString(locale);

function OpeningRows({ title, items, setItems, emptyLabel, widthPlaceholder, heightPlaceholder, addLabel }) {
  const update = (i, key, value) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  };
  const add = () => setItems((prev) => [...prev, { width: '', height: '' }]);
  const remove = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-stone-700 dark:text-stone-200">{title}</label>
        <button type="button" onClick={add} className="text-xs font-semibold text-orange-600 hover:underline">
          + {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-stone-400">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="number" min="0" step="0.01" value={it.width}
                onChange={(e) => update(i, 'width', e.target.value)}
                placeholder={widthPlaceholder}
                className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="number" min="0" step="0.01" value={it.height}
                onChange={(e) => update(i, 'height', e.target.value)}
                placeholder={heightPlaceholder}
                className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button type="button" onClick={() => remove(i)}
                className="flex-shrink-0 w-9 h-9 rounded-xl text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Calculator() {
  const { t, i18n } = useTranslation();
  const [length, setLength] = useState('4');
  const [width, setWidth] = useState('3');
  const [height, setHeight] = useState('2.7');
  const [doors, setDoors] = useState([{ width: '0.9', height: '2.1' }]);
  const [windows, setWindows] = useState([{ width: '1.3', height: '1.4' }]);
  const [wallpapers, setWallpapers] = useState([]);
  const [selectedId, setSelectedId] = useState('default');

  useEffect(() => {
    getWallpapers().then((r) => setWallpapers(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const selected = wallpapers.find((w) => w._id === selectedId);
  const roll = selected ? { width: num(selected.width), length: num(selected.length) } : DEFAULT_ROLL;
  const grossArea = 2 * (num(length) + num(width)) * num(height);
  const doorsArea = doors.reduce((sum, d) => sum + num(d.width) * num(d.height), 0);
  const windowsArea = windows.reduce((sum, d) => sum + num(d.width) * num(d.height), 0);
  const openingsArea = doorsArea + windowsArea;
  const netArea = Math.max(0, grossArea - openingsArea);
  const rollArea = roll.width * roll.length;
  const rollsNeeded = rollArea > 0 && netArea > 0 ? Math.ceil((netArea * WASTE_FACTOR) / rollArea) : 0;
  const estimatedCost = selected ? rollsNeeded * selected.price : null;

  return (
    <main className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-950 to-orange-800 text-white py-16">
        <div className="section text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-3">
            {t('calculator.title')}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl font-bold mb-3">
            {t('calculator.heroTitle')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-stone-400 text-lg max-w-xl mx-auto">
            {t('calculator.heroSubtitle')}
          </motion.p>
        </div>
      </section>

      <div className="section py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* ── Form ── */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm">
              <h2 className="font-bold text-stone-800 dark:text-white text-lg mb-5">{t('calculator.roomDims')}</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">{t('calculator.length')}</label>
                  <input type="number" min="0" step="0.01" value={length} onChange={(e) => setLength(e.target.value)}
                    className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">{t('calculator.width')}</label>
                  <input type="number" min="0" step="0.01" value={width} onChange={(e) => setWidth(e.target.value)}
                    className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">{t('calculator.height')}</label>
                  <input type="number" min="0" step="0.01" value={height} onChange={(e) => setHeight(e.target.value)}
                    className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm">
              <h2 className="font-bold text-stone-800 dark:text-white text-lg mb-5">{t('calculator.doorsWindows')}</h2>
              <div className="space-y-6">
                <OpeningRows title={t('calculator.doors')} items={doors} setItems={setDoors}
                  emptyLabel={t('calculator.noneDoor')} widthPlaceholder={t('calculator.doorPlaceholderW')}
                  heightPlaceholder={t('calculator.doorPlaceholderH')} addLabel={t('calculator.add')} />
                <OpeningRows title={t('calculator.windows')} items={windows} setItems={setWindows}
                  emptyLabel={t('calculator.noneWindow')} widthPlaceholder={t('calculator.doorPlaceholderW')}
                  heightPlaceholder={t('calculator.doorPlaceholderH')} addLabel={t('calculator.add')} />
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-4">
                {t('calculator.openingsHint')}
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm">
              <h2 className="font-bold text-stone-800 dark:text-white text-lg mb-2">{t('calculator.selectWallpaper')}</h2>
              <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">
                {t('calculator.selectHint')}
              </p>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="default">{t('calculator.standard')}</option>
                {wallpapers.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} — {num(w.width)}x{num(w.length)} m ({w.price?.toLocaleString()} {t('common.sum')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Result ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm space-y-4">
              <h2 className="font-bold text-stone-800 dark:text-white text-lg">{t('calculator.result')}</h2>

              <div className="flex items-center justify-between text-sm py-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400">{t('calculator.grossArea')}</span>
                <span className="font-semibold text-stone-800">{fmt(grossArea, i18n.language)} m²</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400">{t('calculator.openingsArea')}</span>
                <span className="font-semibold text-red-500">− {fmt(openingsArea, i18n.language)} m²</span>
              </div>

              <div className="bg-orange-50 rounded-2xl p-5 text-center">
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">{t('calculator.neededArea')}</p>
                <p className="text-4xl font-bold text-orange-600">{fmt(netArea, i18n.language)} <span className="text-lg">m²</span></p>
              </div>

              <div className="bg-orange-950 rounded-2xl p-5 text-center text-white">
                <p className="text-xs font-semibold text-stone-300 uppercase tracking-wide mb-1">{t('calculator.estimatedRolls')}</p>
                <p className="text-4xl font-bold">{rollsNeeded} <span className="text-lg font-normal text-stone-400">{t('common.piece')}</span></p>
                <p className="text-xs text-stone-400 mt-1">
                  {t('calculator.wasteNote', { name: selected ? selected.name : t('calculator.standard'), width: roll.width, length: roll.length })}
                </p>
              </div>

              {estimatedCost !== null && (
                <div className="flex items-center justify-between text-sm py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400">{t('calculator.estimatedCost', { name: selected.name })}</span>
                  <span className="font-bold text-orange-600">{estimatedCost.toLocaleString()} {t('common.sum')}</span>
                </div>
              )}

              <p className="text-xs text-stone-400 dark:text-stone-500 leading-relaxed">
                {t('calculator.disclaimer')}
              </p>

              <Link to="/contact" className="btn-primary w-full text-center block">
                {t('calculator.contactExpert')}
              </Link>
              <Link to="/catalog" className="btn-secondary w-full text-center block">
                {t('calculator.chooseWallpaper')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
