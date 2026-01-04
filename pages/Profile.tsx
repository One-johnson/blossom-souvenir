
import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, Mail, Lock, Shield, 
  CheckCircle2, Loader2, ArrowLeft, Camera,
  Sparkles, AlertCircle, Settings, Trash2,
  Fingerprint, Clock, Calendar, ShieldCheck,
  ShieldAlert, Eye, EyeOff
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
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image size must be less than 5MB.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      const updatedUser = await updateProfile({
        id: user._id as any,
        profileImage: storageId,
      });

      onUpdate(updatedUser);
      setMessage({ text: 'Profile photo updated!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to upload image.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if passwords match if a new password is provided
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: "New passwords don't match!", type: 'error' });
      return;
    }

    // Require current password for sensitive changes
    const isSensitive = formData.newPassword || formData.email !== user.email;
    if (isSensitive && !formData.currentPassword) {
      setMessage({ text: "Please enter your current password to authorize changes.", type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const updatedUser = await updateProfile({
        id: user._id as any,
        name: formData.name !== user.name ? formData.name : undefined,
        email: formData.email !== user.email ? formData.email : undefined,
        password: formData.newPassword || undefined,
        currentPassword: formData.currentPassword || undefined
      });

      onUpdate(updatedUser);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      
      // Clear sensitive fields
      setFormData(prev => ({ 
        ...prev, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      }));
      
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update profile.';
      setMessage({ text: errorMsg.includes("Incorrect") ? "Security Error: " + errorMsg : errorMsg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-in fade-in duration-700">
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <Link to="/" className="text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-all mb-4 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Shopping
          </Link>
          <div className="flex items-center gap-4">
             <div className="p-4 bg-rose-500 rounded-[1.5rem] text-white shadow-xl shadow-rose-200">
                <Settings size={28} />
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 font-medium">Manage your digital identity in our boutique.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-rose-50 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-10 text-rose-50/30 group-hover:rotate-12 transition-transform duration-1000">
              <Sparkles size={180} />
            </div>
            
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-rose-100 flex items-center justify-center text-rose-500 text-5xl font-serif font-black border-4 border-white shadow-2xl overflow-hidden relative">
                {isUploading ? (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
                    <Loader2 className="animate-spin text-rose-500" size={24} />
                  </div>
                ) : user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all z-20 hover:bg-rose-500 disabled:opacity-50"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <div className="space-y-4">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 truncate px-2">{user.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-[9px] font-black bg-rose-500 text-white px-4 py-1.5 rounded-full uppercase tracking-widest border border-rose-600/10 shadow-sm">
                      {user.role}
                    </span>
                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest shadow-sm ${
                      user.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {user.status}
                    </span>
                  </div>
               </div>

               <div className="pt-6 border-t border-rose-50 space-y-3">
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Fingerprint size={12} className="text-rose-300" />
                    <span className="font-mono">ID: #{user._id.slice(-8)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Calendar size={12} className="text-rose-300" />
                    <span>Member Since {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-slate-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Shield size={120} />
            </div>
            <div className="relative space-y-4">
               <div className="flex items-center gap-3">
                 <Shield className="text-rose-400" />
                 <h3 className="font-black text-lg">Trust & Security</h3>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed font-medium">
                 Your profile data is encrypted. Sensitive changes like password updates require authorization with your current key.
               </p>
               <div className="flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12} /> MFA Protected
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-10 md:p-14 rounded-[3rem] border border-rose-50 shadow-xl space-y-10">
            {message && (
              <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                <span className="text-sm font-bold">{message.text}</span>
              </div>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <UserIcon size={12} /> Legal Name
                  </label>
                  <input 
                    type="text"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Mail size={12} /> Contact Email
                  </label>
                  <input 
                    type="email"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-rose-50">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Lock size={12} /> Security Authorization
                   </h3>
                   <button 
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all"
                   >
                     {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />}
                     {showPasswords ? 'Hide' : 'Reveal'} Keys
                   </button>
                </div>
                
                <div className="space-y-8">
                  {/* Current Password Field - Required for sensitive changes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <ShieldAlert size={12} className="text-amber-500" /> Current Password (Required to authorize sensitive changes)
                    </label>
                    <input 
                      type={showPasswords ? "text" : "password"}
                      placeholder="Required for Email or Password updates"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-slate-700 shadow-inner"
                      value={formData.currentPassword}
                      onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                      <input 
                        type={showPasswords ? "text" : "password"}
                        placeholder="Leave blank to keep current"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-slate-700 shadow-inner"
                        value={formData.newPassword}
                        onChange={e => setFormData({...formData, newPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm New Password</label>
                      <input 
                        type={showPasswords ? "text" : "password"}
                        placeholder="Verify your new key"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-slate-700 shadow-inner"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
               <button 
                disabled={isSaving}
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-rose-600 shadow-2xl shadow-slate-200 disabled:opacity-50 transition-all active:scale-[0.98] group"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />}
                Authorize & Sync Updates
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
