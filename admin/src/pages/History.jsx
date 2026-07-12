import { useEffect, useState } from 'react';
import { getHistory, createHistory, updateHistory, deleteHistory } from '../api';

const EMPTY_FORM = { year: '', text: '', order: 0 };

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => getHistory().then((r) => setHistory(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) {
        const res = await updateHistory(editing._id, payload);
        setHistory((prev) => prev.map((h) => (h._id === editing._id ? res.data : h)).sort((a, b) => a.order - b.order));
      } else {
        const res = await createHistory(payload);
        setHistory((prev) => [...prev, res.data].sort((a, b) => a.order - b.order));
      }
      setForm(EMPTY_FORM);
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (h) => {
    setEditing(h);
    setForm({ year: h.year, text: h.text, order: h.order });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = async (id, year) => {
    if (!confirm(`"${year}" yozuvini o'chirishni tasdiqlaysizmi?`)) return;
    await deleteHistory(id);
    setHistory((prev) => prev.filter((h) => h._id !== id));
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold text-stone-800 mb-1">Bizning tarix</h1>
      <p className="text-stone-400 text-sm mb-6">"Biz haqimizda" sahifasidagi tarix (timeline) bo'limi</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-stone-700 mb-4">{editing ? 'Tahrirlash' : 'Yangi yozuv'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Yil *</label>
              <input
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                required
                placeholder="2024"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Matn *</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                required
                rows={3}
                placeholder="Shu yilda nima yuz berdi..."
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
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-stone-400">Tarix yozuvlari yo'q</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {history.map((h) => (
                <div key={h._id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                    {h.year}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-600">{h.text}</p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0 pt-1">
                    <button onClick={() => handleEdit(h)} className="text-xs text-blue-600 hover:underline font-medium">Tahrirlash</button>
                    <button onClick={() => handleDelete(h._id, h.year)} className="text-xs text-red-500 hover:underline font-medium">O'chirish</button>
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
