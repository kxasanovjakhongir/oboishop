import { useEffect, useState } from 'react';
import { getReviews, deleteReview, getSiteRatings, getSiteRatingsSummary, deleteSiteRating, setSiteRatingFeatured } from '../api';

function StarRow({ stars }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(stars)}<span className="text-stone-200">{'★'.repeat(5 - stars)}</span>
    </span>
  );
}

const fmtDate = (d) => new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Reviews() {
  const [tab, setTab] = useState('products');
  const [reviews, setReviews] = useState([]);
  const [siteRatings, setSiteRatings] = useState([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getReviews(), getSiteRatings(), getSiteRatingsSummary()])
      .then(([r, s, sum]) => {
        setReviews(r.data);
        setSiteRatings(s.data);
        setSummary(sum.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteReview = async (id) => {
    if (!confirm("Bu sharhni o'chirishni tasdiqlaysizmi?")) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  const handleDeleteSiteRating = async (id) => {
    if (!confirm("Bu baholashni o'chirishni tasdiqlaysizmi?")) return;
    await deleteSiteRating(id);
    setSiteRatings((prev) => prev.filter((r) => r._id !== id));
    const remaining = siteRatings.filter((r) => r._id !== id);
    const avg = remaining.length ? remaining.reduce((s, r) => s + r.stars, 0) / remaining.length : 0;
    setSummary({ average: Math.round(avg * 10) / 10, count: remaining.length });
  };

  const handleToggleFeatured = async (id, current) => {
    const { data } = await setSiteRatingFeatured(id, !current);
    setSiteRatings((prev) => prev.map((r) => (r._id === id ? data : r)));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-stone-800 mb-6">Sharh va reyting</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('products')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'products' ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'}`}
        >
          Mahsulot sharhlari
        </button>
        <button
          onClick={() => setTab('site')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'site' ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'}`}
        >
          Sayt reytingi
        </button>
      </div>

      {loading ? (
        <div className="text-center text-stone-400 py-8">Yuklanmoqda...</div>
      ) : tab === 'products' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {reviews.length === 0 ? (
            <div className="p-12 text-center text-stone-400">Hozircha sharhlar yo'q</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {reviews.map((r) => (
                <div key={r._id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-stone-800">{r.name}</p>
                        <StarRow stars={r.stars} />
                        <span className="text-xs text-stone-400">{fmtDate(r.createdAt)}</span>
                      </div>
                      <p className="text-xs text-orange-600 font-medium mb-1">{r.wallpaper?.name || 'Oboy o\'chirilgan'}</p>
                      {r.comment && <p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>}
                    </div>
                    <button onClick={() => handleDeleteReview(r._id)} className="text-xs text-red-500 hover:underline font-medium flex-shrink-0">O'chirish</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-6">
            <div className="text-4xl font-bold text-orange-600">{summary.average.toFixed(1)}</div>
            <div>
              <StarRow stars={Math.round(summary.average)} />
              <p className="text-xs text-stone-400 mt-1">{summary.count} ta baholash asosida</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {siteRatings.length === 0 ? (
              <div className="p-12 text-center text-stone-400">Hozircha baholashlar yo'q</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {siteRatings.map((r) => (
                  <div key={r._id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${r.featured ? 'bg-orange-50/60' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <StarRow stars={r.stars} />
                          {r.name && <span className="text-sm font-semibold text-stone-700">{r.name}</span>}
                          <span className="text-xs text-stone-400">{fmtDate(r.createdAt)}</span>
                          {r.featured && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Bosh sahifada</span>
                          )}
                        </div>
                        {r.comment ? (
                          <p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>
                        ) : (
                          <p className="text-xs text-stone-400 italic">Matnli fikr qoldirilmagan</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => handleToggleFeatured(r._id, r.featured)}
                          disabled={!r.comment}
                          title={!r.comment ? "Bosh sahifaga chiqarish uchun fikrda matn bo'lishi kerak" : ''}
                          className={`text-xs font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:no-underline ${r.featured ? 'text-stone-500' : 'text-orange-600'}`}
                        >
                          {r.featured ? "Olib tashlash" : "Bosh sahifaga chiqarish"}
                        </button>
                        <button onClick={() => handleDeleteSiteRating(r._id)} className="text-xs text-red-500 hover:underline font-medium">O'chirish</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
