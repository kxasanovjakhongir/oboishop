import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, createWallpaper, updateWallpaper } from '../api';
import api from '../api';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

const INITIAL = {
  name: '', description: '', price: '', category: '', color: '',
  brand: '', width: '1.06m', length: '10m', material: '',
  stock: true, featured: false, discount: 0,
};

export default function WallpaperForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(INITIAL);
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [textureFile, setTextureFile] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
    if (isEdit) {
      api.get(`/wallpapers/${id}`).then((r) => {
        const w = r.data;
        setForm({
          name: w.name, description: w.description, price: w.price,
          category: w.category?._id || '', color: w.color, brand: w.brand,
          width: w.width, length: w.length, material: w.material,
          stock: w.stock, featured: w.featured, discount: w.discount, sku: w.sku || '',
        });
        setExistingImages(w.images || []);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      // sku is server-generated and read-only — don't submit it back.
      const submittable = { ...form };
      delete submittable.sku;
      Object.entries(submittable).forEach(([k, v]) => fd.append(k, v));
      imageFiles.forEach((f) => fd.append('images', f));
      if (textureFile) fd.append('texture', textureFile);

      if (isEdit) await updateWallpaper(id, fd);
      else await createWallpaper(fd);

      navigate('/wallpapers');
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent';

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/wallpapers')} className="text-stone-400 hover:text-stone-600">
          ← Orqaga
        </button>
        <h1 className="text-xl font-bold text-stone-800">{isEdit ? 'Oboyni tahrirlash' : 'Yangi oboy qo\'shish'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        {isEdit && form.sku && (
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Mahsulot kodi (SKU)</label>
            <input value={form.sku} disabled className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-slate-100 text-stone-400 cursor-not-allowed" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Nomi *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Modern White" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Narxi (so'm) *</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="250000" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Kategoriya *</label>
          <select name="category" value={form.category} onChange={handleChange} required className={inputCls}>
            <option value="">Tanlang</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Tavsif</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Mahsulot haqida ma'lumot..." className={inputCls + ' resize-none'} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Rang</label>
            <input name="color" value={form.color} onChange={handleChange} placeholder="White" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Brend</label>
            <input name="brand" value={form.brand} onChange={handleChange} placeholder="Erismann" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Kenglik</label>
            <input name="width" value={form.width} onChange={handleChange} placeholder="1.06m" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Uzunlik</label>
            <input name="length" value={form.length} onChange={handleChange} placeholder="10m" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Material</label>
            <input name="material" value={form.material} onChange={handleChange} placeholder="Vinil, Fleece..." className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Chegirma (%)</label>
            <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange} placeholder="0" className={inputCls} />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="stock" checked={form.stock} onChange={handleChange} className="w-4 h-4 accent-orange-600 rounded" />
            <span className="text-sm font-medium text-stone-700">Omborda mavjud</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-orange-600 rounded" />
            <span className="text-sm font-medium text-stone-700">Mashhur</span>
          </label>
        </div>

        {/* Images */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Rasmlar (max 5)</label>
          {existingImages.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {existingImages.map((img, i) => (
                <img key={i} src={`${API}${img}`} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImageFiles(Array.from(e.target.files).slice(0, 5))}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 text-sm text-stone-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 cursor-pointer hover:border-orange-300 transition-colors"
          />
          {imageFiles.length > 0 && <p className="text-xs text-green-600 mt-1">{imageFiles.length} ta rasm tanlandi</p>}
        </div>

        {/* Texture */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">3D Texture (rasm)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTextureFile(e.target.files[0])}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 text-sm text-stone-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 cursor-pointer hover:border-blue-300 transition-colors"
          />
          {textureFile && <p className="text-xs text-green-600 mt-1">✓ {textureFile.name}</p>}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60">
            {loading ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : 'Qo\'shish'}
          </button>
          <button type="button" onClick={() => navigate('/wallpapers')} className="border border-slate-200 text-stone-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}
