import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWallpapers, getCategories } from '../api';
import WallpaperCard from '../components/ui/WallpaperCard';
import SEO from '../components/ui/SEO';

function FilterPanel({ t, activeCount, resetFilters, filters, setFilter, categories, colors }) {
  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 dark:text-white">{t('catalog.filters')}</h3>
        {activeCount > 0 && (
          <button onClick={resetFilters} className="text-xs text-orange-600 hover:underline">
            {t('catalog.clear', { count: activeCount })}
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide block mb-2">{t('catalog.searchLabel')}</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder={t('catalog.searchPlaceholder')}
          className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide block mb-2">{t('catalog.categoryLabel')}</label>
        <div className="space-y-1.5">
          <button
            onClick={() => setFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-medium' : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'}`}
          >
            {t('catalog.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setFilter('category', cat._id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat._id ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-medium' : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide block mb-2">{t('catalog.priceLabel')}</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilter('minPrice', e.target.value)}
            placeholder={t('catalog.min')}
            className="w-1/2 border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', e.target.value)}
            placeholder={t('catalog.max')}
            className="w-1/2 border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide block mb-2">{t('catalog.colorLabel')}</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setFilter('color', filters.color === color ? '' : color)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                filters.color === color
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide block mb-2">{t('catalog.brandLabel')}</label>
        <input
          type="text"
          value={filters.brand}
          onChange={(e) => setFilter('brand', e.target.value)}
          placeholder={t('catalog.brandPlaceholder')}
          className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
    </aside>
  );
}

export default function Catalog() {
  const { t } = useTranslation();
  const COLORS = t('catalog.colors', { returnObjects: true });
  const SORT_OPTIONS = [
    { value: 'newest', label: t('catalog.sort.newest') },
    { value: 'popular', label: t('catalog.sort.popular') },
    { value: 'price_asc', label: t('catalog.sort.priceAsc') },
    { value: 'price_desc', label: t('catalog.sort.priceDesc') },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallpapers, setWallpapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    color: searchParams.get('color') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
  }, []);

  const fetchWallpapers = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    getWallpapers(params)
      .then((res) => setWallpapers(res.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    // fetchWallpapers sets loading=true synchronously before its async
    // fetch — intentional, so the skeleton grid reappears immediately when
    // filters change (not just on first mount). react-hooks/set-state-in-effect
    // flags this shape generically; here it's a normal refetch-on-deps-change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWallpapers();
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    setSearchParams(params, { replace: true });
  }, [filters, fetchWallpapers, setSearchParams]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const resetFilters = () => setFilters({ category: '', color: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest', search: '' });

  const activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  return (
    <div className="section py-8">
      <SEO
        title={t('common.nav.catalog')}
        description="Turli uslub, rang va materialda 1000+ oboy namunasi. Filtr va qidiruv orqali o'zingizga mos oboyni toping."
        path="/catalog"
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-white">{t('catalog.title')}</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">{t('catalog.resultsCount', { count: wallpapers.length })}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 border border-stone-200 dark:border-stone-700 dark:text-stone-200 rounded-xl px-3 py-2 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('catalog.filterButton')} {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <FilterPanel t={t} activeCount={activeCount} resetFilters={resetFilters} filters={filters} setFilter={setFilter} categories={categories} colors={COLORS} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-white dark:bg-stone-900 w-72 h-full overflow-y-auto p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-stone-800 dark:text-white">{t('catalog.filters')}</h3>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FilterPanel t={t} activeCount={activeCount} resetFilters={resetFilters} filters={filters} setFilter={setFilter} categories={categories} colors={COLORS} />
              <button onClick={() => setSidebarOpen(false)} className="btn-primary w-full mt-6">
                {t('catalog.viewResults')}
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[3/4] bg-stone-200 dark:bg-stone-700 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                    <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : wallpapers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {wallpapers.map((w) => <WallpaperCard key={w._id} wallpaper={w} />)}
            </div>
          ) : (
            <div className="text-center py-24 text-stone-400 dark:text-stone-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-stone-300 dark:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">{t('catalog.noResultsTitle')}</p>
              <p className="text-sm mt-1">{t('catalog.noResultsHint')}</p>
              <button onClick={resetFilters} className="btn-primary mt-4">{t('catalog.clearFilters')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
