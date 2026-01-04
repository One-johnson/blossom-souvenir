
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ShoppingBag, Heart, ArrowRight, X, Loader2, 
  Gift, Palette, DollarSign, User as UserIcon, MessageSquare, 
  RotateCcw
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { getGiftRecommendations } from '../services/gemini';

export const Home: React.FC<{ user: any }> = ({ user }) => {
  const souvenirs = useQuery(api.souvenirs.list) || [];
  // Increased to 4 items for the new grid
  const featured = souvenirs.slice(0, 4);
  const wishlistItems = useQuery(api.wishlist.list, user ? { userId: user._id as any } : "skip") || [];
  const toggleWishlist = useMutation(api.wishlist.toggle);
  
  const [aiModal, setAiModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiResult, setAiResult] = useState<{souvenirName: string, reason: string}[] | null>(null);
  
  const [occasion, setOccasion] = useState('');
  const [recipient, setRecipient] = useState('');
  const [theme, setTheme] = useState('');
  const [budget, setBudget] = useState(100);

  const wishlistSet = useMemo(() => new Set(wishlistItems.map((i: any) => i.souvenirId)), [wishlistItems]);

  const recommendedItems = useMemo(() => {
    if (!aiResult || !souvenirs.length) return [];
    return aiResult.map(rec => {
      const match = souvenirs.find(s => s.name.toLowerCase().trim() === rec.souvenirName.toLowerCase().trim());
      return {
        ...rec,
        product: match || null
      };
    });
  }, [aiResult, souvenirs]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(1);
    
    const steps = ["Analyzing request...", "Searching collection...", "Curating matches...", "Finalizing choices..."];
    let currentStep = 1;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLoadingStep(currentStep + 1);
        currentStep++;
      }
    }, 1200);

    try {
      const data = await getGiftRecommendations(occasion, recipient, budget, souvenirs as any, theme);
      setAiResult(data.suggestions);
    } catch (error) {
      console.error(error);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent, souvenirId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save items.');
      return;
    }
    try {
      await toggleWishlist({
        userId: user._id as any,
        souvenirId: souvenirId as any
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setAiModal(false);
    setAiResult(null);
    setOccasion('');
    setRecipient('');
    setTheme('');
    setBudget(100);
  };

  const loadingMessages = ["", "Analyzing your request...", "Searching our collection...", "Curating floral matches...", "Finalizing choices..."];

  return (
    <div className="space-y-24 pb-20 relative">
      {/* Floating Action Button for AI Gift Finder */}
      <div className="fixed bottom-8 right-8 z-[100] group">
        <button 
          onClick={() => setAiModal(true)}
          className="relative flex items-center justify-center w-16 h-16 bg-rose-500 text-white rounded-full shadow-[0_20px_50px_rgba(244,63,94,0.3)] hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Open AI Gift Finder"
        >
          <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
            AI Gift Finder
          </div>
          <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20"></span>
        </button>
      </div>

      {/* Static Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Hero Boutique" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <span className="inline-block px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full text-xs font-black tracking-widest uppercase">
              Elegance in every petal
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              Timeless Treasures for <span className='text-rose-500 italic font-serif'>Precious</span> Moments
            </h1>
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
              Discover our handcrafted collection of memories. From delicate tea sets to artisan jewelry, we bring elegance to your gifting experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/shop" className="bg-rose-500 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-rose-600 transform hover:-translate-y-1 transition-all shadow-2xl shadow-rose-200 active:scale-95">
                <span>Explore Shop</span>
                <ArrowRight size={18} />
              </Link>
              <button 
                onClick={() => setAiModal(true)}
                className="bg-white text-rose-600 border-2 border-rose-200 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-rose-50 transition-all shadow-xl shadow-rose-200/20 active:scale-95"
              >
                <Sparkles size={18} />
                <span>AI Gift Finder</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-black tracking-tight">Artisan Highlights</h2>
            <p className="text-slate-500 font-medium text-lg">Carefully selected items that tell a blossom story.</p>
          </div>
          <Link to="/shop" className="bg-slate-50 text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100">
            <span>View Full Gallery</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        
        {/* Updated Grid: 4 columns and reduced card padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(item => (
            <div key={item._id} className="group relative bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-all border border-rose-50 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Changed aspect-square for smaller size */}
              <div className="aspect-square rounded-[2rem] overflow-hidden mb-5 relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <button 
                  onClick={(e) => handleToggleWishlist(e, item._id)}
                  className={`absolute top-4 right-4 p-2.5 rounded-xl transition-all shadow-lg ${
                    wishlistSet.has(item._id) ? 'bg-rose-500 text-white opacity-100' : 'bg-white/90 backdrop-blur-md text-rose-500 opacity-0 group-hover:opacity-100'
                  }`}
                  aria-label={wishlistSet.has(item._id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={18} className={wishlistSet.has(item._id) ? "fill-white" : ""} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                    {item.category}
                  </span>
                </div>
              </div>
              {/* Reduced font sizes for compact look */}
              <h3 className="font-black text-lg mb-1.5 group-hover:text-rose-500 transition-colors line-clamp-1">{item.name}</h3>
              <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed font-medium flex-grow">{item.description}</p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-rose-50">
                <span className="text-2xl font-black text-slate-900">GH₵{item.price.toFixed(2)}</span>
                <Link 
                  to="/shop" 
                  className="bg-slate-900 text-white p-3.5 rounded-xl hover:bg-rose-500 transition-all shadow-lg active:scale-95"
                  aria-label={`View ${item.name}`}
                >
                  <ShoppingBag size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Gift Finder Modal */}
      {aiModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={handleCloseModal}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
            <button 
              onClick={handleCloseModal} 
              className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all z-20"
              aria-label="Close Modal"
            >
              <X size={24} />
            </button>

            <div className="flex-grow overflow-y-auto scrollbar-hide">
              <div className="p-10 md:p-16">
                {!aiResult ? (
                  <div className="max-w-2xl mx-auto text-center space-y-12">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                        <Sparkles size={40} />
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Find the Perfect Memory</h2>
                      <p className="text-slate-500 font-medium text-lg">Tell us who you're shopping for, and our AI will curate the perfect floral treasures.</p>
                    </div>

                    {loading ? (
                      <div className="py-20 space-y-8 animate-in zoom-in">
                        <div className="relative w-32 h-32 mx-auto">
                          <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center text-rose-500">
                            <Sparkles size={32} className="animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-slate-800">{loadingMessages[loadingStep]}</h3>
                          <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${loadingStep >= i ? 'bg-rose-500' : 'bg-rose-100'}`}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleAiSearch} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Gift size={12} /> The Occasion
                          </label>
                          <input 
                            required 
                            placeholder="e.g. Birthday, Graduation..." 
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-rose-100 transition-all font-bold"
                            value={occasion}
                            onChange={e => setOccasion(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <UserIcon size={12} /> For Whom?
                          </label>
                          <input 
                            required 
                            placeholder="e.g. My Mother, Best Friend..." 
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-rose-100 transition-all font-bold"
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Palette size={12} /> Style / Theme
                          </label>
                          <input 
                            placeholder="e.g. Minimalist, Rustic, Vibrant..." 
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-rose-100 transition-all font-bold"
                            value={theme}
                            onChange={e => setTheme(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <DollarSign size={12} /> Max Budget (GH₵)
                          </label>
                          <div className="px-2 pt-2">
                            <input 
                              type="range" min="10" max="1000" step="10"
                              className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                              value={budget}
                              onChange={e => setBudget(Number(e.target.value))}
                            />
                            <div className="flex justify-between mt-2 text-xs font-black text-rose-500">
                              <span>GH₵10</span>
                              <span>GH₵{budget}</span>
                              <span>GH₵1000</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          type="submit" 
                          className="md:col-span-2 mt-4 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
                        >
                          <Sparkles size={20} /> Curate Recommendations
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="space-y-12 pb-12">
                    <div className="text-center space-y-4">
                      <h2 className="text-4xl font-black text-slate-900">Your Perfect Matches</h2>
                      <p className="text-slate-500 font-medium">Handpicked treasures based on your special occasion.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {recommendedItems.map((rec, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-[3rem] p-8 space-y-6 border border-slate-100 hover:shadow-xl transition-all animate-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                          {rec.product ? (
                            <>
                              <div className="aspect-[16/10] rounded-[2rem] overflow-hidden border-2 border-white shadow-sm">
                                <img src={rec.product.image} className="w-full h-full object-cover" alt={rec.product.name} />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900">{rec.product.name}</h3>
                                <div className="flex items-center gap-2 text-rose-500 font-black text-lg">
                                  <span className="text-xs uppercase tracking-widest text-slate-400">GH₵</span>
                                  {rec.product.price.toFixed(2)}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="aspect-[16/10] bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-200">
                              <ShoppingBag size={48} />
                            </div>
                          )}
                          <div className="p-6 bg-white rounded-[2rem] border border-rose-50 relative">
                            <MessageSquare size={20} className="absolute -top-3 -right-3 text-rose-500 fill-rose-500 shadow-xl" />
                            <p className="text-slate-600 italic font-serif leading-relaxed">
                              "{rec.reason}"
                            </p>
                          </div>
                          {rec.product && (
                            <Link 
                              to="/shop" 
                              onClick={handleCloseModal}
                              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500 transition-all shadow-lg"
                            >
                              Go to Product <ArrowRight size={16} />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-center pt-12 mt-12 border-t border-rose-50">
                      <button 
                        onClick={() => setAiResult(null)}
                        className="inline-flex items-center gap-3 bg-rose-500 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 active:scale-95 group"
                      >
                        <RotateCcw size={18} className="group-hover:-rotate-45 transition-transform" />
                        <span>Start New Search</span>
                      </button>
                      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Refine your criteria for better results
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
