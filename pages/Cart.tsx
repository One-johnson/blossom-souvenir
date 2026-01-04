
import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, MessageCircle, ArrowLeft, Loader2, ShoppingBag, CreditCard, Wallet } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { User } from '../types';
import { Skeleton } from '../components/Skeleton';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const Cart: React.FC<{ user: User | null }> = ({ user }) => {
  const cartItems = useQuery(api.cart.list, user ? { userId: user._id as any } : "skip") || [];
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.remove);
  const createOrder = useMutation(api.orders.create);

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  if (!user) return <Navigate to="/auth" />;

  const total = cartItems.reduce((acc, item) => acc + (item.souvenir?.price || 0) * item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckoutLoading(true);
    try {
      const orderItems = cartItems.map(item => ({
        souvenirId: item.souvenirId,
        quantity: item.quantity,
        priceAtTime: item.souvenir?.price || 0
      }));

      await createOrder({
        userId: user._id as any,
        items: orderItems,
        totalPrice: total
      });

      // Construct WhatsApp message
      const itemsList = cartItems.map(i => `• ${i.souvenir?.name} (x${i.quantity})`).join('\n');
      const message = `🌸 *New Order from Blossom Souvenir*\n\n*Customer:* ${user.name}\n*Total:* GH₵${total.toFixed(2)}\n\n*Items:*\n${itemsList}\n\n_Payment via MoMo has been initiated._`;
      
      const whatsappUrl = `https://wa.me/233553301044?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setShowPaymentDialog(false);
      
    } catch (error) {
      console.error(error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <ConfirmDialog 
        isOpen={showPaymentDialog}
        title="Payment Instructions"
        message={`To finalize your order of GH₵${total.toFixed(2)}, please send payment via Mobile Money to 0553301044 (Name: Blossom Souvenir). Click confirm once paid to send your order details to us on WhatsApp.`}
        confirmLabel={isCheckoutLoading ? "Processing..." : "Confirm & Send"}
        onConfirm={handleCheckout}
        onClose={() => setShowPaymentDialog(false)}
        type="info"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black flex items-center gap-4 text-slate-900">
            <ShoppingCart className="text-rose-500 w-10 h-10" /> Your Cart
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage your selected memories before checkout.</p>
        </div>
        <Link to="/shop" className="text-rose-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 bg-rose-50 px-6 py-3 rounded-2xl hover:bg-rose-100 transition-all">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.length > 0 ? (
            cartItems.map((item: any) => (
              <div key={item._id} className="bg-white p-6 rounded-[2.5rem] border border-rose-50 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-rose-50 shrink-0 border border-rose-100">
                  <img src={item.souvenir?.image} alt={item.souvenir?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-black text-xl text-slate-900 mb-1">{item.souvenir?.name}</h3>
                  <p className="text-rose-500 font-black">GH₵{item.souvenir?.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  <button 
                    onClick={() => updateQuantity({ id: item._id, quantity: Math.max(1, item.quantity - 1) })}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-black text-slate-900">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity({ id: item._id, quantity: item.quantity + 1 })}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => removeItem({ id: item._id })}
                  className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-24 text-center border-4 border-dashed border-rose-50 rounded-[3rem] bg-white space-y-6">
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-200">
                <ShoppingBag size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Your cart is empty</h3>
                <p className="text-slate-500 font-medium">Add some treasures to your garden of memories.</p>
              </div>
              <Link to="/shop" className="inline-block bg-rose-500 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-100">
                Go Shopping
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 sticky top-24 shadow-2xl shadow-slate-200">
            <h2 className="text-2xl font-black border-b border-slate-800 pb-4 flex items-center gap-2">
              <CreditCard className="text-rose-400" /> Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Subtotal</span>
                <span className="text-white">GH₵{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Shipping</span>
                <span className="text-emerald-400">Calculated later</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                <span className="font-black text-lg">Total</span>
                <div className="text-right">
                   <div className="text-4xl font-black text-rose-500 tracking-tighter">GH₵{total.toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowPaymentDialog(true)}
              disabled={cartItems.length === 0 || isCheckoutLoading}
              className="w-full bg-rose-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 shadow-xl shadow-rose-900/20 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isCheckoutLoading ? <Loader2 className="animate-spin" /> : <MessageCircle size={18} />}
              Checkout via WhatsApp
            </button>
            <div className="p-4 bg-slate-800/50 rounded-2xl flex items-start gap-3 border border-slate-700">
              <Wallet className="text-rose-400 shrink-0" size={16} />
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
                Mobile Money Payment required before shipping. Details provided on next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
