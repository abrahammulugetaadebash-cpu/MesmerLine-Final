import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layout, Sliders, Wifi, Globe, Bell, Shield, HelpCircle, Info, ChevronRight, LogOut, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const SettingsPage = ({ userName, profile, setProfile, tasks, pages, setPages, riseTime, setRiseTime, windDownTime, setWindDownTime }) => {
  const [dataSaver, setDataSaver] = useState(false);
  const [language, setLanguage] = useState('Eng (US)');
  const [popupContent, setPopupContent] = useState(null);

  // Calculate Realtime Performance Aggregates
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.is_completed).length,
    pending: tasks.filter(t => !t.is_completed).length,
    highPriority: tasks.filter(t => t.priority?.toLowerCase() === 'high').length,
    highPriorityCompleted: tasks.filter(t => t.priority?.toLowerCase() === 'high' && t.is_completed).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  // Velocity: Tasks finished today
  const todayStr = new Date().toDateString();
  const completedToday = tasks.filter(t => t.is_completed && new Date(t.updated_at || t.created_at).toDateString() === todayStr).length;

  // Focus Metric: Avg time for high priority tasks (mocked if timestamps missing, but based on real count)
  // Optimization: If we had completed_at - created_at, we would calculate real time.
  const focusMetric = stats.highPriority > 0 ? Math.round((stats.highPriorityCompleted / stats.highPriority) * 100) : 0;

  const progress = { 
    current: completionRate, 
    previous: 64, // Historical snapshot placeholder
    velocity: completedToday,
    breakdown: {
      completed: stats.completed,
      pending: stats.pending
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Reset app state by redirecting to home
  };

  const handleProfileImage = async () => {
    const url = prompt("Enter a direct URL for your profile image:");
    if (!url || !profile) return;
    
    setProfile({ ...profile, avatar_url: url });
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id);
  };

  const togglePage = async (id, currentState) => {
    const { error } = await supabase
      .from('swipe_pages')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) console.error('Error toggling page:', error);
    else setPages(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentState } : p));
  };

  return (
    <div className="h-full px-6 pt-10 overflow-y-auto pb-48 no-scrollbar bg-white">
      <div className="flex flex-col items-center mb-12 text-center">
        <button onClick={handleProfileImage} className="w-24 h-24 rounded-full bg-zinc-100 mb-4 overflow-hidden border-2 border-zinc-50 relative group">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 font-black text-xl">{userName?.charAt(0) || 'M'}</div>
          )}
          <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[10px] font-bold text-white uppercase">Edit</span>
          </div>
        </button>
        <h3 className="text-xl font-bold mb-1">Hi, {userName || 'Mesmer'}</h3>
        <div className="bg-accent-green/10 text-accent-green text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">Active Workspace</div>
      </div>

      <section className="mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-6 font-mono">Performance Overview</h4>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-zinc-500">Overall Completion Rate</span>
              <span className="text-xs font-black text-accent-green">{progress.current}%</span>
            </div>
            <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress.current}%` }} className="h-full bg-accent-green rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col gap-1">
               <p className="text-[9px] font-black uppercase text-zinc-400">Daily Velocity</p>
               <div className="flex items-end gap-2">
                 <p className="text-xl font-black text-charcoal">{progress.velocity}</p>
                 <p className="text-[8px] font-bold text-zinc-400 mb-1">TASKS / DAY</p>
               </div>
            </div>
            <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col gap-1">
               <p className="text-[9px] font-black uppercase text-zinc-400">Focus Metric</p>
               <div className="flex items-end gap-2">
                 <p className="text-xl font-black text-charcoal">{focusMetric}%</p>
                 <p className="text-[8px] font-bold text-zinc-400 mb-1">HI-PRIORITY</p>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 bg-zinc-900 p-5 rounded-[24px] text-white shadow-xl shadow-zinc-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-green/20 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-accent-green" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40">Workload Breakdown</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{progress.breakdown.completed} Done</span>
                  <span className="text-white/20">•</span>
                  <span className="text-sm font-bold text-white/60">{progress.breakdown.pending} Pending</span>
                </div>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] font-bold text-zinc-500 uppercase">Efficiency</p>
               <p className="text-lg font-black">{progress.current}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Productivity Logic */}
      <section className="mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-6 font-mono">Productivity Logic</h4>

        <div className="apple-card bg-zinc-50 border-none p-6 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2"><Layout size={12} /> Swipe Page Manager</p>
            <div className="space-y-3">
              {pages.map(page => (
                <div key={page.id} className="flex items-center justify-between">
                  <span className="text-sm font-bold">{page.name}</span>
                  <button onClick={() => togglePage(page.id, page.is_active)} className={cn("w-10 h-5 rounded-full transition-all flex items-center px-1", page.is_active ? "bg-accent-green" : "bg-zinc-200")}>
                    <div className={cn("w-3 h-3 bg-white rounded-full transition-all", page.is_active ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Sliders size={12} /> Schedule Anchors</p>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: 'Rise', val: riseTime, set: setRiseTime }, { label: 'Wind Down', val: windDownTime, set: setWindDownTime }].map(anch => (
                <div key={anch.label} className="bg-white p-3 rounded-xl border border-zinc-100">
                  <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">{anch.label}</p>
                  <input type="time" value={anch.val} onChange={e => anch.set(e.target.value)} className="text-xs font-bold w-full border-none p-0 outline-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Regional & Data */}
      <section className="mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-6 font-mono">Regional & Data</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-5 apple-card bg-zinc-50 border-none">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-zinc-400" />
              <span className="text-sm font-bold">Data Saver Mode</span>
            </div>
            <button onClick={() => setDataSaver(!dataSaver)} className={cn("w-10 h-5 rounded-full transition-all flex items-center px-1", dataSaver ? "bg-accent-green" : "bg-zinc-200")}>
              <div className={cn("w-3 h-3 bg-white rounded-full transition-all", dataSaver ? "translate-x-5" : "translate-x-0")} />
            </button>
          </div>

          <div className="p-5 apple-card bg-zinc-50 border-none flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Wifi size={18} className="text-zinc-400" />
              <div>
                <span className="text-sm font-bold block leading-none mb-1">Offline Sync</span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Last Synced: Just now</span>
              </div>
            </div>
            <button className="bg-white px-4 py-2 rounded-xl border border-zinc-100 text-[10px] font-black uppercase">Sync Now</button>
          </div>

          <div className="p-5 apple-card bg-zinc-50 border-none flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-zinc-400" />
              <span className="text-sm font-bold">Language</span>
            </div>
            <select value={language} onChange={e => setLanguage(e.target.value)} disabled className="bg-transparent text-xs font-bold border-none outline-none focus:ring-0 opacity-50 cursor-not-allowed">
              <option>Eng (US)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Section 5: Support */}
      <section className="mb-12">
        <div className="space-y-2">
          {[
            { label: 'Notifications', icon: Bell, type: 'toggle' },
            { label: 'Privacy Policy', icon: Shield, action: () => setPopupContent({ title: 'Privacy Policy', text: 'All data is encrypted via Supabase Row Level Security. Data is scoped strictly to our authenticated tokens. We do not sell or inspect user tasks.', isContact: false }) },
            { label: 'Contact Support', icon: HelpCircle, action: () => setPopupContent({ title: 'Contact Support', text: 'Need help? Experiencing a bug? Reach out to us directly.', isContact: true }) },
            { label: 'About Mesmer', icon: Info, action: () => setPopupContent({ title: 'About Mesmer', text: 'Mesmer is a high-performance productivity tool designed for the ruthless professional. Build structure, measure output.', isContact: false }) },
          ].map(btn => (
            <div key={btn.label} onClick={btn.action} className={cn("p-5 apple-card bg-zinc-50 border-none flex justify-between items-center", btn.action && "cursor-pointer active:scale-[0.98] transition-all")}>
              <div className="flex items-center gap-3">
                <btn.icon size={18} className="text-zinc-400" />
                <span className="text-sm font-bold">{btn.label}</span>
              </div>
              {btn.type === 'toggle' ? (
                <button className="w-10 h-5 bg-accent-green rounded-full flex items-center px-1"><div className="w-3 h-3 bg-white rounded-full translate-x-5" /></button>
              ) : <ChevronRight size={18} className="text-zinc-200" />}
            </div>
          ))}
        </div>
      </section>

      <div className="pt-8 text-center">
        <button onClick={handleLogout} className="text-red-400 font-bold flex items-center gap-2 mx-auto text-sm opacity-60 hover:opacity-100 transition-all">
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <AnimatePresence>
        {popupContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-charcoal/40 backdrop-blur-sm flex items-end" onClick={() => setPopupContent(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPopupContent(null)} className="absolute top-6 right-6 p-2 bg-zinc-50 rounded-full"><X size={20} /></button>
              <h3 className="text-2xl font-bold mb-4 pr-12">{popupContent.title}</h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-md">{popupContent.text}</p>
              {popupContent.isContact && (
                <div className="mt-8 space-y-4">
                  <a href="mailto:support@mesmer.app" className="block w-full py-4 bg-charcoal text-white rounded-2xl font-bold text-sm tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center">Send Email</a>
                  <a href="https://t.me/mesmer" target="_blank" rel="noreferrer" className="block w-full py-4 bg-[#229ED9] text-white rounded-2xl font-bold text-sm tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center text-white/90">Telegram / @mesmer</a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
