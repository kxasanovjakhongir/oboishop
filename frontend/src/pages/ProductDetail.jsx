import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWallpaper, getSettings, getReviews, createReview } from '../api';
import Stars from '../components/ui/Stars';
import Lightbox from '../components/ui/Lightbox';
import useStore from '../store/useStore';
import SEO, { SITE_URL } from '../components/ui/SEO';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';

const DEFAULT_SETTINGS = { phone: '+998 90 123 45 67', telegramUsername: 'wallpaperstudio' };
const NEW_THRESHOLD_DAYS = 14;
const EMPTY_REVIEW = { name: '', stars: 5, comment: '' };

export default function ProductDetail() {
  const { t, i18n } = useTranslation();
  const SPEC_LABELS = {
    material: t('product.specs.material'),
    width: t('product.specs.width'),
    length: t('product.specs.length'),
    color: t('product.specs.color'),
    brand: t('product.specs.brand'),
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart } = useStore();
  const [wallpaper, setWallpaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [quantity, setQuantity] = useState(1);
  // Lazy initializer — reads Date.now() once at mount instead of on every
  // render, which is what React's render-purity rule requires.
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    getWallpaper(id)
      .then((res) => setWallpaper(res.data))
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    getSettings().then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    getReviews({ wallpaper: id }).then((r) => setReviews(r.data)).catch(() => {});
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await createReview({ wallpaper: id, ...reviewForm });
      const [reviewsRes, wallpaperRes] = await Promise.all([
        getReviews({ wallpaper: id }),
        getWallpaper(id),
      ]);
      setReviews(reviewsRes.data);
      setWallpaper(wallpaperRes.data);
      setReviewForm(EMPTY_REVIEW);
      setReviewSent(true);
    } finally {
      setSubmittingReview(false);
    }
  };

  const telHref = `tel:${settings.phone?.replace(/[^+\d]/g, '')}`;

  if (loading) return (
    <div className="section py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="space-y-3">
          <div className="aspect-[4/3] bg-stone-200 rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => <div key={i} className="w-20 h-20 bg-stone-200 rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <div className="h-5 bg-stone-200 rounded w-1/4" />
          <div className="h-8 bg-stone-200 rounded w-3/4" />
          <div className="h-4 bg-stone-200 rounded w-1/2" />
          <div className="h-10 bg-stone-200 rounded w-2/5 mt-4" />
        </div>
      </div>
    </div>
  );

  if (!wallpaper) return null;

  const discounted = wallpaper.discount > 0;
  const finalPrice = discounted
    ? Math.round(wallpaper.price * (1 - wallpaper.discount / 100))
    : wallpaper.price;
  const telegramText = encodeURIComponent(`${wallpaper.name} — ${finalPrice?.toLocaleString()} ${t('common.sum')}`);
  const isNew = wallpaper.createdAt &&
    (mountedAt - new Date(wallpaper.createdAt).getTime()) < NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  const galleryImages = (wallpaper.images || []).map((img) => `${API}${img}`);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <SEO
        title={wallpaper.name}
        description={wallpaper.description || `${wallpaper.name} — ${finalPrice?.toLocaleString()} ${t('common.sum')}. ${t('product.viewIn3d')}.`}
        image={galleryImages[0]}
        path={`/product/${wallpaper._id}`}
        type="product"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: wallpaper.name,
          description: wallpaper.description || undefined,
          image: galleryImages.length ? galleryImages : undefined,
          sku: wallpaper.sku || undefined,
          brand: wallpaper.brand ? { '@type': 'Brand', name: wallpaper.brand } : undefined,
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/product/${wallpaper._id}`,
            priceCurrency: 'UZS',
            price: finalPrice,
            availability: wallpaper.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          aggregateRating: wallpaper.ratingCount > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: wallpaper.ratingAverage,
            reviewCount: wallpaper.ratingCount,
          } : undefined,
        }}
      />
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
        <div className="section py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500">
            <Link to="/" className="hover:text-orange-600 transition-colors">{t('product.breadcrumbHome')}</Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-orange-600 transition-colors">{t('product.breadcrumbCatalog')}</Link>
            <span>/</span>
            <span className="text-stone-700 dark:text-stone-200 font-medium truncate max-w-[200px]">{wallpaper.name}</span>
          </nav>
        </div>
      </div>

      <div className="section py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Images ── */}
          <div className="space-y-3">
            <div
              className={`aspect-[4/3] rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-sm ${galleryImages.length ? 'cursor-zoom-in' : ''}`}
              onClick={() => galleryImages.length && setLightboxOpen(true)}
            >
              {wallpaper.images?.[activeImg] ? (
                <img src={`${API}${wallpaper.images[activeImg]}`} alt={wallpaper.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-50">
                  <svg className="w-20 h-20 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {wallpaper.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {wallpaper.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-orange-500 shadow-md shadow-orange-100' : 'border-stone-200 hover:border-stone-300'}`}>
                    <img src={`${API}${img}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm self-start">
            {/* Badge + title */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                    {wallpaper.category?.name || t('common.category')}
                  </span>
                  {isNew && (
                    <span className="inline-block bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('common.new')}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-white leading-snug">{wallpaper.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  {wallpaper.ratingCount > 0 && <Stars average={wallpaper.ratingAverage} count={wallpaper.ratingCount} size="md" />}
                  {wallpaper.sku && (
                    <span className="text-xs font-mono text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 rounded-md px-1.5 py-0.5">
                      {wallpaper.sku}
                    </span>
                  )}
                </div>
              </div>
              <span className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${wallpaper.stock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                ● {wallpaper.stock ? t('common.inStock') : t('common.outOfStock')}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6 pb-6 border-b border-stone-100 dark:border-stone-800">
              <div>
                {discounted && (
                  <p className="text-sm text-stone-400 dark:text-stone-500 line-through leading-none mb-1">
                    {wallpaper.price?.toLocaleString()} {t('common.sum')}
                  </p>
                )}
                <p className="text-3xl font-bold text-orange-600">
                  {finalPrice?.toLocaleString()}{' '}
                  <span className="text-base font-normal text-stone-400 dark:text-stone-500">{t('common.sum')}</span>
                </p>
              </div>
              {discounted && (
                <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-xl">
                  -{wallpaper.discount}% {t('common.discount')}
                </span>
              )}
            </div>

            {/* Specs */}
            <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 mb-6 space-y-2.5">
              {Object.entries(SPEC_LABELS).map(([key, label]) => wallpaper[key] ? (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-stone-500 dark:text-stone-400">{label}</span>
                  <span className="font-semibold text-stone-800 dark:text-white capitalize">{wallpaper[key]}</span>
                </div>
              ) : null)}
            </div>

            {/* Description */}
            {wallpaper.description && (
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-6">{wallpaper.description}</p>
            )}

            {/* Quantity + Add to cart */}
            {(() => {
              const inCart = cart.some((i) => i.wallpaper._id === wallpaper._id);
              return (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-12 flex items-center justify-center text-stone-500 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-lg font-bold"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-semibold text-stone-800 dark:text-white">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-12 flex items-center justify-center text-stone-500 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => (inCart ? navigate('/cart') : addToCart(wallpaper, quantity))}
                    disabled={!wallpaper.stock}
                    className={`flex-1 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      inCart
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shadow-none'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {t('common.inCart')} — {t('cart.title')}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.887-4.706 2.283-7.184.075-.472-.298-.899-.776-.899H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        {t('common.addToCart')}
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* CTA buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/3d-studio?wallpaper=${wallpaper._id}`)}
                className="w-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                {t('product.viewIn3d')}
              </button>
              <a href={`https://t.me/${settings.telegramUsername}?text=${telegramText}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
                </svg>
                {t('product.orderTelegram')}
              </a>
              <a href={telHref}
                className="w-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {settings.phone}
              </a>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-12 bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 dark:text-white">{t('product.reviewsTitle')}</h2>
            {wallpaper.ratingCount > 0 && <Stars average={wallpaper.ratingAverage} count={wallpaper.ratingCount} size="lg" />}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-stone-400 dark:text-stone-500 mb-8">{t('product.noReviews')}</p>
          ) : (
            <div className="space-y-5 mb-8">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-stone-100 dark:border-stone-800 pb-5 last:border-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-stone-800 dark:text-white text-sm">{r.name}</p>
                    <Stars average={r.stars} count={0} showCount={false} size="sm" />
                    <span className="text-xs text-stone-400">
                      {new Date(r.createdAt).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800 mt-2">
            <h3 className="font-semibold text-stone-700 dark:text-stone-200 text-sm">{t('product.leaveReview')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                required
                value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t('product.namePlaceholder')}
                className="border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setReviewForm((f) => ({ ...f, stars: n }))}
                    className={`text-2xl leading-none transition-colors ${n <= reviewForm.stars ? 'text-amber-400' : 'text-stone-200 dark:text-stone-700'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              rows={3}
              placeholder={t('product.commentPlaceholder')}
              className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {submittingReview ? t('product.submitting') : t('product.submit')}
              </button>
              {reviewSent && <span className="text-sm text-green-600 font-medium">{t('product.thanksReview')}</span>}
            </div>
          </form>
        </div>
      </div>

      {lightboxOpen && galleryImages.length > 0 && (
        <Lightbox images={galleryImages} initialIndex={activeImg} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
