import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createSiteRating } from '../../api';

const STORAGE_KEY = 'siteRatingPromptSeen';
const DELAY_MS = 60 * 1000;

export default function SiteRatingPopup() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const id = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stars) return;
    setSubmitting(true);
    try {
      await createSiteRating({ stars, comment });
      localStorage.setItem(STORAGE_KEY, '1');
      setSubmitted(true);
      setTimeout(() => setVisible(false), 1800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="fixed right-5 left-5 sm:left-auto bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-5 z-[90] sm:w-[calc(100%-2.5rem)] max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 p-5"
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {submitted ? (
            <div className="text-center py-4">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-semibold text-stone-800 dark:text-white">{t('footer.thanks')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="font-bold text-stone-800 dark:text-white text-sm pr-6 mb-1">{t('footer.rateUs')}</p>
              <div className="flex items-center gap-1 my-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setStars(n)}
                    className={`text-2xl leading-none transition-colors ${n <= (hovered || stars) ? 'text-amber-400' : 'text-stone-200 dark:text-stone-700'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder={t('product.commentPlaceholder')}
                className="w-full border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-3"
              />
              <button
                type="submit"
                disabled={!stars || submitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                {submitting ? t('product.submitting') : t('common.send')}
              </button>
            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
