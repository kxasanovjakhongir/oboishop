import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../api';

const STATUSES = [
  { value: 'new', label: 'Yangi', color: 'bg-blue-50 text-blue-600' },
  { value: 'confirmed', label: 'Tasdiqlangan', color: 'bg-amber-50 text-amber-600' },
  { value: 'delivered', label: 'Yetkazilgan', color: 'bg-green-50 text-green-600' },
  { value: 'cancelled', label: 'Bekor qilingan', color: 'bg-red-50 text-red-600' },
];

const fmtDate = (d) => new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function StatusBadge({ status }) {
  const s = STATUSES.find((x) => x.value === status) || STATUSES[0];
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    const { data } = await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu buyurtmani o'chirishni tasdiqlaysizmi?")) return;
    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o._id !== id));
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-stone-800 mb-6">Buyurtmalar</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'}`}
        >
          Barchasi ({orders.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === s.value ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'}`}
          >
            {s.label} ({orders.filter((o) => o.status === s.value).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-stone-400 py-8">Yuklanmoqda...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-stone-400">
          Buyurtmalar topilmadi
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div
                className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono font-bold text-stone-800 text-sm flex-shrink-0">{order.orderNumber}</span>
                  <span className="text-stone-600 text-sm truncate">{order.customerName}</span>
                  <span className="text-stone-400 text-xs flex-shrink-0">{fmtDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-orange-600 text-sm">{order.totalPrice.toLocaleString()} so'm</span>
                  <StatusBadge status={order.status} />
                  <svg className={`w-4 h-4 text-stone-400 transition-transform ${expanded === order._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expanded === order._id && (
                <div className="px-5 pb-5 border-t border-slate-50 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">Mahsulotlar</h3>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-stone-700">{item.name} × {item.quantity}</span>
                            <span className="text-stone-500">{(item.price * item.quantity).toLocaleString()} so'm</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">Mijoz ma'lumotlari</h3>
                      <div className="space-y-1 text-sm text-stone-600">
                        <p><span className="text-stone-400">Ism:</span> {order.customerName}</p>
                        <p><span className="text-stone-400">Telefon:</span> {order.phone}</p>
                        {order.address && <p><span className="text-stone-400">Manzil:</span> {order.address}</p>}
                        {order.comment && <p><span className="text-stone-400">Izoh:</span> {order.comment}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400 font-medium">Holat:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => handleDelete(order._id)} className="text-xs text-red-500 hover:underline font-medium">O'chirish</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
