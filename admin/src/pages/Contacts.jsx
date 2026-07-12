import { useEffect, useState } from 'react';
import { getContacts, markRead, deleteContact } from '../api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContacts().then((r) => setContacts(r.data)).finally(() => setLoading(false));
  }, []);

  const handleRead = async (id) => {
    await markRead(id);
    setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, read: true } : c)));
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu murojaatni o\'chirishni tasdiqlaysizmi?')) return;
    await deleteContact(id);
    setContacts((prev) => prev.filter((c) => c._id !== id));
  };

  const unread = contacts.filter((c) => !c.read).length;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-stone-800">Murojaatlar</h1>
        {unread > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{unread} yangi</span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-400">Yuklanmoqda...</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-stone-400">Hozircha murojaatlar yo'q</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {contacts.map((c) => (
              <div key={c._id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${!c.read ? 'border-l-4 border-l-orange-500' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-stone-800">{c.name}</p>
                      {!c.read && <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">Yangi</span>}
                      <span className="text-xs text-stone-400">
                        {new Date(c.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <a href={`tel:${c.phone}`} className="text-sm text-blue-600 hover:underline">{c.phone}</a>
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{c.message}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!c.read && (
                      <button onClick={() => handleRead(c._id)} className="text-xs text-green-600 hover:underline font-medium whitespace-nowrap">O'qildi</button>
                    )}
                    <button onClick={() => handleDelete(c._id)} className="text-xs text-red-500 hover:underline font-medium">O'chirish</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
