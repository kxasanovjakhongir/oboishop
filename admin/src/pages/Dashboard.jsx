import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('admin_username') || 'Admin';

  useEffect(() => {
    getStats().then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  const ORDER_CARDS = [
    { label: 'Buyurtmalar', value: stats?.orders ?? 0, icon: '🛒', to: '/orders', color: 'bg-orange-50 text-orange-600' },
    { label: 'Yangi buyurtmalar', value: stats?.newOrders ?? 0, icon: '🆕', to: '/orders', color: 'bg-amber-50 text-amber-600' },
    { label: 'Tushum', value: `${(stats?.revenue ?? 0).toLocaleString()} so'm`, icon: '💰', to: '/orders', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Oboylar', value: stats?.wallpapers ?? 0, icon: '🖼️', to: '/wallpapers', color: 'bg-blue-50 text-blue-600' },
  ];

  const CARDS = [
    { label: 'Kategoriyalar', value: stats?.categories ?? 0, icon: '🏷️', to: '/categories', color: 'bg-green-50 text-green-600' },
    { label: "Jami murojaatlar", value: stats?.contacts ?? 0, icon: '📩', to: '/contacts', color: 'bg-purple-50 text-purple-600' },
    { label: "O'qilmagan", value: stats?.unread ?? 0, icon: '🔔', to: '/contacts', color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Salom, {username}! 👋</h1>
        <p className="text-stone-400 text-sm mt-1">Wallpaper Studio Admin Paneli</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {ORDER_CARDS.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-xl mb-3`}>
              {card.icon}
            </div>
            {loading ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-stone-800">{card.value}</p>
            )}
            <p className="text-stone-400 text-sm">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {CARDS.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-xl mb-3`}>
              {card.icon}
            </div>
            {loading ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-3xl font-bold text-stone-800">{card.value}</p>
            )}
            <p className="text-stone-400 text-sm">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-stone-800 mb-4">Tez harakatlar</h2>
          <div className="space-y-2">
            <Link to="/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 group transition-colors">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-200">🛒</div>
              <div>
                <p className="text-sm font-medium text-stone-700">Yangi buyurtmalarni ko'rish</p>
                <p className="text-xs text-stone-400">Kelgan buyurtmalarni tasdiqlash/yetkazish</p>
              </div>
            </Link>
            <Link to="/wallpapers/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 group transition-colors">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-200">+</div>
              <div>
                <p className="text-sm font-medium text-stone-700">Yangi oboy qo'shish</p>
                <p className="text-xs text-stone-400">Katalogga yangi mahsulot qo'shish</p>
              </div>
            </Link>
            <Link to="/categories/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 group transition-colors">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-200">+</div>
              <div>
                <p className="text-sm font-medium text-stone-700">Yangi kategoriya qo'shish</p>
                <p className="text-xs text-stone-400">Mahsulot kategoriyasini yaratish</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-stone-800 mb-4">Tizim holati</h2>
          <div className="space-y-3">
            {[
              { label: 'Backend Server', status: 'Ishlayapti', ok: true },
              { label: 'MongoDB', status: 'Ulangan', ok: true },
              { label: 'Fayl yuklash', status: 'Tayyor', ok: true },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-stone-600">{s.label}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.ok ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
