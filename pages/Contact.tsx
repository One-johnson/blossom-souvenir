
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { api } from '../convex/_generated/api';
import { User } from '../types';
import { 
  Mail, Phone, MapPin, Send, MessageSquare, 
  Clock, Globe, ArrowRight, CheckCircle2, 
  Instagram, Facebook, Twitter, Sparkles
} from 'lucide-react';

export const Contact: React.FC<{ user?: User | null }> = ({ user }) => {
  const [formState, setFormState] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  
  const sendMessage = useMutation(api.messages.send);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (user) {
      setFormState(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendMessage({
        name: formState.name,
        email: formState.email,
        subject: formState.subject,
        message: formState.message,
        userId: user?._id as any
      });
      
      toast.success("Message sent successfully!");
      setIsSent(true);
      setFormState({ 
        name: user?.name || '', 
        email: user?.email || '', 
        subject: '', 
        message: '' 
      });
      setTimeout(() => setIsSent(false), 5000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-50 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border-2 border-rose-500 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 border-8 border-rose-500 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-6">
          <span className="inline-block px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black tracking-widest uppercase">
            Get in touch
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
            Let's Start a <br />
            <span className="text-rose-500 italic font-serif">Conversation</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Have a question about our collections or interested in a custom commission? Our team is here to help you find the perfect blossom.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900">Connect with Us</h2>
              <p className="text-slate-500 font-medium">Reach out through any of these channels or visit our artisan studio in Blossom City.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { 
                  icon: MapPin, 
                  title: 'Visit Our Studio', 
                  detail: '123 Floral Garden Ave, Blossom City',
                  subDetail: 'Open for gallery viewings'
                },
                { 
                  icon: Phone, 
                  title: 'Call Us Directly', 
                  detail: '+233 (55) 330-1044',
                  subDetail: 'Mon-Fri, 9am - 6pm'
                },
                { 
                  icon: Mail, 
                  title: 'Email Inquiries', 
                  detail: 'hello@blossomsouvenir.com',
                  subDetail: 'We reply within 24 hours'
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-8 bg-white border border-rose-50 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                    <item.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</h3>
                    <p className="text-lg font-bold text-slate-900">{item.detail}</p>
                    <p className="text-xs text-slate-400 font-medium">{item.subDetail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-900 rounded-[3rem] text-white space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Globe size={120} />
              </div>
              <div className="relative space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Sparkles size={20} className="text-rose-400" />
                  Social Garden
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">Follow our journey and get daily inspiration from our latest artisan creations.</p>
                <div className="flex gap-4 pt-2">
                  <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-rose-500 transition-all">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-rose-500 transition-all">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-rose-500 transition-all">
                    <Twitter size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-10 md:p-16 rounded-[4rem] border border-rose-50 shadow-2xl shadow-rose-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
              
              {isSent ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900">Message Received</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">Thank you for reaching out. A member of our boutique team will be in touch shortly.</p>
                  </div>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="text-rose-500 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900">Send a Message</h2>
                    <p className="text-slate-400 font-medium">Field with * are required for our response.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Full Name *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Ama Serwaa"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-slate-700 shadow-inner"
                        value={formState.name}
                        onChange={e => setFormState({...formState, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address *</label>
                      <input 
                        required
                        type="email" 
                        placeholder="hello@example.com"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-slate-700 shadow-inner"
                        value={formState.email}
                        onChange={e => setFormState({...formState, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                    <input 
                      type="text" 
                      placeholder="How can we help?"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-slate-700 shadow-inner"
                      value={formState.subject}
                      onChange={e => setFormState({...formState, subject: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message *</label>
                    <textarea 
                      required
                      placeholder="Tell us what's on your mind..."
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-700 shadow-inner h-40 resize-none"
                      value={formState.message}
                      onChange={e => setFormState({...formState, message: e.target.value})}
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-rose-500 shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] group"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Sneak Peek */}
      <section className="bg-rose-50 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Frequently Asked</h2>
            <p className="text-slate-500 font-medium">Quick answers to common inquiries from our community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {[
              { q: 'Do you offer international shipping?', a: 'Yes, we ship our blossom treasures to over 20 countries worldwide with secure tracking.' },
              { q: 'Can I request a custom gift set?', a: 'Absolutely! Our artisans love creating bespoke sets tailored to your specific occasion and theme.' },
              { q: 'What is your return policy?', a: 'We offer a 14-day return period for unused items in their original boutique packaging.' },
              { q: 'How long do custom orders take?', a: 'Depending on complexity, custom pieces typically take 2-3 weeks to bloom and ship.' }
            ].map((faq, i) => (
              <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-rose-100 shadow-sm space-y-3">
                <div className="flex items-center gap-3 text-rose-500">
                  <MessageSquare size={18} />
                  <h4 className="font-bold text-slate-900">{faq.q}</h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
          
          <div className="pt-8">
             <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 text-rose-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all"
             >
               Visit the Shop <ArrowRight size={16} />
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
