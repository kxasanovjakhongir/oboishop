import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';

export default function BottomNav() {
  const { t } = useTranslation();
  const { favorites, cart } = useStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const ITEMS = [
    {
      to: '/', end: true, label: t('common.nav.home'),
      icon: (active) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/catalog', label: t('common.nav.catalog'),
      icon: (active) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
    {
      to: '/3d-studio', label: t('common.nav.studio'),
      icon: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
      emphasized: true,
    },
    {
      to: '/cart', label: t('header.cart'), badge: cartCount,
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.887-4.706 2.283-7.184.075-.472-.298-.899-.776-.899H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        </svg>
      ),
    },
    {
      to: '/favorites', label: t('header.favorites'), badge: favorites.length,
      icon: (active) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-100 dark:border-stone-800"
    >
      <div className="grid grid-cols-5">
        {ITEMS.map(({ to, end, label, icon, badge, emphasized }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 touch-manipulation"
          >
            {({ isActive }) => (
              <>
                {emphasized ? (
                  <span className={`w-11 h-11 -mt-5 rounded-full flex items-center justify-center shadow-lg transition-colors ${isActive ? 'bg-orange-600 text-white shadow-orange-600/40' : 'bg-orange-600 text-white shadow-orange-600/30'}`}>
                    {icon(isActive)}
                  </span>
                ) : (
                  <span className={`relative transition-colors ${isActive ? 'text-orange-600' : 'text-stone-500 dark:text-stone-400'}`}>
                    {icon(isActive)}
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </span>
                )}
                <span className={`text-[10px] font-medium leading-none ${emphasized ? 'mt-0.5 text-orange-600' : isActive ? 'text-orange-600' : 'text-stone-500 dark:text-stone-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
