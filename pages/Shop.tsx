
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Search, Filter, AlertCircle, CheckCircle2, 
  Clock, Sparkles, Loader2, ChevronDown, Tag, Eye, 
  X, Volume2, Play, Pause, Info, MessageSquare, RotateCcw,
  Star, Heart, DollarSign, Waves, Layers, Send, Plus
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'sonner';
import { api } from '../convex/_generated/api';
import { Souvenir, User, UserStatus, SouvenirStatus } from '../types';
import { CardSkeleton } from '../components/Skeleton';
import { speakProductStory } from '../services/gemini';

interface ShopProps {
  user: User | null;
}

export const Shop: React.FC<ShopProps> = ({ user }) => {
  const souvenirs = useQuery(api.souvenirs.list);
  const formalCategories = useQuery(api.categories.list) || [];
  const wishlistItems = useQuery(api.wishlist.list, user ? { userId: user._id as any } : "skip") || [];
  const addToCart = useMutation(api.cart.add);
  const toggleWishlist = useMutation(api.wishlist.toggle);
  const addReview = useMutation(api.reviews.add);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [isPriceModified, setIsPriceModified] = useState(false);
  
  const [pendingCartId, setPendingCartId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Souvenir | null>(null);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Audio state
  const [isNarrating, setIsNarrating] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const productReviews = useQuery(api.reviews.listBySouvenir, selectedProduct ? { souvenirId: selectedProduct._id as any } : "skip");

  const absoluteMaxPrice = useMemo(() => {
    if (!souvenirs || souvenirs.length === 0) return 2000;
    return Math.ceil(Math.max(...souvenirs.map(s => s.price)));
  }, [souvenirs]);

  useEffect(() => {
    if (souvenirs && souvenirs.length > 0 && !isPriceModified) {
      setMaxPrice(absoluteMaxPrice);
    }
  }, [souvenirs, absoluteMaxPrice, isPriceModified]);

  const wishlistSet = useMemo(() => new Set(wishlistItems.map((i: any) => i.souvenirId)), [wishlistItems]);

  const recentlyAdded = useMemo(() => {
    if (!souvenirs) return [];
    return [...souvenirs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [souvenirs]);

  const categories: string[] = useMemo(() => {
    const derived = souvenirs ? Array.from(new Set<string>(souvenirs.map(s => s.category))) : [];
    const formal = formalCategories.map(c => c.name);
    return ['All', ...Array.from(new Set<string>([...formal, ...derived]))];
  }, [formalCategories, souvenirs]);

  const filteredSouvenirs = useMemo(() => {
    if (!souvenirs) return [];
    return souvenirs.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesPrice = s.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });
  }, [souvenirs, searchTerm, categoryFilter, statusFilter, maxPrice]);

  const handleAddToCart = async (e: React.MouseEvent, souvenir: any) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to order items.');
      return;
    }
    if (user.status !== UserStatus.APPROVED) {
      toast.error('Your account is pending admin approval.');
      return;
    }
    if (souvenir.status === SouvenirStatus.SOLD) {
      toast.error('This piece has already found a home.');
      return;
    }

    setPendingCartId(souvenir._id);
    try {
      await addToCart({
        userId: user._id as any,
        souvenirId: souvenir._id,
        quantity: 1
      });
      toast.success(`${souvenir.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart.');
    } finally {
      setPendingCartId(null);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent, souvenirId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save items.');
      return;
    }
    try {
      const added = await toggleWishlist({
        userId: user._id as any,
        souvenirId: souvenirId as any
      });
      toast.info(added ? 'Saved to treasures' : 'Removed from treasures');
    } catch (err) {
      toast.error('Failed to update wishlist.');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setMaxPrice(absoluteMaxPrice);
    setIsPriceModified(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProduct) return;
    setIsSubmittingReview(true);
    try {
      await addReview({
        userId: user._id as any,
        userName: user.name,
        souvenirId: selectedProduct._id as any,
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success("Thank you for your feedback!");
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      toast.error("Failed to post review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Audio decoding logic for Gemini TTS
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleListenToStory = async () => {
    if (!selectedProduct) return;
    if (isNarrating) {
      audioSource?.stop();
      setIsNarrating(false);
      return;
    }

    setIsNarrating(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64Audio = await speakProductStory(selectedProduct.name, selectedProduct.description);
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const buffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsNarrating(false);
      source.start();
      setAudioSource(source);
    } catch (err) {
      toast.error("Could not load the artisan story.");
      setIsNarrating(false);
    }
  };

  useEffect(() => {
    if (!selectedProduct && audioSource) {
      audioSource.stop();
      setIsNarrating(false);
    }
  }, [selectedProduct, audioSource]);

  const isLoading = souvenirs === undefined;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center overflow-hidden mb-10">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Boutique Shop" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center md:text-left">
          <div className="max-w-xl space-y-4">
            <span className="inline-block px-4 py-1.5 bg-rose-500 text-white rounded-full text-[9px] font-black tracking-widest uppercase shadow-xl">
              Artisan Registry
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              The Full <span className="text-rose-400 italic font-serif">Collection</span>
            </h1>
            <p className="text-sm text-slate-200 font-medium leading-relaxed max-w-sm">
              Discover unique handcrafted treasures, preserved for your most precious moments.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* Recently Added Section - Image Only with Hover Icons (Limited to 5) */}
        {!isLoading && recentlyAdded.length > 0 && searchTerm === '' && categoryFilter === 'All' && (
          <div className="mb-14 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-rose-500">
                <Sparkles size={18} className="animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Newly Bloomed</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
              {recentlyAdded.map((item: any) => (
                <div 
                  key={item._id} 
                  className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 cursor-default group"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" 
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-1">
                      <Clock size={10} /> New
                    </span>
                  </div>

                  {/* Hover Overlay with Icons */}
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setSelectedProduct(item)}
                      className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-rose-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-[0ms] shadow-xl"
                      title="Quick View"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={(e) => handleAddToCart(e, item)}
                      disabled={item.status === SouvenirStatus.SOLD || item.status === SouvenirStatus.OUT_OF_STOCK || pendingCartId === item._id}
                      className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-rose-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-[50ms] shadow-xl disabled:opacity-50"
                      title="Add to Cart"
                    >
                      {pendingCartId === item._id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={20} />}
                    </button>
                    <button 
                      onClick={(e) => handleToggleWishlist(e, item._id)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all transform translate-y-4 group-hover:translate-y-0 delay-[100ms] shadow-xl ${
                        wishlistSet.has(item._id) ? 'bg-rose-500 text-white' : 'bg-white text-slate-900 hover:bg-rose-500 hover:text-white'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart size={20} className={wishlistSet.has(item._id) ? "fill-white" : ""} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 sticky top-20 z-40 bg-slate-50/90 backdrop-blur-md py-3 -mx-4 px-4 rounded-3xl border-b border-slate-200/50">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
            <div className="relative flex-grow lg:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-inner focus:ring-4 focus:ring-rose-500/10 outline-none text-xs font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select 
                className="pl-4 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 outline-none font-black text-[8px] uppercase tracking-widest text-slate-600 cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'Categories' : cat}</option>
                ))}
              </select>

              <select 
                className="pl-4 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 outline-none font-black text-[8px] uppercase tracking-widest text-slate-600 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">Availability</option>
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold Out</option>
                <option value="PREORDER">Pre-order</option>
              </select>

              <div className="flex items-center gap-2 px-3">
                <span className="text-[8px] font-black uppercase text-slate-400">GH₵{maxPrice}</span>
                <input 
                  type="range" 
                  min="0" max={absoluteMaxPrice} step="10"
                  className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(Number(e.target.value)); setIsPriceModified(true); }}
                />
              </div>

              {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All' || isPriceModified) && (
                <button onClick={handleResetFilters} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"><RotateCcw size={14} /></button>
              )}
            </div>
          </div>
        </div>

        {/* Main Catalog Grid - Denser for Smaller Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, idx) => <CardSkeleton key={idx} />)
          ) : filteredSouvenirs.length > 0 ? filteredSouvenirs.map((item, idx) => (
            <div 
              key={item._id} 
              onClick={() => setSelectedProduct(item as any)}
              className="group flex flex-col h-full bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1s]" />
                
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border ${
                    item.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-600' :
                    item.status === 'SOLD' ? 'bg-slate-900 text-white' :
                    'bg-slate-500/10 text-slate-600'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => handleToggleWishlist(e, item._id)}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg shadow-lg transition-all ${
                    wishlistSet.has(item._id) ? 'bg-rose-500 text-white' : 'bg-white/90 text-rose-500 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart size={14} className={wishlistSet.has(item._id) ? "fill-white" : ""} />
                </button>
              </div>
              
              <div className="p-3.5 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">{item.category}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={7} className="fill-rose-500 text-rose-500" />
                    <span className="text-[8px] font-black text-rose-600">{item.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                
                <h3 className="font-black text-xs mb-1 text-slate-900 line-clamp-1 leading-tight">{item.name}</h3>
                <p className="text-slate-500 text-[9px] mb-3 line-clamp-2 italic font-serif flex-grow leading-tight">
                  "{item.description}"
                </p>
                
                <div className="mt-auto flex justify-between items-center pt-2.5 border-t border-slate-50">
                  <span className="text-sm font-black text-slate-900 tracking-tighter">
                    <span className="text-rose-500 text-[8px] mr-0.5 font-bold">GH₵</span>
                    {item.price.toFixed(2)}
                  </span>
                  <button 
                    onClick={(e) => handleAddToCart(e, item)}
                    disabled={item.status === SouvenirStatus.SOLD || item.status === SouvenirStatus.OUT_OF_STOCK || pendingCartId === item._id}
                    className={`p-2.5 rounded-xl transition-all ${
                      item.status === SouvenirStatus.SOLD ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-rose-500'
                    }`}
                  >
                    {pendingCartId === item._id ? <Loader2 size={12} className="animate-spin" /> : <ShoppingCart size={12} />}
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <h3 className="text-xl font-black text-slate-900 mb-2">No treasures found</h3>
              <button onClick={handleResetFilters} className="bg-rose-500 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">Reset Collection</button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal - Even more compact & obvious scrolling */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white w-full max-w-2xl h-[75vh] md:h-[70vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col lg:flex-row border border-white/20">
             
             <button onClick={() => setSelectedProduct(null)} className="absolute top-5 right-5 p-2.5 bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 rounded-2xl z-[60] shadow-xl border border-slate-100 transition-all hover:rotate-90">
                <X size={20} />
             </button>
             
             {/* Product Image Panel */}
             <div className="w-full lg:w-[45%] h-56 lg:h-full relative overflow-hidden shrink-0">
               <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
               <div className="absolute bottom-5 left-5">
                  <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white flex items-center gap-3">
                    <Layers size={18} className="text-rose-500" />
                    <div>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                      <p className="text-sm font-black text-slate-900">{selectedProduct.stock} units</p>
                    </div>
                  </div>
               </div>
             </div>
             
             {/* Scrollable Content Panel */}
             <div className="flex-grow flex flex-col h-full bg-white overflow-hidden relative">
                <div className="flex-grow overflow-y-auto px-8 py-10 lg:px-12 lg:py-14 space-y-10">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">{selectedProduct.category}</span>
                      <div className="flex items-center gap-1 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-100">
                        <Star size={12} className="fill-rose-500 text-rose-500" />
                        <span className="text-[10px] font-black text-rose-600">{selectedProduct.rating?.toFixed(1) || 'New'} / 5.0</span>
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tighter">{selectedProduct.name}</h2>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative shadow-inner space-y-8">
                    <MessageSquare size={22} className="absolute -top-3 -left-3 text-rose-500 fill-rose-50 shadow-lg" />
                    <p className="text-slate-600 text-xl leading-relaxed italic font-serif">
                      "{selectedProduct.description}"
                    </p>
                    <button 
                      onClick={handleListenToStory}
                      className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-lg border border-slate-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                    >
                      {isNarrating ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                      {isNarrating ? 'Artisan Narrating...' : 'Listen to story'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8 py-8 border-y border-slate-100">
                    <div className="flex flex-col text-center sm:text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exchange Value</p>
                      <div className="text-4xl font-black text-slate-900 flex items-start">
                        <span className="text-rose-500 text-lg mt-0.5 mr-1 font-bold">GH₵</span>
                        {selectedProduct.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto flex-grow h-14">
                      <button 
                        onClick={(e) => handleToggleWishlist(e, selectedProduct._id)}
                        className="px-5 rounded-2xl border-2 border-slate-100 text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center active:scale-90"
                      >
                        <Heart size={24} className={wishlistSet.has(selectedProduct._id) ? "fill-rose-500" : ""} />
                      </button>
                      <button 
                        onClick={(e) => handleAddToCart(e, selectedProduct)}
                        disabled={selectedProduct.status === SouvenirStatus.SOLD || selectedProduct.status === SouvenirStatus.OUT_OF_STOCK || pendingCartId === selectedProduct._id}
                        className={`flex-grow px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                          selectedProduct.status === SouvenirStatus.SOLD
                          ? 'bg-slate-100 text-slate-300 shadow-none'
                          : 'bg-slate-900 text-white hover:bg-rose-500 shadow-rose-900/10'
                        }`}
                      >
                        {pendingCartId === selectedProduct._id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                        {selectedProduct.status === SouvenirStatus.SOLD ? 'Archive Only' : 'Add to Collection'}
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Review Section - Guaranteed Visibility with pb-32 */}
                  <div className="space-y-10 pb-32">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                       <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                         <Star size={24} className="text-rose-500 fill-rose-500" /> Feedback ({selectedProduct.reviewCount || 0})
                       </h3>
                    </div>

                    {user ? (
                      <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Share your experience</p>
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                key={star} type="button" 
                                onClick={() => setReviewRating(star)}
                                className="transition-all hover:scale-125 active:scale-90"
                              >
                                <Star size={36} className={`${star <= reviewRating ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="relative">
                          <textarea 
                            required
                            placeholder="Tell us what makes this special..."
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-rose-500/10 text-sm font-medium text-slate-700 min-h-[120px] resize-none italic font-serif"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                          />
                        </div>
                        <button 
                          disabled={isSubmittingReview || !reviewComment.trim()}
                          type="submit"
                          className="w-full bg-rose-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-rose-200"
                        >
                          {isSubmittingReview ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Post Registry Note
                        </button>
                      </form>
                    ) : (
                      <div className="p-10 rounded-[2.5rem] bg-rose-50/50 border border-rose-100 text-center space-y-4">
                         <p className="text-rose-600 font-bold text-base">Sign in to leave a review.</p>
                         <Link to="/auth" className="inline-block text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 px-8 py-3 rounded-xl hover:bg-rose-600 transition-all">Sign In Now</Link>
                      </div>
                    )}

                    <div className="space-y-6">
                      {productReviews && productReviews.length > 0 ? productReviews.map((rev: any) => (
                        <div key={rev._id} className="p-7 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-5 animate-in slide-in-from-bottom-4">
                           <div className="flex justify-between items-center">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 font-black text-sm">
                                 {rev.userName.charAt(0)}
                               </div>
                               <div>
                                 <p className="font-black text-slate-900 text-sm leading-none mb-1">{rev.userName}</p>
                                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                               </div>
                             </div>
                             <div className="flex gap-1">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={10} className={i < rev.rating ? 'text-rose-500 fill-rose-500' : 'text-slate-200'} />
                               ))}
                             </div>
                           </div>
                           <p className="text-slate-600 font-medium italic font-serif leading-relaxed text-base">"{rev.comment}"</p>
                        </div>
                      )) : !isLoading && (
                        <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                           <Star size={32} className="mx-auto mb-3 text-slate-100" />
                           <p className="text-slate-400 text-sm font-medium">No registry notes yet. Tell us your story!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visible hint that there is more content */}
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10"></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
