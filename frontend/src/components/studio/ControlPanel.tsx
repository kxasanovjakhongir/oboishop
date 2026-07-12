import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWallpapers } from '../../api';
import useStore from '../../store/useStore';
import type { Wallpaper, WallTarget } from '../../types';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';

const WALL_VALUES: { value: WallTarget; icon: string }[] = [
  { value: 'all',   icon: '⬛' },
  { value: 'back',  icon: '◀' },
  { value: 'front', icon: '▶' },
  { value: 'left',  icon: '▲' },
  { value: 'right', icon: '▼' },
];

export default function ControlPanel({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation();
  const COLORS = t('catalog.colors', { returnObjects: true }) as string[];
  const WALL_OPTIONS = WALL_VALUES.map((w) => ({ ...w, label: t(`studio.walls.${w.value}`) }));
  const {
    selectedWallpaper, setSelectedWallpaper,
    targetWall, setTargetWall,
    applyWallpaper, resetRoom,
    textureScale, setTextureScale,
  } = useStore();

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'wallpapers'|'settings'>('wallpapers');

  useEffect(() => {
    getWallpapers().then((r) => {
      setWallpapers(r.data.filter((w: Wallpaper) => w.texture || w.images?.length > 0));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = wallpapers.filter((w) => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (colorFilter && !w.color?.toLowerCase().includes(colorFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full h-[80vh] max-h-[640px] rounded-t-3xl lg:rounded-none lg:w-80 lg:h-full bg-orange-950/95 backdrop-blur-lg text-white flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 overflow-hidden">
      {/* Drag handle — mobile-only visual affordance that this is a sheet */}
      <div className="lg:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
        <div className="w-10 h-1.5 rounded-full bg-white/25" />
      </div>

      {/* Header */}
      <div className="p-4 pt-1 lg:pt-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-bold text-base">{t('studio.title')}</h2>
          <p className="text-white/50 text-xs mt-0.5">{t('studio.subtitle')}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden w-11 h-11 -mr-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors touch-manipulation">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 flex-shrink-0">
        <button
          onClick={() => setActiveTab('wallpapers')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors touch-manipulation ${activeTab === 'wallpapers' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-white/50 hover:text-white/80'}`}
        >
          {t('studio.tabs.wallpapers')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors touch-manipulation ${activeTab === 'settings' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-white/50 hover:text-white/80'}`}
        >
          {t('studio.tabs.settings')}
        </button>
      </div>

      {activeTab === 'wallpapers' ? (
        <>
          {/* Search */}
          <div className="p-3 space-y-2 border-b border-white/10">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('studio.searchPlaceholder')}
              className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white/15 placeholder-white/30 transition-colors"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setColorFilter('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 transition-colors ${!colorFilter ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              >
                {t('studio.all')}
              </button>
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColorFilter(colorFilter === c ? '' : c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 transition-colors ${colorFilter === c ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Wallpaper List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-hide">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-18 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm">{t('studio.notFound')}</p>
              </div>
            ) : (
              filtered.map((w) => {
                const img = w.images?.[0] ? `${API}${w.images[0]}` : null;
                const isSelected = selectedWallpaper?._id === w._id;
                return (
                  <button
                    key={w._id}
                    onClick={() => setSelectedWallpaper(w)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                      isSelected ? 'bg-orange-600/30 ring-1 ring-orange-500' : 'hover:bg-white/10'
                    }`}
                  >
                    {img ? (
                      <img src={img} alt={w.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center text-white/30 text-2xl">🎨</div>
                    )}
                    <div className="overflow-hidden flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{w.name}</p>
                      <p className="text-xs text-white/50 truncate">{w.category?.name}</p>
                      <p className="text-sm font-bold text-orange-400">{w.price?.toLocaleString()} {t('common.sum')}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Wall selector */}
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wide font-semibold mb-2">{t('studio.wallSelect')}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {WALL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTargetWall(opt.value)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-semibold transition-all ${
                    targetWall === opt.value ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/50 uppercase tracking-wide font-semibold">{t('studio.textureScale')}</p>
              <span className="text-xs text-orange-400 font-mono">{textureScale.toFixed(1)}x</span>
            </div>
            <input
              type="range" min={0.3} max={3} step={0.1} value={textureScale}
              onChange={(e) => setTextureScale(Number(e.target.value))}
              className="w-full accent-orange-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>{t('studio.small')}</span><span>{t('studio.big')}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Reset */}
          <button onClick={resetRoom} className="w-full py-2.5 rounded-xl bg-white/10 text-sm font-semibold hover:bg-white/20 transition-colors">
            {t('studio.reset')}
          </button>
        </div>
      )}

      {/* Apply Button */}
      <div className="p-4 border-t border-white/10 space-y-2 flex-shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => selectedWallpaper && applyWallpaper(selectedWallpaper, targetWall)}
          disabled={!selectedWallpaper}
          className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
        >
          {selectedWallpaper ? t('studio.applyButton', { name: selectedWallpaper.name }) : t('studio.selectWallpaper')}
        </button>
        {selectedWallpaper && (
          <Link
            to={`/product/${selectedWallpaper._id}`}
            className="w-full block text-center py-2.5 rounded-xl border border-white/20 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
          >
            {t('studio.moreInfo')}
          </Link>
        )}
      </div>
    </div>
  );
}
