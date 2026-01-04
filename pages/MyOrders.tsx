
import React from 'react';
import { ShoppingBag, Package, Calendar, ChevronRight, ArrowLeft, Image as ImageIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { User } from '../types';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';

interface MyOrdersProps {
  user: User | null;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12} /> Completed</span>;
    case 'CANCELLED':
      return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><AlertCircle size={12} /> Cancelled</span>;
    default:
      return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> Pending</span>;
  }
};

export const MyOrders: React.FC<MyOrdersProps> = ({ user }) => {
  const orders = useQuery(api.orders.listByUser, user ? { userId: user._id as any } : "skip" as any);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Please sign in to view your orders</h2>
        <Link to="/auth" className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold inline-block hover:bg-rose-600 shadow-lg">Sign In</Link>
      </div>
    );
  }

  const isLoading = orders === undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <Link to="/" className="text-rose-500 font-bold flex items-center gap-1 hover:underline mb-2 text-sm">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <ShoppingBag className="text-rose-500" /> My Orders
        </h1>
        <p className="text-slate-500 mt-2 font-medium">View and track your history with Blossom Souvenir.</p>
      </div>

      <div className="space-y-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-rose-50 shadow-sm space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-20 w-full rounded-2xl" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))
        ) : orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <div key={order._id} className="bg-white rounded-[2.5rem] border border-rose-50 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                    <p className="font-mono text-xs font-bold text-rose-500 uppercase">#{order._id.slice(-8)}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-3xl p-6 space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-rose-50 shrink-0 shadow-sm">
                        {item.souvenirImage ? (
                          <img src={item.souvenirImage} alt={item.souvenirName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{item.souvenirName}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} × GH₵{item.priceAtTime.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">GH₵{(item.quantity * item.priceAtTime).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Total</p>
                    <p className="text-2xl font-black text-rose-600">GH₵{order.totalPrice.toFixed(2)}</p>
                  </div>
                  <Link to="/shop" className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors">
                    Shop Similar <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-rose-50 rounded-[3rem] bg-white">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-200">
              <Package size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">No orders yet</h3>
            <p className="text-slate-400 mt-2 max-w-xs mx-auto font-medium">Your journey of picking memories hasn't started yet. Let's find something beautiful!</p>
            <Link to="/shop" className="mt-8 inline-block bg-rose-500 text-white px-8 py-4 rounded-full font-bold hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all">
              Go to Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
