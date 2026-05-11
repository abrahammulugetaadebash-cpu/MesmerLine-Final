import { Sparkles } from 'lucide-react';

const AIPage = () => (
  <div className="h-full flex flex-col items-center justify-center bg-white p-12 text-center animate-in fade-in zoom-in duration-700">
    <div className="w-24 h-24 bg-zinc-50 rounded-[32px] flex items-center justify-center shadow-2xl mb-8 border border-zinc-100">
      <Sparkles size={48} className="text-accent-green animate-pulse" />
    </div>
    <h2 className="text-2xl font-bold tracking-tight mb-2">Mesmer AI</h2>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-green mb-12">Coming Soon</p>
    <div className="apple-card p-6 bg-zinc-50 border-none shadow-none max-w-xs">
      <p className="text-xs font-bold text-zinc-400 leading-relaxed">
        We are aligning the neural core to provide professional-grade objective scanning.
      </p>
    </div>
  </div>
);

export default AIPage;
