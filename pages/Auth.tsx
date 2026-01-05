import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { UserStatus, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
  onLogin: (user: any, token: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const registerUser = useMutation(api.users.register);
  const loginUser = useMutation(api.users.login);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const loginResponse = await loginUser({ email: formData.email, password: formData.password });
        
        if (!loginResponse) {
          setError('Invalid email or password.');
          setLoading(false);
          return;
        }

        const { user, token } = loginResponse;

        if (user.status === "REJECTED") {
            setError('Your account application was rejected.');
            setLoading(false);
            return;
        }
        if (user.status === "PENDING") {
            setError('Your account is still pending approval.');
            setLoading(false);
            return;
        }

        onLogin(user, token);
        navigate(user.role === UserRole.ADMIN ? '/admin' : '/');
      } else {
        const newUserResponse = await registerUser({
            name: formData.name,
            email: formData.email,
            password: formData.password
        });

        if (newUserResponse.status === "PENDING") {
          setError('Registration successful! Please wait for admin approval.');
          setIsLogin(true);
          setFormData({ ...formData, password: '' });
        } else if (newUserResponse.token) {
          onLogin(newUserResponse, newUserResponse.token);
          navigate(newUserResponse.role === UserRole.ADMIN ? '/admin' : '/');
        } else {
          // Fallback for approved but no token returned (unlikely)
          setIsLogin(true);
          setError('Account created. Please sign in.');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-rose-50/50">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-rose-100 flex flex-col animate-in zoom-in duration-500">
        <div className="p-10 text-center space-y-2">
          <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center mx-auto text-white mb-4 shadow-lg">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Join Our Garden'}</h2>
          <p className="text-slate-500 text-sm">
            {isLogin ? 'Enter your details to sign in' : 'Register and wait for admin approval'}
          </p>
        </div>

        <div className="px-10 pb-10 space-y-6">
          {error && (
            <div className={`p-4 rounded-2xl text-xs font-bold ${error.includes('successful') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-rose-100 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-rose-100 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-rose-100 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-rose-600 shadow-lg disabled:bg-rose-300 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-rose-500 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};