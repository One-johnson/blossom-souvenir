
import React from 'react';
import { Clock, UserCheck, UserX, Loader2 } from 'lucide-react';
import { Skeleton } from '../Skeleton';

interface UsersTabProps {
  allUsers: any[] | undefined;
  onUpdateStatus: (user: any, status: 'APPROVED' | 'REJECTED') => void;
  pendingActionId: string | null;
}

export const UsersTab: React.FC<UsersTabProps> = ({ allUsers, onUpdateStatus, pendingActionId }) => {
  const pendingUsers = (allUsers || []).filter((u:any) => u.status === "PENDING");
  const approvedUsers = (allUsers || []).filter((u:any) => u.status === "APPROVED");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-rose-600">
          <Clock size={20} /> Pending Approval ({allUsers ? pendingUsers.length : '...'})
        </h2>
        <div className="space-y-4">
          {allUsers === undefined ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)
          ) : pendingUsers.length > 0 ? pendingUsers.map((user:any) => (
            <div key={user._id} className="bg-white p-6 rounded-3xl border border-rose-50 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold">{user.name}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onUpdateStatus(user, "APPROVED")}
                  disabled={pendingActionId === user._id}
                  className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 disabled:opacity-50"
                >
                  {pendingActionId === user._id ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />}
                </button>
                <button 
                  onClick={() => onUpdateStatus(user, "REJECTED")}
                  disabled={pendingActionId === user._id}
                  className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 disabled:opacity-50"
                >
                  <UserX size={20} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-rose-50 rounded-3xl">No pending approvals</div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <UserCheck size={20} /> Approved Users ({allUsers ? approvedUsers.length : '...'})
        </h2>
        <div className="space-y-4">
          {allUsers === undefined ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-3xl" />)
          ) : approvedUsers.map((user:any) => (
            <div key={user._id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                  {user.name.charAt(0)}
                </div>
                <h3 className="font-bold text-sm">{user.name}</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
