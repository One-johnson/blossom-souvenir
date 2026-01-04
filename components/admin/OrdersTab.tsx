
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, Filter, ChevronDown, RotateCcw, ArrowUpDown, Eye, Trash2, Loader2, X, Hash, User as UserIcon, Calendar, Package, CreditCard, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Skeleton, OrderRowSkeleton } from '../Skeleton';

interface OrdersTabProps {
  allOrders: any[] | undefined;
  onUpdateStatus: (id: string, status: string) => void;
  onBulkUpdateStatus: (ids: string[], status: string) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  pendingActionId: string | null;
  isSaving: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
    default: return 'bg-rose-50 text-rose-600 border-rose-100';
  }
};

export const OrdersTab: React.FC<OrdersTabProps> = ({ 
  allOrders, onUpdateStatus, onBulkUpdateStatus, onDelete, onBulkDelete, pendingActionId, isSaving 
}) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filteredAndSorted = useMemo(() => {
    if (!allOrders) return [];
    let result = [...allOrders];
    if (search) {
      const low = search.toLowerCase();
      result = result.filter(o => o._id.toLowerCase().includes(low) || o.userName.toLowerCase().includes(low));
    }
    if (filterStatus !== 'All') result = result.filter(o => o.status === filterStatus);
    result.sort((a, b) => {
      const aVal = a[sort.key as keyof typeof a];
      const bVal = b[sort.key as keyof typeof b];
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [allOrders, search, filterStatus, sort]);

  const paginated = filteredAndSorted.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredAndSorted.length / perPage);

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Orders ({allOrders ? filteredAndSorted.length : '...'})</h2>
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { onBulkUpdateStatus(Array.from(selectedIds), 'COMPLETED'); setSelectedIds(new Set()); }} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2">Mark Completed</button>
            <button onClick={() => { onBulkDelete(Array.from(selectedIds)); setSelectedIds(new Set()); }} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">Delete Selected</button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-3xl border border-rose-50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 outline-none text-sm text-slate-900" value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} />
        </div>
        <select value={filterStatus} onChange={e => {setFilterStatus(e.target.value); setPage(1);}} className="pl-4 pr-10 py-3 rounded-2xl bg-slate-50 outline-none font-bold text-[10px] uppercase tracking-wider text-slate-500">
          <option value="All">All Statuses</option>
          <option value="PENDING_WHATSAPP">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={() => { setSearch(''); setFilterStatus('All'); setSort({ key: 'createdAt', direction: 'desc' }); setPage(1); }} className="p-3 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100"><RotateCcw size={16} /></button>
      </div>

      <div className="bg-white rounded-[2rem] border border-rose-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-rose-50/30 border-b border-rose-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-5 w-12 text-center"><input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0} onChange={() => { if (selectedIds.size === paginated.length) setSelectedIds(new Set()); else setSelectedIds(new Set(paginated.map(o => o._id))); }} /></th>
                <th className="px-6 py-5 cursor-pointer" onClick={() => setSort({ key: '_id', direction: sort.direction === 'asc' ? 'desc' : 'asc' })}>ID <ArrowUpDown size={12} /></th>
                <th className="px-6 py-5 cursor-pointer" onClick={() => setSort({ key: 'userName', direction: sort.direction === 'asc' ? 'desc' : 'asc' })}>Customer <ArrowUpDown size={12} /></th>
                <th className="px-6 py-5 cursor-pointer" onClick={() => setSort({ key: 'createdAt', direction: sort.direction === 'asc' ? 'desc' : 'asc' })}>Date <ArrowUpDown size={12} /></th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {allOrders === undefined ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><OrderRowSkeleton /></td></tr>) : paginated.map(order => (
                <tr key={order._id} className="hover:bg-rose-50/10 cursor-pointer" onClick={() => setViewingOrder(order)}>
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(order._id)} onChange={() => toggleSelectOne(order._id)} /></td>
                  <td className="px-6 py-4 font-mono text-[10px] text-rose-500">#{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-800">{order.userName}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><div className={`text-[9px] font-bold px-3 py-1.5 rounded-full border text-center ${getStatusColor(order.status)}`}>{order.status.replace('_', ' ')}</div></td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}><div className="flex justify-end gap-1"><button onClick={() => setViewingOrder(order)} className="p-2 text-slate-400 hover:text-rose-500"><Eye size={16} /></button><button onClick={() => onDelete(order._id)} className="p-2 text-slate-400 hover:text-red-500">{pendingActionId === order._id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-8">
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingOrder(null)}></div>
           <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh] border border-rose-100/50">
              <div className="bg-white px-8 py-6 border-b border-rose-50 flex justify-between items-start shrink-0 z-10">
                <div className="space-y-1"><div className="flex items-center gap-3"><h3 className="text-2xl font-bold text-slate-900">Order Summary</h3><div className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(viewingOrder.status)}`}>{viewingOrder.status.replace('_', ' ')}</div></div><div className="flex items-center gap-2"><Hash size={14} className="text-rose-400" /><span className="text-rose-500 font-mono text-xs font-bold">{viewingOrder._id}</span></div></div>
                <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-rose-50 text-slate-400 rounded-full"><X size={24} /></button>
              </div>
              <div className="flex-grow overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100"><label className="text-[10px] font-bold text-slate-400 uppercase">Customer</label><p className="text-lg font-bold text-slate-800">{viewingOrder.userName}</p></div><div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100"><label className="text-[10px] font-bold text-slate-400 uppercase">Date</label><p className="text-lg font-bold text-slate-800">{new Date(viewingOrder.createdAt).toLocaleDateString()}</p></div></div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><Package size={12} /> Items ({viewingOrder.items.length})</h4>
                  <div className="space-y-3">
                    {viewingOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-5 p-4 bg-white rounded-3xl border border-slate-100 hover:border-rose-100">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">{item.souvenirImage ? <img src={item.souvenirImage} alt={item.souvenirName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>}</div>
                        <div className="flex-grow min-w-0"><h5 className="font-bold text-base text-slate-800 truncate mb-1">{item.souvenirName}</h5><div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 w-fit text-[10px] font-bold">Qty: {item.quantity}</div></div>
                        <div className="text-right shrink-0"><div className="text-lg font-bold text-slate-900">GH₵{(item.priceAtTime * item.quantity).toFixed(2)}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-slate-50/50 backdrop-blur-md p-8 border-t border-rose-50 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-6 mb-6">
                  <div className="space-y-3"><label className="text-[10px] font-bold text-slate-400 uppercase">Status</label><div className="relative"><select value={viewingOrder.status} onChange={e => { onUpdateStatus(viewingOrder._id, e.target.value); setViewingOrder({...viewingOrder, status: e.target.value}); }} className={`w-full md:w-56 text-sm font-bold px-5 py-3.5 rounded-2xl border bg-white appearance-none outline-none ${getStatusColor(viewingOrder.status)} shadow-sm`}><option value="PENDING_WHATSAPP">Pending</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select><ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" /></div></div>
                  <div className="text-right bg-white p-6 rounded-3xl border border-rose-100/50 shadow-sm flex-grow md:flex-grow-0 min-w-[240px]"><div className="text-[10px] font-bold text-slate-400 uppercase">Total</div><div className="flex items-end justify-end gap-1"><span className="text-xl font-bold text-rose-500 mb-1.5">GH₵</span><span className="text-5xl font-black text-slate-900 tracking-tighter">{viewingOrder.totalPrice.toFixed(2)}</span></div></div>
                </div>
                <button onClick={() => setViewingOrder(null)} className="w-full py-5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-xl shadow-slate-200"><CheckCircle2 size={20} /> Complete Review</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
