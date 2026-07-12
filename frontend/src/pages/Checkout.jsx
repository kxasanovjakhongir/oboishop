import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createOrder } from '../api';
import useStore from '../store/useStore';
import SEO from '../components/ui/SEO';
import { formatUzPhone } from '../utils/phone';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';
const EMPTY_FORM = { customerName: '', phone: '', address: '', comment: '' };

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, clearCart } = useStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const priceOf = (w) => (w.discount > 0 ? Math.round(w.price * (1 - w.discount / 100)) : w.price);
  const total = cart.reduce((sum, i) => sum + priceOf(i.wallpaper) * i.quantity, 0);

  useEffect(() => {
    if (cart.length === 0 && !orderResult) navigate('/cart');
  }, [cart.length, orderResult, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const { data } = await createOrder({
        items: cart.map((i) => ({ wallpaperId: i.wallpaper._id, quantity: i.quantity })),
        ...form,
      });
      setOrderResult(data);
      clearCart();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <div className="section py-16 text-center max-w-lg mx-auto">
        <SEO noindex title={t('checkout.successTitle')} path="/checkout" />
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">{t('checkout.successTitle')}</h1>
        <p className="text-stone-500 dark:text-stone-400 mb-1">{t('checkout.successText')}</p>
        <p className="text-sm text-stone-400 dark:text-stone-500 mb-8">
          {t('checkout.orderNumber')}: <span className="font-mono font-semibold text-stone-700 dark:text-stone-200">{orderResult.orderNumber}</span>
        </p>
        <Link to="/" className="btn-primary inline-block">{t('checkout.backToHome')}</Link>
      </div>
    );
  }

  if (cart.length === 0) return null;

  return (
    <div className="section py-8">
      <SEO noindex title={t('checkout.title')} path="/checkout" />
      <h1 className="text-2xl font-bold text-stone-800 dark:text-white mb-6">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-stone-800 rounded-2xl p-5 sm:p-6 border border-stone-100 dark:border-stone-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">{t('checkout.nameLabel')}</label>
            <input
              required
              autoComplete="name"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              placeholder={t('checkout.namePlaceholder')}
              className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white rounded-xl px-4 py-3 sm:py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">{t('checkout.phoneLabel')}</label>
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: formatUzPhone(e.target.value) }))}
              placeholder={t('checkout.phonePlaceholder')}
              className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white rounded-xl px-4 py-3 sm:py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">{t('checkout.addressLabel')}</label>
            <input
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder={t('checkout.addressPlaceholder')}
              className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white rounded-xl px-4 py-3 sm:py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">{t('checkout.commentLabel')}</label>
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder={t('checkout.commentPlaceholder')}
              className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white rounded-xl px-4 py-3 sm:py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-shadow"
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{t('checkout.errorText')}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all disabled:opacity-60 touch-manipulation"
          >
            {submitting ? t('checkout.submitting') : t('checkout.submit')}
          </button>
        </form>

        <div className="bg-white dark:bg-stone-800 rounded-2xl p-5 sm:p-6 border border-stone-100 dark:border-stone-700 h-fit">
          <h2 className="font-bold text-stone-800 dark:text-white mb-4">{t('checkout.yourOrder')}</h2>
          <div className="space-y-3 mb-4 pb-4 border-b border-stone-100 dark:border-stone-700">
            {cart.map(({ wallpaper, quantity }) => {
              const image = wallpaper.images?.[0] ? `${API}${wallpaper.images[0]}` : null;
              return (
                <div key={wallpaper._id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-700 flex-shrink-0">
                    {image && <img src={image} alt={wallpaper.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 dark:text-stone-200 line-clamp-1">{wallpaper.name}</p>
                    <p className="text-xs text-stone-400">{quantity} × {priceOf(wallpaper).toLocaleString()} {t('common.sum')}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500 dark:text-stone-400 font-medium">{t('checkout.totalLabel')}</span>
            <span className="text-xl font-bold text-orange-600">{total.toLocaleString()} {t('common.sum')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
