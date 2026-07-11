import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import useStore from './store/useStore';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import SiteRatingPopup from './components/ui/SiteRatingPopup';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Calculator from './pages/Calculator';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// The 3D studio pulls in three.js + drei, by far the heaviest dependency in
// the app — code-splitting it means visitors who never open the studio
// never download it.
const Studio = lazy(() => import('./pages/Studio'));

function StudioFallback() {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b132b' }}>
      <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isDark = useStore((s) => s.isDark);
  const isStudio = location.pathname === '/3d-studio' || location.pathname === '/room';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  if (isStudio) {
    return (
      <Suspense fallback={<StudioFallback />}>
        <Routes>
          <Route path="/3d-studio" element={<Studio />} />
          <Route path="/room" element={<Studio />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors overflow-x-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/3d-studio" element={<Studio />} />
          <Route path="/room" element={<Studio />} />
        </Routes>
      </div>
      <Footer />
      <SiteRatingPopup />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
