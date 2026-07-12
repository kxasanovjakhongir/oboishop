import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWallpapers, deleteWallpaper, updateWallpaperStock } from '../api';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

export default function Wallpapers() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    getWallpapers({ search }).then((r) => setWallpapers(r.data)).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    // load() sets loading=true synchronously before its async fetch —
    // intentional, so the list shows a loading state on every new search,
    // not just the initial mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" oboyni o'chirishni tasdiqlaysizmi?`)) return;
    await deleteWallpaper(id);
    setWallpapers((prev) => prev.filter((w) => w._id !== id));
  };

  const handleToggleStock = async (id, currentStock) => {
    setWallpapers((prev) => prev.map((w) => (w._id === id ? { ...w, stock: !currentStock } : w)));
    try {
      await updateWallpaperStock(id, !currentStock);
    } catch {
      setWallpapers((prev) => prev.map((w) => (w._id === id ? { ...w, stock: currentStock } : w)));
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Oboylar</h1>
          <p className="text-stone-400 text-sm">{wallpapers.length} ta mahsulot</p>
        </div>
        <Link to="/wallpapers/new" className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2">
          <span>+</span> Yangi oboy
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Oboy nomini qidirish..."
            className="w-full max-w-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-400">Yuklanmoqda...</div>
        ) : wallpapers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-stone-400 mb-4">Oboylar yo'q</p>
            <Link to="/wallpapers/new" className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
              Birinchi oboyni qo'shish
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-stone-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Rasm</th>
                  <th className="text-left px-4 py-3">Nomi</th>
                  <th className="text-left px-4 py-3">Kategoriya</th>
                  <th className="text-left px-4 py-3">Narxi</th>
                  <th className="text-left px-4 py-3">Holat</th>
                  <th className="text-left px-4 py-3">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {wallpapers.map((w) => {
                  const img = w.images?.[0] ? `${API}${w.images[0]}` : null;
                  return (
                    <tr key={w._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        {img ? (
                          <img src={img} alt={w.name} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-800 text-sm">{w.name}</p>
                        {w.brand && <p className="text-xs text-stone-400">{w.brand}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium">
                          {w.category?.name || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-stone-800">{w.price?.toLocaleString()} so'm</p>
                        {w.discount > 0 && <p className="text-xs text-red-500">-{w.discount}%</p>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStock(w._id, w.stock)}
                          title="Bosib holatni almashtiring"
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${w.stock ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                        >
                          {w.stock ? 'Mavjud' : 'Tugagan'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/wallpapers/${w._id}/edit`)}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDelete(w._id, w.name)}
                            className="text-xs text-red-500 hover:underline font-medium"
                          >
                            O'chirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
