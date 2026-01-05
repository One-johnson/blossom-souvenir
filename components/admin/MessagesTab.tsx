
import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, Trash2, Reply, CheckCircle2, 
  Clock, Mail, User as UserIcon, X, Send, 
  Search, Filter, ChevronDown, RotateCcw,
  Sparkles, Fingerprint, Calendar, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../Skeleton';

interface MessagesTabProps {
  allMessages: any[] | undefined;
  onReply: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => void;
  pendingActionId: string | null;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ 
  allMessages, onReply, onDelete, pendingActionId 
}) => {
  const [search, setSearch] = useState('');
  const [filterReplied, setFilterReplied] = useState('All');
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const filtered = useMemo(() => {
    if (!allMessages) return [];
    let result = [...allMessages];
    if (search) {
      const low = search.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(low) || 
        m.email.toLowerCase().includes(low) ||
        m.message.toLowerCase().includes(low) ||
        (m.subject && m.subject.toLowerCase().includes(low))
      );
    }
    if (filterReplied === 'Replied') result = result.filter(m => m.replied);
    if (filterReplied === 'Unreplied') result = result.filter(m => !m.replied);
    return result;
  }, [allMessages, search, filterReplied]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !replyText.trim()) return;
    
    setIsReplying(true);
    try {
      await onReply(replyingTo._id, replyText);
      toast.success("Reply sent successfully!");
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      toast.error("Failed to send reply.");
    } finally {
      setIsReplying(false);
    }
  };

  const isLoading = allMessages === undefined;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <MessageSquare className="text-rose-500" />
          Customer Inquiries ({allMessages ? filtered.length : '...'})
        </h2>
      </div>

      <div className="bg-white p-5 rounded-[2.5rem] border border-rose-50 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search inquiries..." 
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none outline-none text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-900 transition-all shadow-inner" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={filterReplied} 
            onChange={e => setFilterReplied(e.target.value)} 
            className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-slate-50 border-none outline-none appearance-none cursor-pointer font-bold text-[10px] uppercase tracking-wider text-slate-500 focus:bg-white focus:ring-2 focus:ring-rose-500 shadow-inner"
          >
            <option value="All">All Messages</option>
            <option value="Unreplied">New / Unreplied</option>
            <option value="Replied">Replied</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button 
          onClick={() => { setSearch(''); setFilterReplied('All'); }} 
          className="p-3.5 bg-slate-50 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 group shadow-inner" 
          title="Reset Filters"
        >
          <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-rose-50 space-y-4">
              <Skeleton className="h-6 w-1/4 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-6 w-1/3 rounded-lg" />
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map(msg => (
            <div 
              key={msg._id} 
              className={`bg-white rounded-[2.5rem] border p-8 transition-all hover:shadow-xl relative overflow-hidden group ${
                msg.replied ? 'border-slate-100 opacity-80' : 'border-rose-100 shadow-lg shadow-rose-100/10'
              }`}
            >
              {!msg.replied && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
              )}
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-6 flex-grow">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-[1.25rem] flex items-center justify-center font-black text-lg border-2 border-white shadow-sm">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{msg.name}</h3>
                      <div className="flex items-center gap-3 text-slate-400 font-medium text-xs">
                        <Mail size={12} className="text-rose-300" />
                        <span>{msg.email}</span>
                        {msg.userId && (
                          <span className="flex items-center gap-1.5 text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={10} /> Verified User
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <h4 className="font-black text-slate-800 text-sm">Subject: {msg.subject || 'Inquiry'}</h4>
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         msg.replied ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                       }`}>
                         {msg.replied ? 'Replied' : 'Pending'}
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                      <p className="text-slate-600 italic font-serif leading-relaxed text-lg">
                        "{msg.message}"
                      </p>
                    </div>
                    
                    {msg.replied && msg.replyText && (
                      <div className="p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50 space-y-2">
                        <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} /> Your Response
                        </label>
                        <p className="text-slate-700 font-medium">
                          {msg.replyText}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-rose-300" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-rose-300" />
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!msg.replied && (
                      <span className="text-rose-500 flex items-center gap-1 animate-pulse">
                        <Sparkles size={10} /> Needs Reply
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button 
                    onClick={() => setReplyingTo(msg)}
                    className="flex items-center justify-center gap-3 w-40 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl active:scale-95"
                  >
                    <Reply size={16} /> Reply Now
                  </button>
                  <button 
                    onClick={() => onDelete(msg._id)}
                    disabled={pendingActionId === msg._id}
                    className="flex items-center justify-center gap-3 w-40 py-4 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all shadow-sm active:scale-95"
                  >
                    {/* Add Loader2 import fix */}
                    {pendingActionId === msg._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                    Delete Thread
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center border-4 border-dashed border-rose-50 rounded-[4rem] bg-white">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-rose-200 rounded-full blur-3xl opacity-20"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-rose-50 to-white rounded-[2.5rem] border-2 border-rose-100 flex items-center justify-center text-rose-200">
                <MessageSquare size={64} className="stroke-[1.5]" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800">Peaceful boutique!</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium">
              No messages found matching your search.
            </p>
            <button 
              onClick={() => { setSearch(''); setFilterReplied('All'); }} 
              className="mt-8 bg-rose-500 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-rose-600 shadow-xl transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setReplyingTo(null)}></div>
           <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300 border border-rose-50">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-serif font-black text-slate-900">Send Response</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Replying to {replyingTo.name}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                  <X />
                </button>
              </div>
              
              <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Original Inquiry</label>
                <p className="text-slate-600 italic font-serif">"{replyingTo.message}"</p>
              </div>

              <form onSubmit={handleReplySubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Response</label>
                  <textarea 
                    required 
                    placeholder="Type your reply here..." 
                    className="w-full px-6 py-4 rounded-2xl border border-rose-50 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-rose-100 h-40 resize-none text-slate-900 transition-all font-medium leading-relaxed" 
                    value={replyText} 
                    onChange={e => setReplyText(e.target.value)} 
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="flex-1 py-5 rounded-[1.5rem] bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isReplying || !replyText.trim()} 
                    type="submit" 
                    className="flex-[2] bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-rose-500 shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] group"
                  >
                    {/* Add Loader2 import fix */}
                    {isReplying ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    Deliver Response
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
