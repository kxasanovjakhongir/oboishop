import { describe, it, expect, beforeEach } from 'vitest';
import useStore from './useStore';
import type { Wallpaper } from '../types';

const makeWallpaper = (overrides: Partial<Wallpaper> = {}): Wallpaper => ({
  _id: '1',
  name: 'Test oboy',
  description: '',
  price: 10000,
  category: null,
  color: '',
  brand: '',
  images: [],
  texture: '',
  width: '1.06m',
  length: '10m',
  material: '',
  stock: true,
  featured: false,
  discount: 0,
  views: 0,
  ...overrides,
});

beforeEach(() => {
  useStore.getState().clearCart();
});

describe('cart', () => {
  it('starts empty', () => {
    expect(useStore.getState().cart).toEqual([]);
  });

  it('adds a new wallpaper with quantity 1 by default', () => {
    useStore.getState().addToCart(makeWallpaper());
    expect(useStore.getState().cart).toEqual([{ wallpaper: makeWallpaper(), quantity: 1 }]);
  });

  it('increments quantity instead of duplicating when the same wallpaper is added again', () => {
    const w = makeWallpaper();
    useStore.getState().addToCart(w);
    useStore.getState().addToCart(w, 2);
    const { cart } = useStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
  });

  it('keeps separate line items for different wallpapers', () => {
    useStore.getState().addToCart(makeWallpaper({ _id: '1' }));
    useStore.getState().addToCart(makeWallpaper({ _id: '2' }));
    expect(useStore.getState().cart).toHaveLength(2);
  });

  it('updateCartQuantity changes the quantity of an existing item', () => {
    useStore.getState().addToCart(makeWallpaper());
    useStore.getState().updateCartQuantity('1', 5);
    expect(useStore.getState().cart[0].quantity).toBe(5);
  });

  it('updateCartQuantity removes the item once quantity drops below 1', () => {
    useStore.getState().addToCart(makeWallpaper());
    useStore.getState().updateCartQuantity('1', 0);
    expect(useStore.getState().cart).toEqual([]);
  });

  it('removeFromCart removes only the targeted item', () => {
    useStore.getState().addToCart(makeWallpaper({ _id: '1' }));
    useStore.getState().addToCart(makeWallpaper({ _id: '2' }));
    useStore.getState().removeFromCart('1');
    const { cart } = useStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].wallpaper._id).toBe('2');
  });

  it('clearCart empties the cart', () => {
    useStore.getState().addToCart(makeWallpaper());
    useStore.getState().clearCart();
    expect(useStore.getState().cart).toEqual([]);
  });
});

describe('favorites', () => {
  beforeEach(() => {
    useStore.setState({ favorites: [] });
  });

  it('toggles a wallpaper id in and out of favorites', () => {
    useStore.getState().toggleFavorite('1');
    expect(useStore.getState().favorites).toContain('1');
    useStore.getState().toggleFavorite('1');
    expect(useStore.getState().favorites).not.toContain('1');
  });
});
