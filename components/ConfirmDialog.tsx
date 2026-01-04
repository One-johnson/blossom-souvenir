
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  type?: 'danger' | 'info' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-200',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    info: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
  };

  const iconStyles = {
    danger: 'text-red-500 bg-red-50',
    warning: 'text-amber-500 bg-amber-50',
    info: 'text-rose-500 bg-rose-50'
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} />
        </button>
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${iconStyles[type]}`}>
          <AlertCircle size={28} />
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3.5 rounded-2xl text-white font-bold transition-all shadow-lg ${typeStyles[type]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
