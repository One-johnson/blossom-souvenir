
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient, useQuery } from 'convex/react';
import { Toaster } from 'sonner';
import { api } from './convex/_generated/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Auth } from './pages/Auth';
import { AdminDashboard } from './pages/AdminDashboard';
import { Notifications } from './pages/Notifications';
import { MyOrders } from './pages/MyOrders';
import { Profile } from './pages/Profile';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { User, UserRole } from './types';

const CONVEX_URL = (import.meta as any).env?.VITE_CONVEX_URL || "https://blossom-souvenir.convex.cloud";
const convex = new ConvexReactClient(CONVEX_URL);

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('blossom_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  const cartItems = useQuery(api.cart.list, { userId: (user?._id as any) }) || [];
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('blossom_session_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('blossom_session_user');
  };

  const handleUpdateProfile = (u: User) => {
    setUser(u);
    localStorage.setItem('blossom_session_user', JSON.stringify(u));
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-right" richColors closeButton />
        <Header user={user} onLogout={handleLogout} cartCount={cartCount} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/shop" element={<Shop user={user} />} />
            <Route path="/cart" element={<Cart user={user} />} />
            <Route path="/wishlist" element={<Wishlist user={user} />} />
            <Route path="/orders" element={user ? <MyOrders user={user} /> : <Navigate to="/auth" />} />
            <Route path="/notifications" element={user ? <Notifications user={user} /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={user ? <Profile user={user} onUpdate={handleUpdateProfile} /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth onLogin={handleLogin} />} />
            <Route 
              path="/admin" 
              element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} 
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact user={user} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <ConvexProvider client={convex}>
      <AppContent />
    </ConvexProvider>
  );
};

export default App;
