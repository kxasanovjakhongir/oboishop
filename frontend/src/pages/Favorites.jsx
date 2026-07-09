import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWallpapers } from '../api';
import WallpaperCard from '../components/ui/WallpaperCard';
import useStore from '../store/useStore';
import SEO from '../components/ui/SEO';

export default function Favorites() {
  const { t } = useTranslation();
  const { favorites } = useStore();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWallpapers()
      .then((res) => setWallpapers(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  const liked = wallpapers.filter((w) => favorites.includes(w._id));

  return (
    <div className="section py-8">
      <SEO noindex title={t('favorites.title')} path="/favorites" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-white">{t('favorites.title')}</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">
          {loading ? t('common.loading') : t('favorites.count', { count: liked.length })}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[3/4] bg-stone-200 dark:bg-stone-700 rounded-t-2xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : liked.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {liked.map((w) => <WallpaperCard key={w._id} wallpaper={w} />)}
        </div>
      ) : (
        <div className="text-center py-24 text-stone-400 dark:text-stone-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-stone-300 dark:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" />
          </svg>
          <p className="text-lg font-medium">{t('favorites.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('favorites.emptyHint')}</p>
          <Link to="/catalog" className="btn-primary mt-4 inline-block">{t('favorites.viewCatalog')}</Link>
        </div>
      )}
    </div>
  );
}
