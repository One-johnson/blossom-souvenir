
import React, { useState, useMemo, useRef } from 'react';
import { 
  ShoppingCart, Search, Filter, AlertCircle, CheckCircle2, 
  Clock, Sparkles, Loader2, ChevronDown, Tag, Eye, 
  X, Volume2, Play, Pause, Info, MessageSquare, RotateCcw,
  Star, Heart
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Souvenir, User, UserStatus } from '../types';
import { CardSkeleton } from '../components/Skeleton';

interface ShopProps {
  user: User | null;
}

export const Shop: React.FC<ShopProps> = ({ user }) => {
  const souvenirs = useQuery(api.souvenirs.list);
  const formalCategories = useQuery(api.categories.list) || [];
  const wishlistItems = useQuery(api.wishlist.list, user ? { userId: user._id as any } : "skip") || [];
  const addToCart = useMutation(api.cart.add);
  const toggleWishlist = useMutation(api.wishlist.toggle);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [pendingCartId, setPendingCartId] = useState<string | null>(null);
  const [pendingWishlistId, setPendingWishlistId] = useState<string | null>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<Souvenir | null>(null);

  const wishlistSet = useMemo(() => new Set(wishlistItems.map((i: any) => i.souvenirId)), [wishlistItems]);

  const recentlyAdded = useMemo(() => {
    if (!souvenirs) return [];
    return [...souvenirs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [souvenirs]);

  const derivedCategories = useMemo(() => {
    if (!souvenirs) return [];
    return Array.from(new Set<string>(souvenirs.map((s: any) => String(s.category))));
  }, [souvenirs]);

  const categories: string[] = useMemo(() => {
    const categoryNames = formalCategories.map(c => c.name);
    return ['All', ...Array.from(new Set<string>([...categoryNames, ...derivedCategories]))];
  }, [formalCategories, derivedCategories]);

  const filteredSouvenirs = useMemo(() => {
    if (!souvenirs) return [];
    return souvenirs.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [souvenirs, searchTerm, categoryFilter, statusFilter]);

  const handleAddToCart = async (e: React.MouseEvent, souvenir: any) => {
    e.stopPropagation();
    if (!user) {
      setMessage({ text: 'Please sign in to order items.', type: 'error' });
      return;
    }
    if (user.status !== UserStatus.APPROVED) {
      setMessage({ text: 'Your account is pending admin approval.', type: 'error' });
      return;
    }

    setPendingCartId(souvenir._id);
    try {
      await addToCart({
        userId: user._id as any,
        souvenirId: souvenir._id,
        quantity: 1
      });
      setMessage({ text: `${souvenir.name} added to cart!`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: 'Failed to add item to cart.', type: 'error' });
    } finally {
      setPendingCartId(null);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent, souvenirId: string) => {
    e.stopPropagation();
    if (!user) {
      setMessage({ text: 'Please sign in to save items.', type: 'error' });
      return;
    }
    setPendingWishlistId(souvenirId);
    try {
      const added = await toggleWishlist({
        userId: user._id as any,
        souvenirId: souvenirId as any
      });
      setMessage({ 
        text: added ? 'Added to wishlist' : 'Removed from wishlist', 
        type: 'success' 
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ text: 'Failed to update wishlist.', type: 'error' });
    } finally {
      setPendingWishlistId(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
  };

  const isLoading = souvenirs === undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      {/* Notifications Message */}
      {message && (
        <div className={`fixed top-24 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300 ${
          message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      {/* Hero Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-black mb-3 text-slate-900 tracking-tight">Our Collection</h1>
        <p className="text-slate-500 max-w-md font-medium text-lg leading-relaxed">Discover handpicked items for your unique blossom journey.</p>
      </div>

      {/* Recently Added Section */}
      {!isLoading && recentlyAdded.length > 0 && searchTerm === '' && categoryFilter === 'All' && statusFilter === 'All' && (
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center gap-2 mb-6 text-rose-500">
            <Sparkles size={18} className="animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">New Arrivals</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {recentlyAdded.map((item: any) => (
              <div 
                key={item._id} 
                onClick={() => setSelectedProduct(item)}
                className="flex-shrink-0 w-72 bg-white rounded-[2rem] border border-rose-50 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-start group"
              >
                <div className="relative aspect-[3/2] rounded-[1.5rem] overflow-hidden mb-4">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <Clock size={10} /> New
                    </span>
                  </div>
                  <button 
                    onClick={(e) => handleToggleWishlist(e, item._id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all text-rose-500"
                  >
                    <Heart size={16} className={wishlistSet.has(item._id) ? "fill-rose-500" : ""} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1 group-hover:text-rose-500 transition-colors">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold">{item.category}</span>
                  <span className="font-black text-rose-500">GH₵{item.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8 sticky top-20 z-40 bg-slate-50/80 backdrop-blur-md py-4 -mx-4 px-4 rounded-3xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
          {/* Search Box */}
          <div className="relative flex-grow lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search treasures..." 
              className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-white border border-rose-100 shadow-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 outline-none transition-all font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Select */}
          <div className="relative w-full md:w-48">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              className="w-full pl-10 pr-10 py-4 rounded-[1.5rem] bg-white border border-rose-100 shadow-sm appearance-none outline-none focus:ring-4 focus:ring-rose-500/10 font-bold text-[10px] uppercase tracking-widest text-slate-600 cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
          </div>

          {/* Status Select */}
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              className="w-full pl-10 pr-10 py-4 rounded-[1.5rem] bg-white border border-rose-100 shadow-sm appearance-none outline-none focus:ring-4 focus:ring-rose-500/10 font-bold text-[10px] uppercase tracking-widest text-slate-600 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="AVAILABLE">Available Now</option>
              <option value="PREORDER">Pre-order Only</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
          </div>

          {/* Reset Filters */}
          {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
            <button 
              onClick={handleResetFilters}
              className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all group"
              title="Reset Filters"
            >
              <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => <CardSkeleton key={idx} />)
        ) : filteredSouvenirs.length > 0 ? filteredSouvenirs.map((item, idx) => (
          <div 
            key={item._id} 
            onClick={() => setSelectedProduct(item as any)}
            className="group flex flex-col h-full bg-white rounded-[2.5rem] border border-rose-50 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(244,63,94,0.1)] transition-all duration-500 cursor-pointer animate-in slide-in-from-bottom-8"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Shorter Image Aspect Ratio [3/2] */}
            <div className="relative aspect-[3/2] overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border ${
                  item.status === 'AVAILABLE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                  item.status === 'PREORDER' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                  'bg-slate-500/10 border-slate-500/20 text-slate-600'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <button 
                onClick={(e) => handleToggleWishlist(e, item._id)}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:scale-110 active:scale-90 transition-all text-rose-500"
              >
                <Heart size={20} className={wishlistSet.has(item._id) ? "fill-rose-500" : ""} />
              </button>
            </div>
            {/* Reduced Padding [p-5] */}
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <Tag size={10} className="text-rose-400" />
                <span className="text-[9px] text-rose-400 font-black uppercase tracking-[0.2em]">{item.category}</span>
              </div>
              <h3 className="font-black text-lg mb-2 group-hover:text-rose-500 transition-colors line-clamp-1">{item.name}</h3>
              <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed font-medium flex-grow">{item.description}</p>
              
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-rose-50">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 tracking-tighter">
                    <span className="text-rose-500 text-[10px] mr-1">GH₵</span>
                    {item.price.toFixed(2)}
                  </span>
                </div>
                <button 
                  onClick={(e) => handleAddToCart(e, item)}
                  disabled={item.status === "OUT_OF_STOCK" || pendingCartId === item._id}
                  className="bg-slate-900 text-white p-3.5 rounded-xl hover:bg-rose-500 transition-all shadow-lg active:scale-95 disabled:opacity-20"
                >
                  {pendingCartId === item._id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-rose-50 rounded-[4rem] bg-white">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-white rounded-3xl border-2 border-rose-100 flex items-center justify-center text-rose-200">
                <Search size={48} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900">No match found</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium">Try different keywords or filters.</p>
            <button 
              onClick={handleResetFilters}
              className="mt-8 bg-rose-500 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-rose-600 shadow-2xl shadow-rose-200"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col md:flex-row border border-rose-100">
             <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 p-3 bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 rounded-2xl z-20 shadow-lg">
                <X size={24} />
             </button>
             
             <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
               <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
             </div>
             
             <div className="flex-grow p-12 overflow-y-auto scrollbar-hide flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={16} className="text-rose-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-rose-500">{selectedProduct.category}</span>
                </div>
                <h2 className="text-5xl font-black text-slate-900 mb-6 leading-tight">{selectedProduct.name}</h2>
                <div className="p-8 bg-rose-50/50 rounded-[2rem] border border-rose-50 mb-8 relative">
                  <MessageSquare size={20} className="absolute -top-3 -left-3 text-rose-500 fill-rose-50" />
                  <p className="text-slate-600 text-lg leading-relaxed italic font-serif">
                    "{selectedProduct.description}"
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-8 mt-4">
                  <div className="text-4xl font-black text-slate-900">
                    <span className="text-rose-500 text-lg mr-1">GH₵</span>
                    {selectedProduct.price.toFixed(2)}
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={(e) => handleToggleWishlist(e, selectedProduct._id)}
                      className="p-5 rounded-2xl border-2 border-rose-100 text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                    >
                      <Heart size={24} className={wishlistSet.has(selectedProduct._id) ? "fill-rose-500" : ""} />
                    </button>
                    <button 
                      onClick={(e) => handleAddToCart(e, selectedProduct)}
                      disabled={selectedProduct.status === "OUT_OF_STOCK" || pendingCartId === selectedProduct._id}
                      className="flex-grow sm:flex-grow-0 bg-rose-500 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-2xl shadow-rose-200 active:scale-95 flex items-center justify-center gap-3"
                    >
                      {pendingCartId === selectedProduct._id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                      Add to Collection
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
