import { useEffect, useState } from 'react';
import { getFeatures, createFeature, updateFeature, deleteFeature } from '../api';

const EMPTY_FORM = { icon: '', title: '', description: '', order: 0 };

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => getFeatures().then((r) => setFeatures(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) {
        const res = await updateFeature(editing._id, payload);
        setFeatures((prev) => prev.map((f) => (f._id === editing._id ? res.data : f)).sort((a, b) => a.order - b.order));
      } else {
        const res = await createFeature(payload);
        setFeatures((prev) => [...prev, res.data].sort((a, b) => a.order - b.order));
      }
      setForm(EMPTY_FORM);
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f) => {
    setEditing(f);
    setForm({ icon: f.icon, title: f.title, description: f.description, order: f.order });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}" afzallikni o'chirishni tasdiqlaysizmi?`)) return;
    await deleteFeature(id);
    setFeatures((prev) => prev.filter((f) => f._id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-stone-800 mb-1">Bizning afzalliklar</h1>
      <p className="text-stone-400 text-sm mb-6">Bosh sahifa va "Biz haqimizda"dagi "Nima uchun bizni tanlashadi?" bo'limi</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-stone-700 mb-4">{editing ? 'Tahrirlash' : 'Yangi afzallik'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Emoji ikonka *</label>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                required
                placeholder="🎉"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Sarlavha *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Keng assortiment"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Tavsif *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={3}
                placeholder="Turli uslub, rang va materialda 1000+ namuna"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Tartib raqami</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                placeholder="0"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60 flex-1">
                {saving ? 'Saqlanmoqda...' : editing ? 'Saqlash' : "Qo'shish"}
              </button>
              {editing && (
                <button type="button" onClick={handleCancel}
                  className="border border-slate-200 text-stone-500 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Bekor
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-stone-400">Yuklanmoqda...</div>
          ) : features.length === 0 ? (
            <div className="p-12 text-center text-stone-400">Afzalliklar yo'q</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {features.map((f) => (
                <div key={f._id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800">{f.title}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{f.description}</p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0 pt-1">
                    <button onClick={() => handleEdit(f)} className="text-xs text-blue-600 hover:underline font-medium">Tahrirlash</button>
                    <button onClick={() => handleDelete(f._id, f.title)} className="text-xs text-red-500 hover:underline font-medium">O'chirish</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
