import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';

const FIELDS = [
  { name: 'siteName', label: 'Sayt nomi', placeholder: 'Wallpaper Studio' },
  { name: 'phone', label: 'Telefon raqami', placeholder: '+998 90 123 45 67' },
  { name: 'telegramUsername', label: 'Telegram username (@siz)', placeholder: 'wallpaperstudio' },
  { name: 'instagramUsername', label: 'Instagram username (@siz)', placeholder: 'wallpaperstudio' },
  { name: 'email', label: 'Email', placeholder: 'info@wallpaperstudio.uz' },
  { name: 'address', label: 'Manzil', placeholder: "Toshkent sh., ..." },
  { name: 'workHoursWeekday', label: 'Ish vaqti (hafta kunlari)', placeholder: 'Du-Shan: 9:00 - 19:00' },
  { name: 'workHoursWeekend', label: 'Ish vaqti (dam olish kuni)', placeholder: 'Yak: 10:00 - 17:00' },
  { name: 'statYears', label: 'Statistika: Yil tajriba', placeholder: '10+' },
  { name: 'statClients', label: 'Statistika: Baxtli mijozlar', placeholder: '5000+' },
  { name: 'statSamples', label: 'Statistika: Oboy namunalari', placeholder: '1000+' },
];

export default function Settings() {
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((r) => setForm(r.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      FIELDS.forEach((f) => fd.append(f.name, form[f.name] ?? ''));
      if (logoFile) fd.append('logo', logoFile);
      const { data } = await updateSettings(fd);
      setForm(data);
      setLogoFile(null);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-stone-800 mb-6">Sozlamalar</h1>

      {loading || !form ? (
        <div className="text-center text-stone-400 py-8">Yuklanmoqda...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Logotip</label>
            <div className="flex items-center gap-4">
              {(logoFile || form.logo) ? (
                <img
                  src={logoFile ? URL.createObjectURL(logoFile) : `${API}${form.logo}`}
                  alt="Logotip"
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-lg">
                  {form.siteName?.[0] || 'W'}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => { setLogoFile(e.target.files[0]); setSaved(false); }}
                className="flex-1 text-sm text-stone-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 cursor-pointer"
              />
            </div>
          </div>
          {FIELDS.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{f.label}</label>
              <input
                name={f.name}
                value={form[f.name] ?? ''}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-stone-50 focus:bg-white"
              />
            </div>
          ))}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">Saqlandi!</span>}
          </div>
        </form>
      )}
    </div>
  );
}
