import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';
import Stars from './Stars';
import Lightbox from './Lightbox';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
const NEW_THRESHOLD_DAYS = 14;

export default function WallpaperCard({ wallpaper }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, cart, addToCart } = useStore();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Lazy initializer — the one React-sanctioned way to read Date.now() in a
  // component without violating the render-purity rule (it runs once, not
  // on every render), since "is this new" doesn't need to update live.
  const [mountedAt] = useState(() => Date.now());
  const inCart = cart.some((i) => i.wallpaper._id === wallpaper._id);
  const liked = favorites.includes(wallpaper._id);
  const image = wallpaper.images?.[0] ? `${API}${wallpaper.images[0]}` : null;
  const discounted = wallpaper.discount > 0;
  const finalPrice = discounted
    ? Math.round(wallpaper.price * (1 - wallpaper.discount / 100))
    : wallpaper.price;
  const isNew = wallpaper.createdAt &&
    (mountedAt - new Date(wallpaper.createdAt).getTime()) < NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  const specs = [
    wallpaper.material && [t('product.specs.material'), wallpaper.material],
    (wallpaper.width || wallpaper.length) && [t('product.size'), [wallpaper.width, wallpaper.length].filter(Boolean).join(' x ')],
    wallpaper.brand && [t('product.specs.brand'), wallpaper.brand],
  ].filter(Boolean);

  const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };

  const handleDownload = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image;
    a.download = wallpaper.name || 'oboy';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <Link
        to={`/product/${wallpaper._id}`}
        className="group bg-white dark:bg-stone-800 rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-700 hover:border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-700 flex-shrink-0">
          {image ? (
            <img src={image} alt={wallpaper.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800">
              <svg className="w-12 h-12 text-stone-300 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">
                {t('common.new')}
              </span>
            )}
            {discounted && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">
                -{wallpaper.discount}%
              </span>
            )}
            {wallpaper.featured && (
              <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">
                ⭐ {t('common.top')}
              </span>
            )}
          </div>

          {!wallpaper.stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-white text-stone-800 text-sm font-bold px-4 py-2 rounded-xl shadow">{t('common.outOfStock')}</span>
            </div>
          )}

          {/* Action buttons: like, zoom, download */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex flex-col gap-1.5">
            <button
              onClick={stop(() => toggleFavorite(wallpaper._id))}
              aria-label={t('header.favorites')}
              className={`w-11 h-11 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow transition-all active:scale-90 touch-manipulation ${
                liked ? 'bg-red-600 text-white' : 'bg-white/90 text-stone-500 hover:text-red-600'
              }`}
            >
              <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" />
              </svg>
            </button>
            {image && (
              <>
                <button
                  onClick={stop(() => setLightboxOpen(true))}
                  aria-label={t('common.zoom')}
                  className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-white/90 text-stone-500 hover:text-orange-600 flex items-center justify-center shadow transition-all active:scale-90 touch-manipulation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 7v6M7 10h6" />
                  </svg>
                </button>
                <button
                  onClick={stop(handleDownload)}
                  aria-label={t('common.download')}
                  className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-white/90 text-stone-500 hover:text-orange-600 flex items-center justify-center shadow transition-all active:scale-90 touch-manipulation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Specs + 3D view — always visible on mobile (no hover state to reveal
              it there), reverts to a hover-reveal overlay on desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-3">
            {specs.length > 0 && (
              <div className="hidden sm:block text-white text-xs space-y-0.5 mb-3">
                {specs.map(([label, value]) => (
                  <p key={label}><span className="text-white/60">/ {label}:</span> {value}</p>
                ))}
              </div>
            )}
            <button
              onClick={stop(() => navigate(`/3d-studio?wallpaper=${wallpaper._id}`))}
              className="pointer-events-auto w-full bg-orange-600 text-white text-xs font-bold py-2.5 sm:py-2 px-3 rounded-xl hover:bg-orange-500 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 touch-manipulation">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              {t('product.view3dShort')}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <p className="text-xs text-orange-500 font-semibold mb-1">/ {wallpaper.category?.name || t('common.category')}</p>
            <h3 className="font-bold text-stone-800 dark:text-white text-sm leading-snug line-clamp-2 mb-1.5">{wallpaper.name}</h3>
            {wallpaper.ratingCount > 0 && (
              <Stars average={wallpaper.ratingAverage} count={wallpaper.ratingCount} size="sm" />
            )}

            <div className="flex items-center justify-between mt-2.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${wallpaper.stock ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${wallpaper.stock ? 'bg-green-500' : 'bg-red-500'}`} />
                {wallpaper.stock ? t('common.inStock') : t('common.outOfStock')}
              </span>
              {wallpaper.sku && (
                <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 rounded-md px-1.5 py-0.5">
                  {wallpaper.sku}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
            <div>
              {discounted && (
                <p className="text-xs text-stone-400 dark:text-stone-500 line-through leading-none mb-1">
                  {wallpaper.price?.toLocaleString()} {t('common.sum')}
                </p>
              )}
              <p className="text-base font-bold text-orange-600 leading-none">
                {finalPrice?.toLocaleString()}{' '}
                <span className="text-xs font-normal text-stone-500 dark:text-stone-400">{t('common.sum')}</span>
              </p>
            </div>
            <button
              onClick={stop(() => !inCart && addToCart(wallpaper))}
              disabled={inCart || !wallpaper.stock}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:cursor-default ${
                inCart
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-200 hover:bg-orange-600 hover:text-white disabled:opacity-50 disabled:hover:bg-stone-100 disabled:hover:text-stone-600'
              }`}
            >
              {inCart ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t('common.inCart')}
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.887-4.706 2.283-7.184.075-.472-.298-.899-.776-.899H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {t('common.addToCart')}
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {lightboxOpen && image && (
        <Lightbox images={[image]} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
