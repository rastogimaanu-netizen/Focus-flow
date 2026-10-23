import React from 'react';
import { Trophy, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CelebrationModal: React.FC = () => {
  const { celebration, dismissCelebration } = useApp();

  if (!celebration.isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm p-6 text-center bg-white rounded-2xl shadow-xl border border-indigo-100 transform transition-all scale-100">
        <button
          onClick={dismissCelebration}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close celebration modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 mb-4 shadow-xs">
          {celebration.title.toLowerCase().includes('goal') ? (
            <Trophy className="h-7 w-7 text-indigo-600" />
          ) : (
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          )}
        </div>

        <h3 id="celebration-title" className="text-lg font-bold text-slate-900 tracking-tight">
          {celebration.title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{celebration.message}</p>

        <div className="mt-5">
          <button
            onClick={dismissCelebration}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors"
          >
            Keep Momentum
          </button>
        </div>
      </div>
    </div>
  );
};
