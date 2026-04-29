import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-[300] flex flex-col items-center justify-center px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-charcoal rounded-[28px] flex items-center justify-center shadow-2xl mb-2">
            <Layers size={40} className="text-accent-green" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">MESMER</h1>
            <p className="text-accent-green font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Stay in Line</p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-green/20 transition-all outline-none"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-green/20 transition-all outline-none"
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-[10px] font-black uppercase text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-charcoal text-white py-4 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <Sparkles className="animate-spin" size={16} />
            ) : (
              <>
                {isSignUp ? 'Construct Account' : 'Authenticate'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-charcoal transition-colors"
          >
            {isSignUp ? 'Already aligned? Sign In' : 'New to Mesmer? Sign Up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
