
import React, { useState } from 'react';
import { 
  Bell, CheckCheck, Trash2, Clock, Calendar, 
  ArrowLeft, Loader2, Sparkles, Inbox, 
  CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { User } from '../types';
import { Link, Navigate } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';

export const Notifications: React.FC<{ user: User | null }> = ({ user }) => {
  const notifications = useQuery(api.notifications.list, user ? { userId: user._id as any } : "skip") || [];
  const markRead = useMutation(api.notifications.markAllRead);
  const clearAll = useMutation(api.notifications.clearAll);
  const removeOne = useMutation(api.notifications.remove);

  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  if (!user) return <Navigate to="/auth" />;

  const handleMarkAllRead = async () => {
    setIsMarkingRead(true);
    try {
      await markRead({ userId: user._id as any });
    } catch (e) {
      console.error(e);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    setIsClearingAll(true);
    try {
      await clearAll({ userId: user._id as any });
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleRemove = async (id: string) => {
    setPendingActionId(id);
    try {
      await removeOne({ id: id as any });
    } catch (e) {
      console.error(e);
    } finally {
      setPendingActionId(null);
    }
  };

  const isLoading = notifications === undefined;
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
        <div>
          <Link to="/" className="text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-all mb-4">
            <ArrowLeft size={14} /> Back to Boutique
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-rose-200">
              <Bell size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Alerts</h1>
              <p className="text-slate-500 font-medium">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread message${unreadCount === 1 ? '' : 's'}.` 
                  : "You're all caught up with your notifications."}
              </p>
            </div>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMarkAllRead}
              disabled={isMarkingRead || unreadCount === 0}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm disabled:opacity-50"
            >
              {isMarkingRead ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
              Read All
            </button>
            <button 
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
            >
              {isClearingAll ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-rose-50 shadow-sm space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n._id} 
              className={`group bg-white p-6 rounded-[2.2rem] border transition-all flex items-start gap-5 relative overflow-hidden ${
                n.read ? 'border-slate-100 opacity-80' : 'border-rose-100 shadow-lg shadow-rose-100/20'
              }`}
            >
              {!n.read && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
              )}
              
              <div className={`mt-1 p-3 rounded-2xl shrink-0 ${
                n.read ? 'bg-slate-50 text-slate-400' : 'bg-rose-50 text-rose-500'
              }`}>
                {n.message.toLowerCase().includes('order') ? <Inbox size={20} /> : 
                 n.message.toLowerCase().includes('approve') ? <CheckCircle2 size={20} /> :
                 n.message.toLowerCase().includes('reject') ? <AlertCircle size={20} /> :
                 <Info size={20} />}
              </div>

              <div className="flex-grow space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <p className={`text-base leading-relaxed ${n.read ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>
                    {n.message}
                  </p>
                  <button 
                    onClick={() => handleRemove(n._id)}
                    disabled={pendingActionId === n._id}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    {pendingActionId === n._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-rose-300" />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-rose-300" />
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!n.read && (
                    <span className="text-rose-500 flex items-center gap-1 animate-pulse">
                      <Sparkles size={10} /> New
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center border-4 border-dashed border-rose-50 rounded-[4rem] bg-white animate-in zoom-in duration-1000">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-rose-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-rose-50 to-white rounded-[2.5rem] border-2 border-rose-100 flex items-center justify-center text-rose-200 shadow-xl">
                <Inbox size={64} className="stroke-[1.5]" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg border border-rose-50 flex items-center justify-center text-rose-500">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">No news is good news</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto leading-relaxed font-medium">
              Your blossom garden is peaceful! We'll notify you here when there's an update on your orders or account status.
            </p>
            <Link 
              to="/shop" 
              className="mt-10 inline-block bg-rose-500 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 shadow-2xl shadow-rose-200 hover:-translate-y-1 transition-all active:scale-95"
            >
              Go Pick Some Flowers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
