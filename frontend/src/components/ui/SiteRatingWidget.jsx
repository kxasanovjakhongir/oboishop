import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSiteRatingsSummary, createSiteRating } from '../../api';

export default function SiteRatingWidget() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSiteRatingsSummary().then((r) => setSummary(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await createSiteRating({ stars: selected, name: name.trim(), comment: comment.trim() });
      setSubmitted(true);
      const r = await getSiteRatingsSummary();
      setSummary(r.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-sm w-full sm:w-auto">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <span className="text-stone-400">{t('footer.rateUs')}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={submitted}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(n)}
              className={`text-xl leading-none transition-colors ${submitted ? 'cursor-default' : 'cursor-pointer'} ${
                n <= (hovered || selected) ? 'text-amber-400' : 'text-stone-600'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {submitted ? (
          <span className="text-emerald-400 text-xs font-medium">{t('footer.thanks')}</span>
        ) : summary.count > 0 ? (
          <span className="text-stone-500 text-xs">{t('footer.ratingSummary', { avg: summary.average.toFixed(1), count: summary.count })}</span>
        ) : null}
      </div>

      {selected > 0 && !submitted && (
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('footer.namePlaceholder')}
            maxLength={40}
            className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-orange-500 w-full sm:w-36"
          />
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('footer.commentPlaceholder')}
            maxLength={200}
            className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-orange-500 w-full sm:w-64"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {t('footer.submit')}
          </button>
        </div>
      )}
    </div>
  );
}
