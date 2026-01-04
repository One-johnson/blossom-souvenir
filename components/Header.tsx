
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, User as UserIcon, LogOut, Menu, X, 
  Flower2, LayoutDashboard, Bell, ShoppingBag, Settings,
  Heart
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { User, UserRole } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, cartCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Fetch unread notifications count
  const notifications = useQuery(api.notifications.list, user ? { userId: user._id as any } : "skip") || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Fetch wishlist count
  const wishlistItems = useQuery(api.wishlist.list, user ? { userId: user._id as any } : "skip") || [];
  const wishlistCount = wishlistItems.length;

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Flower2 className="text-rose-500 w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-serif font-bold text-slate-800">Blossom Souvenir</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-rose-600 font-medium transition-colors">Home</Link>
            <Link to="/shop" className="text-slate-600 hover:text-rose-600 font-medium transition-colors">Shop</Link>
            <Link to="/about" className="text-slate-600 hover:text-rose-600 font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-slate-600 hover:text-rose-600 font-medium transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative p-2 text-slate-600 hover:text-rose-600">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-400 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-rose-600">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user && (
              <Link to="/notifications" className="relative p-2 text-slate-600 hover:text-rose-600">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-1 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                    {user.name.charAt(0)}
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-rose-100 rounded-3xl shadow-2xl py-3 z-[60] animate-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-rose-50">
                      <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-bold mt-0.5">{user.role}</p>
                    </div>
                    
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-5 py-3 text-sm font-bold text-slate-600 hover:bg-rose-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3 text-rose-500" />
                        Update Profile
                      </Link>
                      <Link 
                        to="/wishlist" 
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-5 py-3 text-sm font-bold text-slate-600 hover:bg-rose-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 mr-3 text-rose-500" />
                        Wishlist
                      </Link>
                      <Link 
                        to="/orders" 
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-5 py-3 text-sm font-bold text-slate-600 hover:bg-rose-50 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 mr-3 text-rose-500" />
                        My Orders
                      </Link>
                      {user.role === UserRole.ADMIN && (
                        <Link 
                          to="/admin" 
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center px-5 py-3 text-sm font-bold text-slate-600 hover:bg-rose-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-3 text-rose-500" />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-rose-50">
                      <button 
                        onClick={() => { onLogout(); setProfileOpen(false); }}
                        className="flex items-center w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="bg-rose-500 text-white px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95">
                Sign In
              </Link>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-600 hover:bg-rose-50 rounded-lg">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 py-6 px-6 space-y-4 shadow-inner">
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-rose-50 rounded-2xl">Home</Link>
          <Link to="/shop" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-rose-50 rounded-2xl">Shop</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-rose-50 rounded-2xl">About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-rose-50 rounded-2xl">Contact</Link>
          <Link to="/wishlist" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-rose-50 rounded-2xl">Wishlist</Link>
        </div>
      )}
    </header>
  );
};
