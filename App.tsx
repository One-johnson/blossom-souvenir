import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from 'convex/react';
import { Toaster } from 'sonner';
import { Loader2, Flower2 } from 'lucide-react';
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('blossom_session_token'));
  
  // Retrieve user reactively from Convex based on token
  const user = useQuery(api.sessions.get, token ? { token } : "skip") as User | null | undefined;
  const logoutSession = useMutation(api.sessions.logout);

  const cartItems = useQuery(api.cart.list, user?._id ? { userId: user._id as any } : "skip") || [];
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogin = (u: User, sessionToken: string) => {
    setToken(sessionToken);
    localStorage.setItem('blossom_session_token', sessionToken);
  };

  const handleLogout = async () => {
    if (token) {
      await logoutSession({ token });
    }
    setToken(null);
    localStorage.removeItem('blossom_session_token');
  };

  const handleUpdateProfile = (u: User) => {
    // Profiling updates are handled by the reactive getSession query, 
    // but we can trigger a refresh if needed or just let Convex sync.
  };

  // Prevent flash of unauthenticated content while database session is being checked
  if (token && user === undefined) {
    return (
      <div className="min-h-screen bg-rose-50/30 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Flower2 className="w-16 h-16 text-rose-500 animate-bounce-slow" />
          <Loader2 className="w-16 h-16 text-rose-200 absolute inset-0 animate-spin" />
        </div>
        <p className="text-rose-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Restoring Session...</p>
      </div>
    );
  }

  const activeUser = user || null;

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-right" richColors closeButton />
        <Header user={activeUser} onLogout={handleLogout} cartCount={cartCount} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={activeUser} />} />
            <Route path="/shop" element={<Shop user={activeUser} />} />
            <Route path="/cart" element={<Cart user={activeUser} />} />
            <Route path="/wishlist" element={<Wishlist user={activeUser} />} />
            <Route path="/orders" element={activeUser ? <MyOrders user={activeUser} /> : <Navigate to="/auth" />} />
            <Route path="/notifications" element={activeUser ? <Notifications user={activeUser} /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={activeUser ? <Profile user={activeUser} onUpdate={handleUpdateProfile} /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={activeUser ? <Navigate to="/" /> : <Auth onLogin={handleLogin} />} />
            <Route 
              path="/admin" 
              element={activeUser?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} 
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact user={activeUser} />} />
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