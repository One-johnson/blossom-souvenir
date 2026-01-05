
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Heart, Sparkles, Palette, ShieldCheck, 
  Flower2, History, Target, Users, Globe, Compass, Star
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover scale-105 animate-pulse-slow" 
            alt="Artisan Flowers Background" 
          />
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500 text-white rounded-full text-[10px] font-black tracking-[0.3em] uppercase shadow-xl shadow-rose-500/20">
              <Sparkles size={12} /> Established 2024
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
            Where Every <br />
            <span className="text-rose-400 italic font-serif">Bloom</span> Tells a Story
          </h1>
          <p className="text-xl text-rose-50 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
            We curate more than just souvenirs; we preserve the fleeting beauty of moments in artisan-crafted treasures.
          </p>
          <div className="pt-6">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-4 bg-white text-slate-900 px-12 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all shadow-2xl hover:-translate-y-1 active:scale-95 group"
            >
              Discover Our Garden
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-rose-100 border border-rose-50 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Artisans', value: '50+', icon: Users },
            { label: 'Souvenirs', value: '200+', icon: Flower2 },
            { label: 'Happy Hearts', value: '5k+', icon: Heart },
            { label: 'Countries', value: '12', icon: Globe },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2 border-r last:border-none border-rose-50">
              <div className="flex justify-center text-rose-500 mb-2">
                <stat.icon size={20} />
              </div>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Origin Story */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 bg-rose-50 rounded-[5rem] rotate-3 z-0"></div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-80 object-cover rounded-[3rem] shadow-xl hover:scale-[1.02] transition-transform duration-500" 
                alt="Crafting Process 1" 
              />
              <img 
                src="https://images.unsplash.com/photo-1453749024858-4bca89bd9edc?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-80 object-cover rounded-[3rem] shadow-xl translate-y-12 hover:scale-[1.02] transition-transform duration-500" 
                alt="Crafting Process 2" 
              />
            </div>
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <div className="flex items-center gap-3 text-rose-500">
              <History size={20} />
              <h2 className="text-xs font-black uppercase tracking-[0.3em]">Our Legacy</h2>
            </div>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Rooted in <span className="text-rose-500 italic font-serif">Tradition</span>,<br /> 
              Growing for Tomorrow
            </h3>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-medium">
              <p>
                Blossom Souvenir began as a small passion project in the heart of the city. We noticed that modern travel often lacks the soul of local craftsmanship, with generic trinkets replacing true memories.
              </p>
              <p>
                We set out on a mission to curate a collection that honors the artisans of Ghana and beyond. Every piece in our shop is hand-selected, not just for its aesthetic, but for the story it carries and the lives it supports.
              </p>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900">100%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fair Trade</span>
                </div>
                <div className="w-px h-10 bg-rose-100"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900">Artisan</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focused</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-950 py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none scale-150 rotate-12">
          <Flower2 size={400} className="text-rose-500" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-24 space-y-4">
            <h2 className="text-rose-400 font-black text-xs uppercase tracking-[0.4em]">Philosophy</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight">The Artisan Standard</h3>
            <div className="w-24 h-1.5 bg-rose-500 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Palette,
                title: 'Authenticity',
                desc: 'No mass production. We believe in the beauty of imperfection and the unique touch of the human hand.'
              },
              {
                icon: Compass,
                title: 'Curated Discovery',
                desc: 'Our scouts travel to remote corners to find the rarest materials and most talented traditional makers.'
              },
              {
                icon: ShieldCheck,
                title: 'Sustainable Bloom',
                desc: 'Environmentally conscious packaging and ethically sourced materials ensure our growth respects nature.'
              }
            ].map((value, i) => (
              <div key={i} className="group bg-white/5 backdrop-blur-sm p-12 rounded-[3.5rem] border border-white/10 hover:border-rose-500/50 hover:bg-white/[0.08] transition-all duration-500">
                <div className="w-16 h-16 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-rose-500/20">
                  <value.icon size={32} />
                </div>
                <h4 className="text-2xl font-black mb-4">{value.title}</h4>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Crafting Process */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h2 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] mb-4">How it's made</h2>
          <h3 className="text-5xl font-black text-slate-900">From Petal to Treasure</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-rose-100 -z-10"></div>
          
          {[
            { step: '01', title: 'Ethical Sourcing', desc: 'We source raw materials directly from communities, ensuring top quality and fair pay.' },
            { step: '02', title: 'Artisan Craft', desc: 'Each piece undergoes weeks of manual work by masters of their specific craft.' },
            { step: '03', title: 'Quality Curation', desc: 'Every item is inspected and narratively described before entering our boutique.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-rose-50 shadow-sm relative group hover:-translate-y-2 transition-transform">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center font-black text-lg border-4 border-white shadow-xl">
                {item.step}
              </span>
              <h4 className="text-xl font-bold text-center mb-4 mt-4">{item.title}</h4>
              <p className="text-slate-500 text-center text-sm font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-32">
        <div className="bg-rose-500 rounded-[4.5rem] p-16 md:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="relative z-10 space-y-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-2 rounded-full backdrop-blur-md">
              <Star size={16} className="text-amber-300 fill-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-widest">Join our community</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight max-w-3xl mx-auto">
              Ready to find your next <br />
              <span className="italic font-serif text-rose-100">blossom memory?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-4 bg-white text-rose-600 px-14 py-6 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
              >
                Go to the Shop
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-4 bg-rose-600 text-white border-2 border-rose-400/30 px-14 py-6 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-rose-700 transition-all active:scale-95"
              >
                Get in Touch
              </Link>
            </div>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-1000"></div>
        </div>
      </section>
    </div>
  );
};
