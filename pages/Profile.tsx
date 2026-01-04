
import React, { useState } from 'react';
import { 
  User as UserIcon, Mail, Lock, Shield, 
  CheckCircle2, Loader2, ArrowLeft, Camera,
  Sparkles, AlertCircle, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { User } from '../types';

interface ProfileProps {
  user: User | null;
  onUpdate: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  if (!user) return null;

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const updateProfile = useMutation(api.users.updateProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords don't match!", type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const updatedUser = await updateProfile({
        id: user._id as any,
        name: formData.name !== user.name ? formData.name : undefined,
        email: formData.email !== user.email ? formData.email : undefined,
        password: formData.password || undefined
      });

      onUpdate(updatedUser);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Link to="/" className="text-rose-500 font-bold flex items-center gap-2 hover:underline mb-4 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Shopping
        </Link>
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
          <Settings className="text-rose-500" /> My Profile
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-rose-50 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles size={120} />
            </div>
            
            <div className="relative inline-block group mb-6">
              <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-4xl font-serif font-black border-4 border-white shadow-xl overflow-hidden">
                {user.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                <Camera size={14} />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900 truncate">{user.name}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-[10px] font-black bg-rose-50 text-rose-500 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100">
                {user.role}
              </span>
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                {user.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-6 uppercase tracking-widest">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-4 shadow-xl shadow-slate-200">
            <div className="flex items-center gap-3">
              <Shield className="text-rose-400" />
              <h3 className="font-bold">Privacy & Security</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Your profile data is encrypted and managed via secure native cloud services. We prioritize your privacy in every petal.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border border-rose-50 shadow-xl space-y-8">
            {message && (
              <div className={`p-5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
                <span className="text-sm font-bold">{message.text}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-100 outline-none transition-all font-bold"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-rose-50">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Lock size={14} /> Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                    <input 
                      type="password"
                      placeholder="Leave blank to keep current"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-100 outline-none transition-all font-medium"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                    <input 
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-100 outline-none transition-all font-medium"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={isSaving}
              type="submit"
              className="w-full bg-rose-500 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-rose-600 shadow-2xl shadow-rose-100 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
