
import React, { useMemo } from 'react';
import { Tag, Plus, Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { Skeleton } from '../Skeleton';

interface CategoriesTabProps {
  allCategories: any[] | undefined;
  allSouvenirs: any[] | undefined;
  newCatName: string;
  setNewCatName: (name: string) => void;
  onAddCategory: (e: React.FormEvent) => void;
  onRemoveCategory: (cat: any) => void;
  isSaving: boolean;
  pendingActionId: string | null;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ 
  allCategories, allSouvenirs, newCatName, setNewCatName, onAddCategory, onRemoveCategory, isSaving, pendingActionId 
}) => {
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!allSouvenirs) return counts;
    allSouvenirs.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [allSouvenirs]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-rose-50 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Manage Categories</h2>
        <p className="text-slate-400 text-sm mb-8 uppercase tracking-widest font-bold">Organize your shop collection</p>
        
        <form onSubmit={onAddCategory} className="flex gap-4 mb-8">
          <div className="relative flex-grow">
            <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              required 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-rose-50 bg-slate-50 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 transition-all" 
              placeholder="e.g. Handmade Ceramics" 
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <button disabled={isSaving} type="submit" className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-rose-600 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-100">
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} Add
          </button>
        </form>

        <div className="space-y-3">
          {allCategories === undefined ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
          ) : allCategories.length > 0 ? allCategories.map((cat:any) => {
            const itemCount = categoryCounts[cat.name] || 0;
            return (
              <div key={cat._id} className="group flex items-center justify-between p-4 pl-6 rounded-2xl bg-white border border-rose-50 hover:border-rose-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500">
                    <Tag size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">{cat.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <ShoppingBag size={10} /> {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveCategory(cat)}
                  disabled={pendingActionId === cat._id}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                  title={itemCount > 0 ? `Reassign ${itemCount} items to Uncategorized and delete` : 'Delete category'}
                >
                  {pendingActionId === cat._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                </button>
              </div>
            );
          }) : (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-rose-50 rounded-3xl">
              <Tag size={40} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No categories created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
