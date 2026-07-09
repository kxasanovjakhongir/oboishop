import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wallpaper, WallTarget, RoomId, WallTextures, FilterState, CartItem } from '../types';

const EMPTY_TEXTURES: WallTextures = { back: null, front: null, left: null, right: null };

interface StoreState {
  // Theme
  isDark: boolean;
  toggleDark: () => void;

  // Studio
  currentRoom: RoomId;
  setCurrentRoom: (r: RoomId) => void;
  selectedWallpaper: Wallpaper | null;
  setSelectedWallpaper: (w: Wallpaper | null) => void;
  targetWall: WallTarget;
  setTargetWall: (w: WallTarget) => void;
  wallTextures: WallTextures;
  applyWallpaper: (w: Wallpaper, wall: WallTarget) => void;
  resetRoom: () => void;
  textureScale: number;
  setTextureScale: (s: number) => void;
  textureRotation: number;
  setTextureRotation: (r: number) => void;

  // Filters
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;

  // Favorites (liked wallpapers)
  favorites: string[];
  toggleFavorite: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (w: Wallpaper, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  category: '', color: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest', search: '',
};

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleDark: () => set((s) => ({ isDark: !s.isDark })),

      currentRoom: 'living',
      setCurrentRoom: (r) => set({ currentRoom: r }),
      selectedWallpaper: null,
      setSelectedWallpaper: (w) => set({ selectedWallpaper: w }),
      targetWall: 'all',
      setTargetWall: (w) => set({ targetWall: w }),
      wallTextures: EMPTY_TEXTURES,
      applyWallpaper: (w, wall) =>
        set((s) => ({
          wallTextures:
            wall === 'all'
              ? { back: w, front: w, left: w, right: w }
              : { ...s.wallTextures, [wall]: w },
        })),
      resetRoom: () => set({ wallTextures: EMPTY_TEXTURES, selectedWallpaper: null }),
      textureScale: 1,
      setTextureScale: (s) => set({ textureScale: s }),
      textureRotation: 0,
      setTextureRotation: (r) => set({ textureRotation: r }),

      filters: DEFAULT_FILTERS,
      setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      favorites: [],
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),

      cart: [],
      addToCart: (w, quantity = 1) =>
        set((s) => {
          const existing = s.cart.find((i) => i.wallpaper._id === w._id);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.wallpaper._id === w._id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { cart: [...s.cart, { wallpaper: w, quantity }] };
        }),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.wallpaper._id !== id) })),
      updateCartQuantity: (id, quantity) =>
        set((s) => ({
          cart: quantity < 1
            ? s.cart.filter((i) => i.wallpaper._id !== id)
            : s.cart.map((i) => (i.wallpaper._id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'wallpaper-studio-v2',
      partialize: (s) => ({ isDark: s.isDark, favorites: s.favorites, cart: s.cart }),
    }
  )
);

export default useStore;
