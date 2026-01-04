
import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Shield, Clock, UserCheck, UserX, 
  Loader2, ArrowUpDown, ChevronDown, RotateCcw, Calendar, 
  Mail, Info, Inbox, CheckCircle2, AlertCircle, MoreHorizontal,
  UserPlus, Fingerprint, Trash2, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { Skeleton } from '../Skeleton';
import { UserRole, UserStatus } from '../../types';

interface UsersTabProps {
  allUsers: any[] | undefined;
  onUpdateStatus: (user: any, status: 'APPROVED' | 'REJECTED') => void;
  onUpdateRole: (user: any, role: UserRole) => void;
  onDeleteUser: (user: any) => void;
  pendingActionId: string | null;
}

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

export const UsersTab: React.FC<UsersTabProps> = ({ 
  allUsers, onUpdateStatus, onUpdateRole, onDeleteUser, pendingActionId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sort, setSort] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  const { pendingUsers, filteredAndSorted } = useMemo(() => {
    if (!allUsers) return { pendingUsers: [], filteredAndSorted: [] };
    
    const pending = allUsers.filter(u => u.status === UserStatus.PENDING);
    
    let result = [...allUsers];

    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(low) || 
        u.email.toLowerCase().includes(low) ||
        u._id.toLowerCase().includes(low)
      );
    }

    if (roleFilter !== 'All') result = result.filter(u => u.role === roleFilter);
    if (statusFilter !== 'All') result = result.filter(u => u.status === statusFilter);

    if (sort) {
      result.sort((a, b) => {
        const aVal = a[sort.key as keyof typeof a];
        const bVal = b[sort.key as keyof typeof b];
        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return { pendingUsers: pending, filteredAndSorted: result };
  }, [allUsers, searchTerm, roleFilter, statusFilter, sort]);

  const handleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10';
      case 'PENDING': return 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100 ring-red-500/10';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('All');
    setStatusFilter('All');
    setSort({ key: 'createdAt', direction: 'desc' });
  };

  const isLoading = allUsers === undefined;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Pending Approvals Summary */}
      {!isLoading && pendingUsers.length > 0 && (
        <div className="bg-gradient-to-br from-rose-50 to-white p-8 rounded-[3rem] border border-rose-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 p-12 text-rose-100/30 group-hover:rotate-12 transition-transform duration-1000">
            <UserPlus size={180} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-rose-600">
                <Shield size={20} />
                <h3 className="text-xl font-black tracking-tight">Access Requests</h3>
              </div>
              <p className="text-slate-500 text-sm font-medium">There are <span className="text-rose-600 font-bold">{pendingUsers.length}</span> users awaiting your approval.</p>
            </div>
            <button 
              onClick={() => { setStatusFilter(UserStatus.PENDING); setSearchTerm(''); }}
              className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all active:scale-95"
            >
              Review Requests Now
            </button>
          </div>
        </div>
      )}

      {/* Sticky Controls Section */}
      <div className="sticky top-[4.5rem] z-[45] -mx-4 px-4 py-2 bg-slate-50/80 backdrop-blur-lg">
        <div className="bg-white p-4 rounded-[2.5rem] border border-rose-50 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full lg:w-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm focus:bg-white focus:ring-4 focus:ring-rose-500/10 text-slate-900 transition-all shadow-inner font-medium" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
            <div className="relative w-full sm:w-44">
              <Shield size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={roleFilter} 
                onChange={e => setRoleFilter(e.target.value)} 
                className="w-full pl-10 pr-10 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none cursor-pointer font-black text-[9px] uppercase tracking-widest text-slate-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 shadow-inner"
              >
                <option value="All">All Roles</option>
                <option value={UserRole.ADMIN}>Admins</option>
                <option value={UserRole.CUSTOMER}>Customers</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-44">
              <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="w-full pl-10 pr-10 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none cursor-pointer font-black text-[9px] uppercase tracking-widest text-slate-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 shadow-inner"
              >
                <option value="All">All Statuses</option>
                <option value={UserStatus.APPROVED}>Approved</option>
                <option value={UserStatus.PENDING}>Pending</option>
                <option value={UserStatus.REJECTED}>Rejected</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button 
              onClick={resetFilters} 
              className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 group shadow-inner" 
              title="Clear Filters"
            >
              <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[3rem] border border-rose-50 shadow-sm overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-rose-50/95 backdrop-blur-md">
              <tr className="border-b border-rose-100 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                <th className="px-10 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">User Profile <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-2">Email Address <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6">Privileges</th>
                <th className="px-6 py-6 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-2">Joined <ArrowUpDown size={12} className="opacity-50" /></div>
                </th>
                <th className="px-6 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-10 py-6"><Skeleton className="h-16 w-full rounded-2xl" /></td></tr>
                ))
              ) : filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((user: any) => (
                  <tr key={user._id} className="hover:bg-rose-50/20 transition-all group animate-in fade-in duration-300">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-lg border-2 border-white shadow-md shrink-0 transition-transform group-hover:scale-105 duration-500 ${
                          user.role === UserRole.ADMIN ? 'bg-slate-900 text-white' : 'bg-rose-100 text-rose-500'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-base truncate group-hover:text-rose-600 transition-colors">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <Fingerprint size={10} className="text-rose-200" /> #{user._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                        <Mail size={14} className="text-rose-300" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] ${
                        user.role === UserRole.ADMIN 
                          ? 'bg-slate-900 text-white border-slate-900' 
                          : 'bg-white text-slate-500 border-slate-200 shadow-sm'
                      }`}>
                        {user.role === UserRole.ADMIN ? <Shield size={10} /> : <Users size={10} />}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Calendar size={12} className="text-rose-300" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[9px] font-black px-4 py-2 rounded-full border uppercase tracking-widest shadow-sm backdrop-blur-md ${getStatusStyles(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {user.status === UserStatus.PENDING ? (
                          <>
                            <button 
                              onClick={() => onUpdateStatus(user, "APPROVED")}
                              disabled={pendingActionId === user._id}
                              className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100 flex items-center justify-center active:scale-90"
                              title="Approve User"
                            >
                              {pendingActionId === user._id ? <Loader2 className="animate-spin" size={16} /> : <UserCheck size={18} />}
                            </button>
                            <button 
                              onClick={() => onUpdateStatus(user, "REJECTED")}
                              disabled={pendingActionId === user._id}
                              className="h-10 w-10 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 flex items-center justify-center active:scale-90"
                              title="Reject User"
                            >
                              <UserX size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            {user.status === UserStatus.APPROVED ? (
                              <>
                                <button 
                                  onClick={() => onUpdateRole(user, user.role === UserRole.ADMIN ? UserRole.CUSTOMER : UserRole.ADMIN)}
                                  className="h-10 w-10 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100 flex items-center justify-center active:scale-90"
                                  title={user.role === UserRole.ADMIN ? "Demote to Customer" : "Promote to Admin"}
                                >
                                  {user.role === UserRole.ADMIN ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                                </button>
                                <button 
                                  onClick={() => onUpdateStatus(user, "REJECTED")}
                                  className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all border border-orange-100 flex items-center justify-center active:scale-90"
                                  title="Restrict Access"
                                >
                                  <UserX size={18} />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => onUpdateStatus(user, "APPROVED")}
                                className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 flex items-center justify-center active:scale-90"
                                title="Restore Access"
                              >
                                <UserCheck size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => onDeleteUser(user)}
                              disabled={pendingActionId === user._id}
                              className="h-10 w-10 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 flex items-center justify-center active:scale-90"
                              title="Delete Account"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-40 text-center">
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                      <div className="relative mb-10">
                        <div className="absolute inset-0 bg-rose-200 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                        <div className="relative w-32 h-32 bg-gradient-to-br from-rose-50 to-white rounded-[2.5rem] border-2 border-rose-100 flex items-center justify-center text-rose-200 shadow-2xl">
                          <Users size={64} className="animate-bounce-slow stroke-[1.5]" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tight">No results found</h3>
                      <button onClick={resetFilters} className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:-translate-y-1 shadow-2xl shadow-slate-200 transition-all flex items-center gap-3">
                        <RotateCcw size={16} /> Restore Full Directory
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
