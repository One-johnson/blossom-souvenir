
import React, { useState } from 'react';
import { Users, Package, ShoppingCart, BarChart3, Tag, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DashboardTab } from '../components/admin/DashboardTab';
import { UsersTab } from '../components/admin/UsersTab';
import { CategoriesTab } from '../components/admin/CategoriesTab';
import { SouvenirsTab } from '../components/admin/SouvenirsTab';
import { OrdersTab } from '../components/admin/OrdersTab';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'souvenirs' | 'orders' | 'categories'>('dashboard');
  
  const allUsers = useQuery(api.users.list);
  const allSouvenirs = useQuery(api.souvenirs.list);
  const allOrders = useQuery(api.orders.listAll);
  const allCategories = useQuery(api.categories.list);

  const updateStatus = useMutation(api.users.updateStatus);
  const createSouvenir = useMutation(api.souvenirs.create);
  const updateSouvenir = useMutation(api.souvenirs.update);
  const updateSouvenirStatus = useMutation(api.souvenirs.updateStatus);
  const updateSouvenirStatuses = useMutation(api.souvenirs.updateStatuses);
  const removeSouvenir = useMutation(api.souvenirs.remove);
  const removeManySouvenirs = useMutation(api.souvenirs.removeMany);
  const createCategory = useMutation(api.categories.create);
  const removeCategory = useMutation(api.categories.remove);
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);

  const updateOrderStatus = useMutation(api.orders.updateStatus);
  const updateOrderStatuses = useMutation(api.orders.updateStatuses);
  const removeOrder = useMutation(api.orders.remove);
  const removeManyOrders = useMutation(api.orders.removeMany);

  const [isSaving, setIsSaving] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning'
  });

  const confirmUserStatus = (user: any, status: 'APPROVED' | 'REJECTED') => {
    setDialogConfig({
      isOpen: true, title: `${status === 'APPROVED' ? 'Approve' : 'Reject'} User?`, message: `Confirm ${status.toLowerCase()} for ${user.name}?`,
      confirmLabel: status === 'APPROVED' ? 'Approve' : 'Reject', type: status === 'APPROVED' ? 'info' : 'danger',
      onConfirm: async () => { setPendingActionId(user._id); await updateStatus({ id: user._id, status }); setPendingActionId(null); }
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;

    // Prevent duplicate category names
    const exists = allCategories?.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert(`The category "${name}" already exists.`);
      return;
    }

    setIsSaving(true);
    await createCategory({ name });
    setNewCatName('');
    setIsSaving(false);
  };

  const confirmRemoveCategory = (cat: any) => {
    // Check for associated souvenirs to provide a clear warning
    const associatedCount = allSouvenirs?.filter(s => s.category === cat.name).length || 0;
    
    const warningMessage = associatedCount > 0 
      ? `Warning: There are ${associatedCount} souvenirs assigned to "${cat.name}". If you delete this category, they will be automatically moved to "Uncategorized". Do you want to proceed?`
      : `Are you sure you want to delete the category "${cat.name}"?`;

    setDialogConfig({
      isOpen: true, 
      title: 'Remove Category?', 
      message: warningMessage, 
      confirmLabel: associatedCount > 0 ? 'Reassign & Delete' : 'Delete', 
      type: associatedCount > 0 ? 'warning' : 'danger',
      onConfirm: async () => { 
        setPendingActionId(cat._id); 
        await removeCategory({ id: cat._id }); 
        setPendingActionId(null); 
      }
    });
  };

  const handleSaveSouvenir = async (formData: any, file: File | null, isEditing: string | null) => {
    setIsSaving(true);
    try {
      // 1. Handle potential new category creation
      const categoryExists = allCategories?.some(c => c.name.toLowerCase() === formData.category.toLowerCase());
      
      if (!categoryExists && formData.category) {
        // Create the category if it doesn't exist (handle-on-the-fly)
        await createCategory({ name: formData.category });
      }

      // 2. Handle image upload if a new file is provided
      let storageId = isEditing ? (allSouvenirs || []).find((s:any) => s._id === isEditing)?.storageId : null;
      if (file) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
        const { storageId: newId } = await result.json();
        storageId = newId;
      }

      if (!storageId) { 
        alert("Image required"); 
        setIsSaving(false); 
        return; 
      }

      // 3. Save or update the souvenir
      const data = { 
        ...formData, 
        image: storageId, 
        status: formData.stock === 0 ? "OUT_OF_STOCK" : formData.status 
      };

      if (isEditing) {
        await updateSouvenir({ id: isEditing as any, updates: data });
      } else {
        await createSouvenir(data as any);
      }
    } catch (e) { 
      console.error(e); 
      alert("An error occurred while saving. Please try again.");
    } finally { 
      setIsSaving(false); 
    }
  };

  const confirmDeleteSouvenir = (s: any) => {
    setDialogConfig({
      isOpen: true, title: 'Delete Item?', message: `Delete "${s.name}" permanently?`, confirmLabel: 'Delete', type: 'danger',
      onConfirm: async () => { setPendingActionId(s._id); await removeSouvenir({ id: s._id }); setPendingActionId(null); }
    });
  };

  const confirmDeleteOrder = (id: string) => {
    setDialogConfig({
      isOpen: true, title: 'Delete Order?', message: 'Confirm order removal?', confirmLabel: 'Delete', type: 'danger',
      onConfirm: async () => { setPendingActionId(id); await removeOrder({ id: id as any }); setPendingActionId(null); }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen text-slate-900">
      <ConfirmDialog 
        isOpen={dialogConfig.isOpen} title={dialogConfig.title} message={dialogConfig.message} confirmLabel={dialogConfig.confirmLabel} type={dialogConfig.type} 
        onConfirm={dialogConfig.onConfirm} onClose={() => setDialogConfig({...dialogConfig, isOpen: false})}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div><h1 className="text-4xl font-bold mb-2">Admin Panel</h1><p className="text-slate-500">Manage the blossom shop.</p></div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-rose-50 overflow-x-auto">
          {(['dashboard', 'users', 'categories', 'souvenirs', 'orders'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-rose-500 text-white shadow-md' : 'text-slate-600 hover:bg-rose-50'}`}>
              {tab === 'dashboard' && <BarChart3 size={18} />}
              {tab === 'users' && <Users size={18} />}
              {tab === 'categories' && <Tag size={18} />}
              {tab === 'souvenirs' && <Package size={18} />}
              {tab === 'orders' && <ShoppingCart size={18} />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && <DashboardTab allOrders={allOrders} allSouvenirs={allSouvenirs} allUsers={allUsers} />}
      {activeTab === 'users' && <UsersTab allUsers={allUsers} onUpdateStatus={confirmUserStatus} pendingActionId={pendingActionId} />}
      {activeTab === 'categories' && <CategoriesTab allCategories={allCategories} allSouvenirs={allSouvenirs} newCatName={newCatName} setNewCatName={setNewCatName} onAddCategory={handleAddCategory} onRemoveCategory={confirmRemoveCategory} isSaving={isSaving} pendingActionId={pendingActionId} />}
      {activeTab === 'souvenirs' && (
        <SouvenirsTab 
          allSouvenirs={allSouvenirs} 
          allCategories={allCategories} 
          onSave={handleSaveSouvenir} 
          onUpdateStatus={(id, status) => updateSouvenirStatus({ id: id as any, status })}
          onBulkUpdateStatus={(ids, status) => updateSouvenirStatuses({ ids: ids as any[], status })}
          onDelete={confirmDeleteSouvenir} 
          onBulkDelete={ids => removeManySouvenirs({ ids: ids as any[] })} 
          pendingActionId={pendingActionId} 
          isSaving={isSaving} 
        />
      )}
      {activeTab === 'orders' && <OrdersTab allOrders={allOrders} onUpdateStatus={(id, s) => updateOrderStatus({ id: id as any, status: s })} onBulkUpdateStatus={(ids, s) => updateOrderStatuses({ ids: ids as any[], status: s })} onDelete={confirmDeleteOrder} onBulkDelete={ids => removeManyOrders({ ids: ids as any[] })} pendingActionId={pendingActionId} isSaving={isSaving} />}
    </div>
  );
};
