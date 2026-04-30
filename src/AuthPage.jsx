import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Mail, Lock, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

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

    try {
      const { data, error: authError } = isSignUp 
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                full_name: '',
                onboarding_completed: false
              }
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (authError) throw authError;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FBFBFD] z-[300] flex flex-col items-center justify-center px-8 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent-green/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-charcoal/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-charcoal rounded-[24px] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] mb-2"
          >
            <Layers size={36} className="text-accent-green" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-charcoal">Mesmer</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-green/60">Professional Alignment</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-charcoal transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Apple ID or Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-accent-green/30 focus:ring-4 focus:ring-accent-green/5 transition-all outline-none"
                  required
                />
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-charcoal transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-accent-green/30 focus:ring-4 focus:ring-accent-green/5 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-100 rounded-xl p-3"
                >
                  <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight text-center leading-tight">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-charcoal text-white py-4 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-charcoal/10"
            >
              {loading ? (
                <Activity className="animate-spin" size={16} />
              ) : (
                <>
                  {isSignUp ? 'Establish Identity' : 'Authenticate'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-50 text-center">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-charcoal transition-colors"
            >
              {isSignUp ? (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck size={12} /> Existing User? Sign In
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  New to Mesmer? Create Account
                </span>
              )}
            </button>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] text-zinc-300 font-medium uppercase tracking-[0.1em]">
          Powered by Supabase Security
        </p>
      </motion.div>
    </div>
  );
}
