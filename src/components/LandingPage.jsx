import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

const LandingPage = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [pillarStep, setPillarStep] = useState(0);
  const [name, setName] = useState('');
  const [workspace, setWorkspace] = useState('Personal');
  const [loading, setLoading] = useState(false);

  const pillars = [
    { title: 'Alignment', desc: 'Precision ToDo system powered by color-coded geometric tagging.', icon: Layers },
    { title: 'Intelligence', desc: 'AI-integrated scanning and voice planning for rapid objective entry.', icon: Sparkles },
    { title: 'Rhythm', desc: 'Built-in circadian anchors at 05:45 and 23:45 to keep you in line.', icon: Clock },
  ];

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => setLoading(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const goToStep4 = () => {
    setStep(4);
    setLoading(true);
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] overflow-hidden flex flex-col items-center px-8 font-sans">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 bg-charcoal rounded-[32px] flex items-center justify-center shadow-2xl mb-4"><Layers size={48} className="text-accent-green" /></div>
            <div><h1 className="text-4xl font-black mb-2">MESMER</h1><p className="text-accent-green font-bold uppercase tracking-[0.3em] text-xs">Stay in Line</p></div>
            <button onClick={() => setStep(1)} className="apple-button bg-charcoal text-white px-12 py-4 text-sm font-bold tracking-widest uppercase mt-8 animate-pulse">Begin</button>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="pillars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-12 w-full pt-12">
            <div className="flex-1 flex flex-col justify-center gap-12">
              <div className="flex justify-center gap-8">
                {pillars.map((p, i) => (
                  <div key={i} className={cn("transition-all duration-700", i === pillarStep ? "scale-125 text-accent-green opacity-100" : "opacity-20 scale-90 text-charcoal")}><p.icon size={32} /></div>
                ))}
              </div>
              <div className="relative h-48 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div key={pillarStep} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 max-w-xs mx-auto">
                    <h2 className="text-3xl font-bold">{pillars[pillarStep].title}</h2>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">{pillars[pillarStep].desc}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="pb-12 flex flex-col items-center gap-8 w-full">
              <div className="flex gap-1.5">{pillars.map((_, i) => <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", pillarStep === i ? "w-8 bg-accent-green" : "w-2 bg-zinc-100")} />)}</div>
              <button onClick={() => pillarStep < 2 ? setPillarStep(pillarStep + 1) : setStep(2)} className="apple-button bg-charcoal text-white w-full py-4 uppercase font-bold text-xs tracking-widest">Continue</button>
            </div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center w-full space-y-10">
            <h2 className="text-4xl font-bold tracking-tighter">What should Mesmer<br />call you?</h2>
            <input autoFocus placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="apple-input w-full p-6 text-xl font-bold" />
            <button onClick={() => name && setStep(3)} className="apple-button bg-charcoal text-white w-full py-4 uppercase font-bold text-xs tracking-widest">Confirm Identity</button>
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="pref" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center w-full space-y-12">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em]">Workspace Architecture</label>
              <div className="grid grid-cols-2 gap-3">
                {['Tech Startup', 'Creative Studio', 'Academic', 'Personal'].map(ws => (
                  <button key={ws} onClick={() => setWorkspace(ws)} className={cn("p-4 rounded-[20px] text-xs font-bold border transition-all text-left", workspace === ws ? "bg-accent-green border-accent-green text-white shadow-lg" : "bg-zinc-50 border-zinc-100 text-zinc-500")}>{ws}</button>
                ))}
              </div>
            </div>
            <button onClick={goToStep4} className="apple-button bg-charcoal text-white w-full py-4 uppercase font-bold text-xs tracking-widest">Align Workspace</button>
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
            {loading ? (
              <div className="space-y-8 flex flex-col items-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-zinc-50 rounded-full" />
                  <motion.div initial={{ pathLength: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 border-4 border-accent-green border-t-transparent rounded-full" />
                </div>
                <p className="font-bold tracking-[0.2em] uppercase text-[10px] animate-pulse">CALIBRATING_WORKFLOW</p>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="w-20 h-20 bg-accent-green rounded-[32px] flex items-center justify-center mx-auto shadow-xl"><CheckCircle2 size={40} className="text-white" /></div>
                <h2 className="text-3xl font-bold">Alignment Success</h2>
                <button onClick={() => onComplete(name, workspace)} className="apple-button bg-charcoal text-white px-12 py-5 uppercase font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Enter Workspace</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
