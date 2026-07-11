import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import WallpaperCard from './WallpaperCard';
import useStore from '../../store/useStore';

const wallpaper = {
  _id: 'w1',
  name: 'Gullar naqshi',
  price: 100000,
  discount: 20,
  category: { _id: 'c1', name: 'Klassik' },
  images: [],
  stock: true,
  featured: false,
  ratingCount: 0,
};

function renderCard(w = wallpaper) {
  return render(
    <MemoryRouter>
      <WallpaperCard wallpaper={w} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useStore.getState().clearCart();
  useStore.setState({ favorites: [] });
});

describe('WallpaperCard', () => {
  it('shows the name and the discounted price, not the original one', () => {
    renderCard();
    expect(screen.getByText('Gullar naqshi')).toBeInTheDocument();
    // 100000 * (1 - 20/100) = 80000
    expect(screen.getByText(/80.?000/)).toBeInTheDocument();
  });

  it('shows a discount badge when the wallpaper is discounted', () => {
    renderCard();
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('adds the wallpaper to the cart when "add to cart" is clicked, and reflects it in the button', async () => {
    const user = userEvent.setup();
    renderCard();

    const addButton = screen.getByRole('button', { name: /savatga qo'shish/i });
    await user.click(addButton);

    expect(useStore.getState().cart).toHaveLength(1);
    expect(useStore.getState().cart[0].wallpaper._id).toBe('w1');
    expect(screen.getByText(/savatda/i)).toBeInTheDocument();
  });

  it('disables the add-to-cart button when the wallpaper is out of stock', () => {
    renderCard({ ...wallpaper, stock: false });
    const addButton = screen.getByRole('button', { name: /savatga qo'shish/i });
    expect(addButton).toBeDisabled();
  });
});
