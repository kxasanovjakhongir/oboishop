import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Cart from './Cart';
import useStore from '../store/useStore';

const wallpaper = (overrides = {}) => ({
  _id: 'w1',
  name: 'Gullar naqshi',
  price: 100000,
  discount: 0,
  images: [],
  ...overrides,
});

function renderCart() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </HelmetProvider>
  );
}

beforeEach(() => {
  useStore.getState().clearCart();
});

describe('Cart page', () => {
  it('shows the empty state when there are no items', () => {
    renderCart();
    expect(screen.getByText(/savatingiz bo'sh/i)).toBeInTheDocument();
  });

  it('lists items and computes the discounted total', () => {
    useStore.getState().addToCart(wallpaper({ _id: 'w1', price: 100000, discount: 10 }), 2);
    useStore.getState().addToCart(wallpaper({ _id: 'w2', name: 'Chiziqlar', price: 50000 }), 1);
    renderCart();

    // w1: 100000 * 0.9 * 2 = 180000, w2: 50000 * 1 = 50000, total = 230000
    expect(screen.getByText(/230.?000/)).toBeInTheDocument();
    expect(screen.getByText('Gullar naqshi')).toBeInTheDocument();
    expect(screen.getByText('Chiziqlar')).toBeInTheDocument();
  });
});
