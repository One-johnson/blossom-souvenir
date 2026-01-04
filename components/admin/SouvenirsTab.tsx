
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Package, Trash2, Plus, Search, Tag, Filter, ChevronDown, RotateCcw, 
  ArrowUpDown, Edit2, Loader2, Image as ImageIcon, Upload, X, 
  Sparkles, CheckCircle2, AlertTriangle, Eye, Clock, Calendar, 
  Hash, DollarSign, Layers, Info
} from 'lucide-react';
import { Skeleton } from '../Skeleton';
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

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    status: "AVAILABLE",
    stock: 10
  });

  useEffect(() => {
    if (autoStatus && form.stock === 0 && form.status !== "OUT_OF_STOCK") {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-rose-500" />
            Souvenirs ({allSouvenirs ? filteredAndSorted.length : '...'})
          </h2>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
              <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
              <div className="relative group/bulk">
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      onBulkUpdateStatus(Array.from(selectedIds), e.target.value);
                      setSelectedIds(new Set());
                      e.target.value = "";
                    }
                  }}
                  className="appearance-none bg-white border border-rose-100 text-[10px] font-bold uppercase tracking-widest pl-3 pr-8 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 shadow-sm cursor-pointer"
                >
                  <option value="">Update Status...</option>
                  <option value="AVAILABLE">Mark Available</option>
                  <option value="OUT_OF_STOCK">Mark Out of Stock</option>
                  <option value="PREORDER">Mark Pre-order</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button 
                onClick={() => { onBulkDelete(Array.from(selectedIds)); setSelectedIds(new Set()); }} 
                className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100 shadow-sm"
              >
                <Trash2 size={12} /> Delete Selected ({selectedIds.size})
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={handleOpenAdd} 
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95"
        >
          <Plus size={20} /> <span>Add New Item</span>
        </button>
      </div>

      <div className="bg-white p-5 rounded-[2.5rem] border border-rose-50 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name, description or ID..." 
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none outline-none text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-900 transition-all shadow-inner" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
          <div className="relative w-full sm:w-48">
            <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filterCat} 
              onChange={e => setFilterCat(e.target.value)} 
              className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-slate-50 border-none outline-none appearance-none cursor-pointer font-bold text-[10px] uppercase tracking-wider text-slate-500 focus:bg-white focus:ring-2 focus:ring-rose-500 shadow-inner"
            >
              <option value="All">All Categories</option>
              {allCategories?.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)} 
              className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-slate-50 border-none outline-none appearance-none cursor-pointer font-bold text-[10px] uppercase tracking-wider text-slate-500 focus:bg-white focus:ring-2 focus:ring-rose-500 shadow-inner"
            >
              <option value="All">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="PREORDER">Pre-order</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button 
            onClick={() => { setSearch(''); setFilterCat('All'); setFilterStatus('All'); setSort({ key: 'updatedAt', direction: 'desc' }); }} 
            className="p-3.5 bg-slate-50 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 group shadow-inner" 
            title="Clear Filters"
          >
            <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-rose-50 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-rose-50/30 border-b border-rose-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-6 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0} 
                    onChange={toggleSelectAll} 
                    className="rounded-lg border-slate-300 text-rose-500 focus:ring-rose-500" 
                  />
                </th>
                <th className="px-6 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setSort({ key: 'name', direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}>
                  <div className="flex items-center gap-2">Product <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6">Category</th>
                <th className="px-6 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setSort({ key: 'price', direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}>
                  <div className="flex items-center gap-2">Price <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setSort({ key: 'stock', direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}>
                  <div className="flex items-center gap-2">Stock <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setSort({ key: 'createdAt', direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}>
                  <div className="flex items-center gap-2">Date Added <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setSort({ key: 'updatedAt', direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}>
                  <div className="flex items-center gap-2">Last Update <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {allSouvenirs === undefined ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-6 py-5"><Skeleton className="h-14 w-full rounded-2xl" /></td></tr>
                ))
              ) : filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((s:any) => (
                  <tr key={s._id} className="hover:bg-rose-50/20 transition-all group animate-in fade-in duration-300">
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(s._id)} 
                        onChange={() => toggleSelectOne(s._id)} 
                        className="rounded-lg border-slate-300 text-rose-500 focus:ring-rose-500" 
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="relative w-12 h-12 shrink-0">
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover rounded-xl shadow-sm border border-rose-50" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate group-hover:text-rose-600 transition-colors">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">#{s._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-900 flex items-center gap-1 text-sm">
                        <span className="text-rose-400 text-[10px] font-bold">GH₵</span>
                        {s.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`font-bold text-xs ${s.stock < 5 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                        {s.stock} <span className="text-[9px] uppercase tracking-tighter text-slate-400 font-medium">units</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{new Date(s.updatedAt || s.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative w-fit">
                        <select 
                          value={s.status} 
                          onChange={(e) => onUpdateStatus(s._id, e.target.value)}
                          className={`appearance-none text-[9px] font-black px-4 py-2 rounded-full border outline-none focus:ring-4 focus:ring-rose-100 cursor-pointer transition-all shadow-sm ${getStatusStyles(s.status)}`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                          <option value="PREORDER">PRE-ORDER</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => setViewingSouvenir(s)} 
                          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(s)} 
                          className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                          title="Edit Product"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => onDelete(s)} 
                          disabled={pendingActionId === s._id} 
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Product"
                        >
                          {pendingActionId === s._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-rose-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                        <div className="relative w-28 h-28 bg-gradient-to-br from-rose-50 to-white rounded-[2rem] border-2 border-rose-100 flex items-center justify-center text-rose-200 shadow-xl">
                          <Search size={54} className="animate-bounce-slow" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-rose-50 flex items-center justify-center text-rose-400">
                          <Info size={20} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">No match found</h3>
                      <p className="text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed font-medium">
                        We couldn't find any souvenirs matching your filters. Try widening your search or clearing the categories.
                      </p>
                      <button 
                        onClick={() => { setSearch(''); setFilterCat('All'); setFilterStatus('All'); }} 
                        className="mt-8 bg-rose-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:-translate-y-1 shadow-lg shadow-rose-200 transition-all flex items-center gap-3"
                      >
                        <RotateCcw size={16} /> Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary Footer */}
        {filteredAndSorted.length > 0 && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-rose-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div>Showing {filteredAndSorted.length} items</div>
            <div className="flex items-center gap-4">
              <span>Managed by Admin Control</span>
              <div className="flex items-center gap-1.5 text-rose-400">
                <Sparkles size={12} /> Live Inventory
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Viewing Dialog */}
      {viewingSouvenir && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-8">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setViewingSouvenir(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-rose-100/50 animate-in zoom-in duration-300">
            <button 
              onClick={() => setViewingSouvenir(null)} 
              className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl z-20 shadow-lg border border-slate-100 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
            
            <div className="w-full md:w-[45%] h-72 md:h-auto shrink-0 overflow-hidden relative group">
              <img src={viewingSouvenir.image} alt={viewingSouvenir.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <div className={`text-[10px] font-black px-4 py-2 rounded-full border-2 uppercase tracking-widest shadow-2xl backdrop-blur-md ${getStatusStyles(viewingSouvenir.status)}`}>
                  {viewingSouvenir.status.replace('_', ' ')}
                </div>
              </div>
            </div>
            
            <div className="flex-grow p-12 flex flex-col overflow-y-auto scrollbar-hide bg-white">
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-rose-500">
                    <Tag size={16} className="fill-rose-500/10" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{viewingSouvenir.category}</span>
                  </div>
                  <h3 className="text-5xl font-serif font-black text-slate-900 leading-tight">{viewingSouvenir.name}</h3>
                </div>

                <div className="p-8 bg-rose-50/30 rounded-[2rem] border border-rose-50 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Info size={120} />
                  </div>
                  <label className="block text-[10px] font-black text-rose-400 uppercase tracking-widest">Story & Description</label>
                  <p className="text-slate-600 text-lg leading-relaxed italic font-serif">
                    "{viewingSouvenir.description}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-[2rem] space-y-2 border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign size={14} className="text-rose-500" /> Current Price
                    </label>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-slate-900">GH₵{viewingSouvenir.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] space-y-2 border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Layers size={14} className="text-rose-500" /> Stock Level
                    </label>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-slate-900">{viewingSouvenir.stock}</span>
                      <span className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Units</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-rose-100">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-12">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} className="text-rose-300" /> Date Added
                      </span>
                      <span className="text-sm font-bold text-slate-700">{new Date(viewingSouvenir.createdAt).toLocaleDateString()} at {new Date(viewingSouvenir.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} className="text-rose-300" /> Last Modified
                      </span>
                      <span className="text-sm font-bold text-slate-700">{new Date(viewingSouvenir.updatedAt || viewingSouvenir.createdAt).toLocaleDateString()} at {new Date(viewingSouvenir.updatedAt || viewingSouvenir.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} className="text-rose-300" /> Product Serial / ID
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 w-fit">{viewingSouvenir._id}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-12 flex gap-4">
                <button 
                  onClick={() => { setViewingSouvenir(null); handleOpenEdit(viewingSouvenir); }} 
                  className="flex-1 py-5 rounded-[1.5rem] bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-3 border border-transparent hover:border-rose-100"
                >
                  <Edit2 size={18} /> Edit Product
                </button>
                <button 
                  onClick={() => setViewingSouvenir(null)} 
                  className="flex-1 py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Close View
                </button>
              </div>
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
                <div>
                  <h3 className="text-3xl font-serif font-black text-slate-900">{isEditing ? 'Update Collection' : 'New Treasure'}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Add details about the new souvenir item</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                  <X />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
                 <div className="col-span-2">
                    <label className="block text-[10px] font-black mb-3 uppercase tracking-widest text-slate-400">Product Visuals</label>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="relative group/img w-full sm:w-44 h-44 shrink-0">
                        {previewUrl ? (
                          <div className="relative w-full h-full">
                            <img src={previewUrl} className="w-full h-full object-cover rounded-[2rem] border-4 border-rose-50 shadow-md" />
                            <div className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/20 transition-all rounded-[2rem] flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                               <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-slate-600 shadow-xl"><Upload size={16} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-slate-50 rounded-[2rem] border-4 border-dashed border-rose-50 flex items-center justify-center text-rose-200">
                            <ImageIcon size={40} />
                          </div>
                        )}
                        {isGeneratingImage && (
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center gap-3">
                            <Loader2 className="animate-spin text-rose-500" size={32} />
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-pulse">Designing...</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 flex-grow justify-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            className="flex-grow border-2 border-dashed border-rose-100 p-6 rounded-3xl flex flex-col items-center justify-center text-rose-500 hover:bg-rose-50 transition-all gap-2 bg-rose-50/10 group/up"
                          >
                            <Upload size={24} className="group-hover/up:-translate-y-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Photo</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={handleGenerateAiImage} 
                            disabled={isGeneratingImage || !form.name} 
                            className="flex-grow border-2 border-dashed border-amber-100 p-6 rounded-3xl flex flex-col items-center justify-center text-amber-500 hover:bg-amber-50 transition-all gap-2 bg-amber-50/10 disabled:opacity-50 group/ai"
                          >
                            {isGeneratingImage ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} className="group-hover/ai:rotate-12 transition-transform" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">AI Generate</span>
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold leading-relaxed px-1">
                          Tip: Use high-quality images. The AI generator works best if you've already filled out the name and description.
                        </p>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>
                 </div>

                 <div className="col-span-2">
                    <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">Souvenir Name</label>
                    <input 
                      required 
                      placeholder="e.g. Vintage Floral Tea Set" 
                      className="w-full px-6 py-4 rounded-2xl border border-rose-50 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-rose-100 text-slate-900 transition-all font-bold" 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                    />
                 </div>

                 <div className="col-span-2">
                    <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">Tale & Description</label>
                    <textarea 
                      required 
                      placeholder="Describe the artisan spirit and materials..." 
                      className="w-full px-6 py-4 rounded-2xl border border-rose-50 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-rose-100 h-28 resize-none text-slate-900 transition-all font-medium leading-relaxed" 
                      value={form.description} 
                      onChange={e => setForm({...form, description: e.target.value})} 
                    />
                 </div>

                 <div className="relative">
                    <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">Price (GH₵)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-300 font-bold">GH₵</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full pl-16 pr-6 py-4 rounded-2xl border border-rose-50 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-rose-100 text-slate-900 transition-all font-black" 
                        value={form.price} 
                        onChange={e => setForm({...form, price: Number(e.target.value)})} 
                      />
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Units</label>
                        <button 
                          type="button" 
                          onClick={() => setAutoStatus(!autoStatus)} 
                          className={`text-[9px] font-black px-2 py-0.5 rounded-lg transition-all ${autoStatus ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}
                        >
                            Auto-Status {autoStatus ? 'Active' : 'Off'}
                        </button>
                    </div>
                    <input 
                      type="number" 
                      className="w-full px-6 py-4 rounded-2xl border border-rose-50 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-rose-100 text-slate-900 transition-all font-black" 
                      value={form.stock} 
                      onChange={e => setForm({...form, stock: Math.max(0, Number(e.target.value))})} 
                    />
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Tag</label>
                      <button type="button" onClick={() => setIsAddingNewCategory(!isAddingNewCategory)} className="text-[9px] font-black text-rose-500 hover:underline uppercase tracking-widest">
                        {isAddingNewCategory ? 'Back to list' : '+ Add New'}
                      </button>
                    </div>
                    {isAddingNewCategory ? (
                      <input 
                        required 
                        className="w-full px-6 py-4 rounded-2xl border border-rose-100 bg-rose-50/30 outline-none focus:bg-white focus:ring-4 focus:ring-rose-100 text-slate-900 transition-all font-bold placeholder:text-rose-200" 
                        placeholder="Enter name..." 
                        value={form.category} 
                        onChange={e => setForm({...form, category: e.target.value})} 
                      />
                    ) : (
                      <div className="relative">
                        <select 
                          className="w-full px-6 py-4 rounded-2xl border border-rose-50 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-rose-100 text-slate-900 appearance-none cursor-pointer font-bold transition-all" 
                          value={form.category} 
                          onChange={e => setForm({...form, category: e.target.value})}
                        >
                          <option value="" disabled>Select category</option>
                          {allCategories?.map((c:any) => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      </div>
                    )}
                 </div>

                 <div>
                    <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">Current Status</label>
                    <div className="relative">
                      <select 
                        className={`w-full px-6 py-4 rounded-2xl border border-rose-50 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-rose-100 text-slate-900 appearance-none cursor-pointer transition-all font-black ${form.status === 'OUT_OF_STOCK' ? 'text-red-500' : (form.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-blue-600')}`} 
                        value={form.status} 
                        onChange={e => setForm({...form, status: e.target.value})}
                        disabled={autoStatus && form.stock === 0}
                      >
                          <option value="AVAILABLE">Available</option>
                          <option value="OUT_OF_STOCK">Out of Stock</option>
                          <option value="PREORDER">Pre-order</option>
                      </select>
                      {autoStatus && form.stock === 0 ? (
                        <AlertTriangle size={18} className="absolute right-12 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none" />
                      ) : (
                        <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      )}
                    </div>
                 </div>

                 <button 
                  disabled={isSaving || isGeneratingImage} 
                  type="submit" 
                  className="col-span-2 mt-4 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 shadow-2xl shadow-slate-200 disabled:opacity-50 transition-all active:scale-95"
                 >
                   {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                   {isEditing ? 'Sync with Collection' : 'Add to Collection'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
