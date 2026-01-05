import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Package, Trash2, Plus, Search, Tag, Filter, ChevronDown, RotateCcw, 
  ArrowUpDown, Edit2, Loader2, Image as ImageIcon, Upload, X, 
  Sparkles, CheckCircle2, AlertTriangle, Eye, Clock, Calendar, 
  Hash, DollarSign, Layers, Info, Star, MessageSquare
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Skeleton } from '../Skeleton';
import { ConfirmDialog } from '../ConfirmDialog';
import { generateSouvenirImage } from '../../services/gemini';

interface SouvenirsTabProps {
  allSouvenirs: any[] | undefined;
  allCategories: any[] | undefined;
  onSave: (formData: any, file: File | null, isEditing: string | null) => Promise<void>;
  onUpdateStatus: (id: string, status: string) => void;
  onBulkUpdateStatus: (ids: string[], status: string) => void;
  onDelete: (s: any) => void;
  onBulkDelete: (ids: string[]) => void;
  pendingActionId: string | null;
  isSaving: boolean;
}

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10';
    case 'OUT_OF_STOCK': return 'bg-red-50 text-red-600 border-red-100 ring-red-500/10';
    case 'PREORDER': return 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/10';
    case 'SOLD': return 'bg-slate-900 text-white border-slate-900 ring-slate-900/10';
    default: return 'bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/10';
  }
};

export const SouvenirsTab: React.FC<SouvenirsTabProps> = ({ 
  allSouvenirs, allCategories, onSave, onUpdateStatus, onBulkUpdateStatus, onDelete, onBulkDelete, pendingActionId, isSaving 
}) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showModal, setShowModal] = useState(false);
  const [viewingSouvenir, setViewingSouvenir] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [autoStatus, setAutoStatus] = useState(true);

  // Fetch reviews for the currently viewed souvenir
  const viewingReviews = useQuery(api.reviews.listBySouvenir, viewingSouvenir ? { souvenirId: viewingSouvenir._id } : "skip");

  const [statusConfirm, setStatusConfirm] = useState<{ 
    isOpen: boolean; 
    ids: string[]; 
    status: string; 
    message: string;
    isBulk: boolean;
  } | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    status: "AVAILABLE",
    stock: 10
  });

  useEffect(() => {
    if (autoStatus && form.stock === 0 && form.status !== "OUT_OF_STOCK" && form.status !== "SOLD") {
      setForm(prev => ({ ...prev, status: "OUT_OF_STOCK" }));
    } else if (autoStatus && form.stock > 0 && form.status === "OUT_OF_STOCK") {
      setForm(prev => ({ ...prev, status: "AVAILABLE" }));
    }
  }, [form.stock, autoStatus]);

  const filteredAndSorted = useMemo(() => {
    if (!allSouvenirs) return [];
    let result = [...allSouvenirs];
    if (search) {
      const low = search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(low) || 
        s.description.toLowerCase().includes(low) ||
        s._id.toLowerCase().includes(low)
      );
    }
    if (filterCat !== 'All') result = result.filter(s => s.category === filterCat);
    if (filterStatus !== 'All') result = result.filter(s => s.status === filterStatus);
    if (sort) {
      result.sort((a, b) => {
        const aVal = a[sort.key as keyof typeof a];
        const bVal = b[sort.key as keyof typeof b];
        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [allSouvenirs, search, filterCat, filterStatus, sort]);

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSorted.map(s => s._id)));
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsAddingNewCategory(false);
    setForm({ name: '', description: '', price: 0, category: allCategories?.[0]?.name || '', status: "AVAILABLE", stock: 10 });
    setShowModal(true);
  };

  const handleOpenEdit = (s: any) => {
    setIsEditing(s._id);
    setSelectedFile(null);
    setPreviewUrl(s.image);
    setIsAddingNewCategory(false);
    setForm({ 
      name: s.name, 
      description: s.description, 
      price: s.price, 
      category: s.category, 
      status: s.status, 
      stock: s.stock 
    });
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerateAiImage = async () => {
    if (!form.name || !form.description) {
      alert("Please provide a name and description first to guide the AI.");
      return;
    }
    setIsGeneratingImage(true);
    try {
      const dataUrl = await generateSouvenirImage(form.name, form.description);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "ai-generated.png", { type: "image/png" });
      setSelectedFile(file);
      setPreviewUrl(dataUrl);
    } catch (e) { console.error(e); } finally { setIsGeneratingImage(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form, selectedFile, isEditing);
    setShowModal(false);
  };

  const confirmStatusChange = (id: string, status: string, productName: string) => {
    setStatusConfirm({
      isOpen: true,
      ids: [id],
      status: status,
      isBulk: false,
      message: `Change the status of "${productName}" to ${status.replace('_', ' ')}?`
    });
  };

  const handleConfirmedStatusUpdate = () => {
    if (!statusConfirm) return;
    if (statusConfirm.isBulk) {
      onBulkUpdateStatus(statusConfirm.ids, statusConfirm.status);
      setSelectedIds(new Set());
    } else {
      onUpdateStatus(statusConfirm.ids[0], statusConfirm.status);
    }
    setStatusConfirm(null);
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog 
        isOpen={statusConfirm?.isOpen || false}
        title={statusConfirm?.isBulk ? "Bulk Update" : "Update Status"}
        message={statusConfirm?.message || ""}
        confirmLabel="Update"
        onConfirm={handleConfirmedStatusUpdate}
        onClose={() => setStatusConfirm(null)}
        type={statusConfirm?.status === 'SOLD' ? 'warning' : 'info'}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-rose-500" />
            Inventory ({allSouvenirs ? filteredAndSorted.length : '...'})
          </h2>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    setStatusConfirm({
                      isOpen: true,
                      ids: Array.from(selectedIds),
                      status: e.target.value,
                      isBulk: true,
                      message: `Update ${selectedIds.size} items to ${e.target.value.replace('_', ' ')}?`
                    });
                    e.target.value = "";
                  }
                }}
                className="bg-white border border-rose-100 text-[10px] font-bold uppercase tracking-widest pl-3 pr-8 py-2.5 rounded-xl outline-none"
              >
                <option value="">Update Status...</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="SOLD">SOLD OUT</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
              </select>
              <button 
                onClick={() => { onBulkDelete(Array.from(selectedIds)); setSelectedIds(new Set()); }} 
                className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest"
              >
                Delete Selected ({selectedIds.size})
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={handleOpenAdd} 
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95"
        >
          <Plus size={20} /> <span>New Product</span>
        </button>
      </div>

      <div className="bg-white p-5 rounded-[2.5rem] border border-rose-50 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none outline-none text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-900 transition-all shadow-inner" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
          <select 
            value={filterCat} 
            onChange={e => setFilterCat(e.target.value)} 
            className="w-full sm:w-48 pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[10px] uppercase tracking-wider text-slate-500 focus:bg-white shadow-inner appearance-none"
          >
            <option value="All">All Categories</option>
            {allCategories?.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
          </select>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)} 
            className="w-full sm:w-48 pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[10px] uppercase tracking-wider text-slate-500 focus:bg-white shadow-inner appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="SOLD">SOLD</option>
            <option value="OUT_OF_STOCK">OUT OF STOCK</option>
            <option value="PREORDER">PRE-ORDER</option>
          </select>
          <button 
            onClick={() => { setSearch(''); setFilterCat('All'); setFilterStatus('All'); setSort({ key: 'updatedAt', direction: 'desc' }); }} 
            className="p-3.5 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 group shadow-inner" 
          >
            <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-rose-50 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-rose-50/30 border-b border-rose-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-6 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0} onChange={toggleSelectAll} className="rounded-lg border-slate-300 text-rose-500" />
                </th>
                <th className="px-6 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setSort({ key: 'name', direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}>
                  <div className="flex items-center gap-2">Product <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6">Category</th>
                <th className="px-6 py-6 cursor-pointer" onClick={() => setSort({ key: 'price', direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}>Price <ArrowUpDown size={12} /></th>
                <th className="px-6 py-6 cursor-pointer" onClick={() => setSort({ key: 'stock', direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}>Stock <ArrowUpDown size={12} /></th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {allSouvenirs === undefined ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-5"><Skeleton className="h-14 w-full rounded-2xl" /></td></tr>
                ))
              ) : filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((s:any) => (
                  <tr 
                    key={s._id} 
                    onClick={() => setViewingSouvenir(s)}
                    className="hover:bg-rose-50/20 transition-all group cursor-pointer animate-in fade-in duration-300"
                  >
                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(s._id)} onChange={() => toggleSelectOne(s._id)} className="rounded-lg border-slate-300 text-rose-500" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <img src={s.image} alt={s.name} className="w-12 h-12 shrink-0 object-cover rounded-xl border border-rose-50" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate group-hover:text-rose-600 transition-colors">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">#{s._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200">{s.category}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-900 text-sm">GH₵{s.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`font-bold text-xs ${s.stock < 5 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>{s.stock} units</div>
                    </td>
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={s.status} 
                        onChange={(e) => confirmStatusChange(s._id, e.target.value, s.name)}
                        className={`appearance-none text-[9px] font-black px-4 py-2 rounded-full border cursor-pointer outline-none ${getStatusStyles(s.status)}`}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="SOLD">SOLD OUT</option>
                        <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                        <option value="PREORDER">PRE-ORDER</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setViewingSouvenir(s)} className="p-2 text-slate-400 hover:text-rose-500"><Eye size={18} /></button>
                        <button onClick={() => handleOpenEdit(s)} className="p-2 text-slate-400 hover:text-slate-700"><Edit2 size={18} /></button>
                        <button onClick={() => onDelete(s)} disabled={pendingActionId === s._id} className="p-2 text-slate-400 hover:text-red-500">{pendingActionId === s._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="py-32 text-center text-slate-400 font-medium italic">No catalog entries match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Product Details Dialog */}
      {viewingSouvenir && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-8">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setViewingSouvenir(null)}></div>
          <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-rose-100/50 animate-in zoom-in duration-300">
            <button onClick={() => setViewingSouvenir(null)} className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 rounded-2xl z-[160] shadow-lg transition-all hover:rotate-90"><X size={20} /></button>
            
            {/* Image Panel */}
            <div className="w-full md:w-[45%] h-72 md:h-full shrink-0 relative overflow-hidden">
              <img src={viewingSouvenir.image} alt={viewingSouvenir.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-10 left-10 space-y-4">
                <div className={`inline-flex text-[10px] font-black px-6 py-2.5 rounded-full border-2 uppercase tracking-widest shadow-2xl backdrop-blur-md ${getStatusStyles(viewingSouvenir.status)}`}>
                  {viewingSouvenir.status.replace('_', ' ')}
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/20">
                  <Layers size={16} />
                  <span className="text-sm font-bold">{viewingSouvenir.stock} in stock</span>
                </div>
              </div>
            </div>

            {/* Content Panel */}
            <div className="flex-grow flex flex-col bg-white overflow-hidden relative">
              <div className="flex-grow overflow-y-auto px-10 py-16 space-y-12 scrollbar-hide">
                
                {/* Header & Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-rose-500">
                    <Tag size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{viewingSouvenir.category}</span>
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">{viewingSouvenir.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                      <Star size={16} className="fill-amber-500 text-amber-500" />
                      <span className="text-sm font-black text-amber-600">{viewingSouvenir.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      {viewingSouvenir.reviewCount || 0} customer reviews
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Story & Description</h4>
                   <div className="p-8 bg-rose-50/30 rounded-[2.5rem] border border-rose-50 relative">
                     <p className="text-slate-600 text-xl leading-relaxed italic font-serif">
                       "{viewingSouvenir.description}"
                     </p>
                   </div>
                </div>

                {/* Technical Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:border-rose-200 transition-colors">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <DollarSign size={12} /> Unit Price
                    </label>
                    <span className="text-4xl font-black text-slate-900 tracking-tight">GH₵{viewingSouvenir.price.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:border-rose-200 transition-colors">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <Hash size={12} /> Catalog ID
                    </label>
                    <span className="text-xl font-mono font-bold text-slate-500 truncate block">#{viewingSouvenir._id}</span>
                  </div>
                </div>

                {/* Reviews Summary Section */}
                <div className="space-y-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                     <h4 className="text-2xl font-black tracking-tight flex items-center gap-3">
                       <MessageSquare size={24} className="text-rose-500" /> 
                       Product Reviews
                     </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {viewingReviews === undefined ? (
                      <Skeleton className="h-24 w-full rounded-3xl" />
                    ) : viewingReviews.length > 0 ? (
                      viewingReviews.map((rev: any) => (
                        <div key={rev._id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] space-y-3">
                           <div className="flex justify-between items-center">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-500 flex items-center justify-center font-black text-[10px]">
                                 {rev.userName.charAt(0)}
                               </div>
                               <p className="font-bold text-sm text-slate-800">{rev.userName}</p>
                             </div>
                             <div className="flex gap-0.5">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={10} className={i < rev.rating ? 'fill-rose-500 text-rose-500' : 'text-slate-200'} />
                               ))}
                             </div>
                           </div>
                           <p className="text-slate-600 text-sm italic font-serif leading-relaxed">"{rev.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                        <p className="text-slate-400 text-sm font-medium italic">No customer feedback yet for this piece.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-12 flex gap-4">
                  <button 
                    onClick={() => { setViewingSouvenir(null); handleOpenEdit(viewingSouvenir); }} 
                    className="flex-1 py-6 rounded-[2rem] bg-slate-100 text-slate-800 font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Edit2 size={18} /> Modify Entry
                  </button>
                  <button 
                    onClick={() => setViewingSouvenir(null)} 
                    className="flex-1 py-6 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                  >
                    Close Directory
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto">
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowModal(false)}></div>
           <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300 border border-rose-50">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-serif font-black text-slate-900">{isEditing ? 'Sync Item' : 'New Treasure'}</h3>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"><X /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
                 <div className="col-span-2">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-44 h-44 shrink-0 bg-slate-50 rounded-[2rem] border-4 border-dashed border-rose-50 overflow-hidden relative">
                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-rose-200"><ImageIcon size={40} /></div>}
                        {isGeneratingImage && <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center"><Loader2 className="animate-spin text-rose-500" size={32} /></div>}
                      </div>
                      <div className="flex flex-col gap-3 flex-grow justify-center">
                        <div className="grid grid-cols-2 gap-3 w-full">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-rose-100 p-6 rounded-3xl text-rose-500 hover:bg-rose-50 flex flex-col items-center gap-2 transition-all active:scale-95"><Upload size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Upload</span></button>
                          <button type="button" onClick={handleGenerateAiImage} disabled={isGeneratingImage || !form.name} className="border-2 border-dashed border-amber-100 p-6 rounded-3xl text-amber-500 hover:bg-amber-50 flex flex-col items-center gap-2 disabled:opacity-50 transition-all active:scale-95"><Sparkles size={24} /><span className="text-[10px] font-black uppercase tracking-widest">AI Create</span></button>
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
                    <input required placeholder="Boutique Name" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-rose-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tale & Essence</label>
                    <textarea required placeholder="Story of the piece..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-rose-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium h-28 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (GH₵)</label>
                    <input type="number" step="0.01" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-rose-50 focus:bg-white outline-none font-black" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</label>
                    <input type="number" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-rose-50 focus:bg-white outline-none font-black" value={form.stock} onChange={e => setForm({...form, stock: Math.max(0, Number(e.target.value))})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-rose-50 outline-none font-bold appearance-none cursor-pointer" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {allCategories?.map((c:any) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                    <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-rose-50 outline-none font-black appearance-none cursor-pointer" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="SOLD">SOLD OUT</option>
                        <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                        <option value="PREORDER">PRE-ORDER</option>
                    </select>
                 </div>
                 <button disabled={isSaving || isGeneratingImage} type="submit" className="col-span-2 mt-4 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98]">
                   {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                   {isEditing ? 'Update Collection' : 'Add to Collection'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};