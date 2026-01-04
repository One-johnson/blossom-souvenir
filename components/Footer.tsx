
import React from 'react';
import { Flower2, Facebook, Instagram, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Flower2 className="text-rose-400 w-6 h-6" />
            <span className="text-xl font-serif font-bold">Blossom Souvenir</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Spreading joy through handcrafted, elegant souvenirs that capture the essence of precious moments.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li><a href="#/shop" className="hover:text-rose-400 transition-colors">Shop All</a></li>
            <li><a href="#/about" className="hover:text-rose-400 transition-colors">Our Story</a></li>
            <li><a href="#/contact" className="hover:text-rose-400 transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Categories</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li><a href="#" className="hover:text-rose-400 transition-colors">Home Decor</a></li>
            <li><a href="#" className="hover:text-rose-400 transition-colors">Fashion Accessories</a></li>
            <li><a href="#" className="hover:text-rose-400 transition-colors">Ceramics</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-rose-500 transition-all"><Facebook size={20} /></a>
            <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-rose-500 transition-all"><Instagram size={20} /></a>
            <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-rose-500 transition-all"><Twitter size={20} /></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
        &copy; {new Date().getFullYear()} Blossom Souvenir Shop. All rights reserved.
      </div>
    </footer>
  );
};
