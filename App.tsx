
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient, useQuery } from 'convex/react';
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
            <Route path="/about" element={
              <div className="max-w-4xl mx-auto px-4 py-24 space-y-12">
                <h1 className="text-5xl font-bold text-center">Our Story</h1>
                <div className="prose prose-rose max-w-none text-lg text-slate-600 leading-relaxed space-y-6">
                  <p>Founded in 2024, Blossom Souvenir was born from a simple desire: to capture the ephemeral beauty of a flower and turn it into a lasting memory. We believe that souvenirs are not just objects, but vessels of emotion and stories of travel, love, and discovery.</p>
                  <p>Every item in our collection is carefully selected from artisans who share our passion for floral elegance and handcrafted excellence. Whether it's a hand-painted tea set or a delicate embroidered scarf, we ensure that the spirit of craftsmanship is woven into every fiber.</p>
                </div>
              </div>
            } />
            <Route path="/contact" element={
              <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                  <div className="space-y-8">
                    <h1 className="text-6xl font-bold">Say Hello</h1>
                    <p className="text-xl text-slate-500">Have questions about our collection or need a custom gift? We'd love to hear from you.</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-rose-500 font-bold">
                        <span className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">📍</span>
                        <span className="text-slate-700">123 Floral Garden Ave, Blossom City</span>
                      </div>
                      <div className="flex items-center gap-4 text-rose-500 font-bold">
                        <span className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">📞</span>
                        <span className="text-slate-700">+1 (234) 567-890</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-rose-50 space-y-6">
                    <input className="w-full p-4 rounded-2xl border border-rose-100" placeholder="Your Name" />
                    <input className="w-full p-4 rounded-2xl border border-rose-100" placeholder="Email Address" />
                    <textarea className="w-full p-4 rounded-2xl border border-rose-100 h-32" placeholder="Tell us what's on your mind..."></textarea>
                    <button className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-rose-600 transition-all">Send Message</button>
                  </div>
                </div>
              </div>
            } />
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
