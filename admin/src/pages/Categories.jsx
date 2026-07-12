import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', image: null });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => getCategories().then((r) => setCategories(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.image) fd.append('image', form.image);

      if (editing) {
        const res = await updateCategory(editing._id, fd);
        setCategories((prev) => prev.map((c) => (c._id === editing._id ? res.data : c)));
      } else {
        const res = await createCategory(fd);
        setCategories((prev) => [...prev, res.data]);
      }
      setForm({ name: '', image: null });
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, image: null });
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" kategoriyani o'chirishni tasdiqlaysizmi?`)) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-stone-800 mb-6">Kategoriyalar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-stone-700 mb-4">{editing ? 'Tahrirlash' : 'Yangi kategoriya'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Nomi *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Modern"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Rasm</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                className="w-full text-sm text-stone-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 cursor-pointer"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60 flex-1">
                {saving ? 'Saqlanmoqda...' : editing ? 'Saqlash' : 'Qo\'shish'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm({ name: '', image: null }); }}
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
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-stone-400">Kategoriyalar yo'q</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {categories.map((cat) => (
                <div key={cat._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  {cat.image ? (
                    <img src={`${API}${cat.image}`} alt={cat.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                      {cat.name[0]}
                    </div>
                  )}
                  <p className="flex-1 font-medium text-stone-800">{cat.name}</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(cat)} className="text-xs text-blue-600 hover:underline font-medium">Tahrirlash</button>
                    <button onClick={() => handleDelete(cat._id, cat.name)} className="text-xs text-red-500 hover:underline font-medium">O'chirish</button>
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
