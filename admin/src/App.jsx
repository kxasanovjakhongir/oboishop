import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Wallpapers from './pages/Wallpapers';
import WallpaperForm from './pages/WallpaperForm';
import Categories from './pages/Categories';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import Features from './pages/Features';
import History from './pages/History';
import Reviews from './pages/Reviews';
import Orders from './pages/Orders';

function PrivateRoute({ children }) {
  return localStorage.getItem('admin_token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="wallpapers" element={<Wallpapers />} />
          <Route path="wallpapers/new" element={<WallpaperForm />} />
          <Route path="wallpapers/:id/edit" element={<WallpaperForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="features" element={<Features />} />
          <Route path="history" element={<History />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
