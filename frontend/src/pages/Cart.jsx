import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';
import SEO from '../components/ui/SEO';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';

function QuantityStepper({ quantity, onChange }) {
  return (
    <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden flex-shrink-0">
      <button
        onClick={() => onChange(quantity - 1)}
        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-stone-500 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 active:bg-stone-200 dark:active:bg-stone-600 transition-colors font-bold touch-manipulation"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold text-stone-800 dark:text-white">{quantity}</span>
      <button
        onClick={() => onChange(quantity + 1)}
        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-stone-500 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 active:bg-stone-200 dark:active:bg-stone-600 transition-colors font-bold touch-manipulation"
      >
        +
      </button>
    </div>
  );
}

export default function Cart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, updateCartQuantity, removeFromCart } = useStore();

  const priceOf = (w) => (w.discount > 0 ? Math.round(w.price * (1 - w.discount / 100)) : w.price);
  const total = cart.reduce((sum, i) => sum + priceOf(i.wallpaper) * i.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="section py-8">
        <SEO noindex title={t('cart.title')} path="/cart" />
        <h1 className="text-2xl font-bold text-stone-800 dark:text-white mb-6">{t('cart.title')}</h1>
        <div className="text-center py-24 text-stone-400 dark:text-stone-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-stone-300 dark:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.887-4.706 2.283-7.184.075-.472-.298-.899-.776-.899H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <p className="text-lg font-medium">{t('cart.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('cart.emptyHint')}</p>
          <Link to="/catalog" className="btn-primary mt-4 inline-block">{t('cart.viewCatalog')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section py-6 sm:py-8">
      <SEO noindex title={t('cart.title')} path="/cart" />
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-white">{t('cart.title')}</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">{t('cart.count', { count: cart.length })}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(({ wallpaper, quantity }) => {
            const image = wallpaper.images?.[0] ? `${API}${wallpaper.images[0]}` : null;
            const price = priceOf(wallpaper);
            return (
              <div key={wallpaper._id} className="bg-white dark:bg-stone-800 rounded-2xl p-3.5 sm:p-4 border border-stone-100 dark:border-stone-700">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Link to={`/product/${wallpaper._id}`} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-700 flex-shrink-0">
                    {image && <img src={image} alt={wallpaper.name} className="w-full h-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${wallpaper._id}`} className="font-semibold text-stone-800 dark:text-white text-sm hover:text-orange-600 transition-colors line-clamp-2 sm:line-clamp-1">
                        {wallpaper.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(wallpaper._id)}
                        aria-label={t('cart.remove')}
                        className="sm:hidden w-9 h-9 -mt-1.5 -mr-1.5 flex items-center justify-center text-stone-400 hover:text-red-600 transition-colors flex-shrink-0 touch-manipulation"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-orange-600 font-bold text-sm mt-1">{price.toLocaleString()} {t('common.sum')}</p>

                    {/* Mobile: stepper + line total below the name */}
                    <div className="flex sm:hidden items-center justify-between mt-3">
                      <QuantityStepper quantity={quantity} onChange={(q) => updateCartQuantity(wallpaper._id, q)} />
                      <p className="font-bold text-stone-800 dark:text-white text-sm">{(price * quantity).toLocaleString()} {t('common.sum')}</p>
                    </div>
                  </div>

                  {/* Desktop: stepper + line total + delete inline */}
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <QuantityStepper quantity={quantity} onChange={(q) => updateCartQuantity(wallpaper._id, q)} />
                    <p className="w-24 text-right font-bold text-stone-800 dark:text-white text-sm">{(price * quantity).toLocaleString()}</p>
                    <button
                      onClick={() => removeFromCart(wallpaper._id)}
                      aria-label={t('cart.remove')}
                      className="text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <Link to="/catalog" className="inline-flex items-center gap-1.5 text-orange-600 font-semibold text-sm hover:underline mt-2 py-2 touch-manipulation">
            ← {t('cart.continueShopping')}
          </Link>
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-2xl p-5 sm:p-6 border border-stone-100 dark:border-stone-700 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100 dark:border-stone-700">
            <span className="text-stone-500 dark:text-stone-400 font-medium">{t('cart.total')}</span>
            <span className="text-xl sm:text-2xl font-bold text-orange-600">{total.toLocaleString()} <span className="text-sm font-normal text-stone-500 dark:text-stone-400">{t('common.sum')}</span></span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all touch-manipulation"
          >
            {t('cart.checkout')}
          </button>
        </div>
      </div>
    </div>
  );
}
