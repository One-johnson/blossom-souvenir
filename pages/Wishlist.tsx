
import React, { useState } from 'react';
import { ShoppingCart, Heart, Trash2, ArrowLeft, ShoppingBag, Loader2, Sparkles, Plus } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { User, UserStatus } from '../types';
import { CardSkeleton } from '../components/Skeleton';

export const Wishlist: React.FC<{ user: User | null }> = ({ user }) => {
  const wishlistItems = useQuery(api.wishlist.list, user ? { userId: user._id as any } : "skip") || [];
  const removeFromWishlist = useMutation(api.wishlist.remove);
  const addToCart = useMutation(api.cart.add);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [cartPendingId, setCartPendingId] = useState<string | null>(null);

  if (!user) return <Navigate to="/auth" />;

  const handleAddToCart = async (item: any) => {
    if (user.status !== UserStatus.APPROVED) {
      alert('Your account is pending admin approval.');
      return;
    }
    setCartPendingId(item._id);
    try {
      await addToCart({
        userId: user._id as any,
        souvenirId: item.souvenirId,
        quantity: 1
      });
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist({ id: item._id });
    } catch (err) {
      console.error(err);
    } finally {
      setCartPendingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    setPendingId(id);
    try {
      await removeFromWishlist({ id: id as any });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingId(null);
    }
  };

  const isLoading = wishlistItems === undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <Link to="/shop" className="text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-all mb-4">
            <ArrowLeft size={14} /> Continue Exploring
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-400 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-rose-100">
              <Heart size={28} className="fill-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saved Treasures</h1>
              <p className="text-slate-500 font-medium">Your personal garden of curated favorites.</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((item: any, idx: number) => (
            <div 
              key={item._id} 
              className="group flex flex-col h-full bg-white rounded-[2.5rem] border border-rose-50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 animate-in slide-in-from-bottom-8"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                <img src={item.souvenir?.image} alt={item.souvenir?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <button 
                  onClick={() => handleRemove(item._id)}
                  disabled={pendingId === item._id}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-slate-400 hover:text-red-500 shadow-lg transition-all"
                >
                  {pendingId === item._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={10} className="text-rose-400" />
                  <span className="text-[9px] text-rose-400 font-black uppercase tracking-[0.2em]">{item.souvenir?.category}</span>
                </div>
                <h3 className="font-black text-lg mb-2 group-hover:text-rose-500 transition-colors line-clamp-1">{item.souvenir?.name}</h3>
                <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed font-medium flex-grow">{item.souvenir?.description}</p>
                
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-rose-50">
                  <span className="text-xl font-black text-slate-900 tracking-tighter">
                    <span className="text-rose-500 text-[10px] mr-1">GH₵</span>
                    {item.souvenir?.price.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={item.souvenir?.status === "OUT_OF_STOCK" || cartPendingId === item._id}
                    className="bg-slate-900 text-white p-3.5 rounded-xl hover:bg-rose-500 transition-all shadow-lg active:scale-95 disabled:opacity-20 flex items-center gap-2 px-5"
                  >
                    {cartPendingId === item._id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center border-4 border-dashed border-rose-50 rounded-[4rem] bg-white">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-rose-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative w-32 h-32 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-200">
              <Heart size={64} className="stroke-[1.5]" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900">Your wishlist is empty</h3>
          <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium">Capture the beauty you love! Save treasures here while you explore our collection.</p>
          <Link to="/shop" className="mt-10 inline-block bg-rose-500 text-white px-12 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 shadow-2xl shadow-rose-200 transition-all">
            Start Exploring
          </Link>
        </div>
      )}
    </div>
  );
};
