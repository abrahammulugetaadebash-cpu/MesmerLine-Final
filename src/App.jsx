import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Settings as SettingsIcon,
  Plus,
  MoreVertical,
  Mic,
  Camera,
  ChevronRight,
  CheckCircle2,
  Circle,
  Search,
  ArrowRight,
  MessageSquare,
  ChevronLeft,
  X,
  Bell,
  MapPin,
  Repeat,
  Copy,
  CalendarDays,
  RefreshCw,
  CheckSquare,
  MessageCircle,
  Layers,
  ChevronDown,
  Moon,
  Sun,
  User,
  RotateCcw,
  Layout,
  Wifi,
  Globe,
  Info,
  Shield,
  HelpCircle,
  LogOut,
  Sliders,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './lib/supabase';
import AuthPage from './AuthPage';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Icons & Constants ---
const ACCENT_COLOR = '#34C759';
const DEFAULT_PAGES = [
  { name: 'Work (Coding)', is_active: true, color: 'bg-zinc-500' },
  { name: 'Family', is_active: true, color: 'bg-blue-500' },
  { name: 'Groceries', is_active: true, color: 'bg-yellow-400' },
];

// --- Helper Functions ---
const getEthiopianDate = (date) => {
  const ethMonths = ['Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehasse', 'Meskerem', 'Tikimt', 'Hidar'];
  const ethMonthIndex = date.getMonth(); 
  let ethDay = date.getDate() - 9;
  if(ethDay <= 0) ethDay += 30; // very rough
  const ethYear = date.getFullYear() - (date.getMonth() < 8 || (date.getMonth() === 8 && date.getDate() < 11) ? 8 : 7);
  return `${ethMonths[ethMonthIndex]} ${Math.max(1, ethDay)}, ${ethYear}`;
};

const getDatesRange = () => {
  const dates = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1);
  for (let i = 0; i < 28; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
};

// --- Dummy Data ---
// Tasks will be fetched from Supabase

// --- Components ---

const TaskCard = ({ task, onToggle, onToggleSubtask, isSelectMode, isSelected, onSelect, onDuplicate, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  
  // Logic for the Reddish overdue tint
  const isOverdue = !task.is_completed && task.due_date && new Date(`${task.due_date} ${task.due_time || '00:00'}`) < new Date();
  const isToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();

  return (
    <motion.div
      layout
      className={cn(
        "apple-card p-4 mb-4 relative overflow-hidden transition-all duration-500",
        // Visual State Sync: Greenish/Darkened when completed, Reddish when overdue
        task.is_completed ? "bg-emerald-50/80 border-emerald-100 opacity-80" : isOverdue ? "bg-red-50/80 border-red-100" : isToday ? "bg-orange-50/30 border-orange-100/50" : "bg-white border-zinc-100",
        isSelected && "ring-2 ring-charcoal"
      )}
      onClick={() => isSelectMode && onSelect(task.id)}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", task.color || "bg-zinc-200")} />

      <div className="flex items-start gap-3">
        {!isSelectMode && (
          <button onClick={(e) => { e.stopPropagation(); onToggle(task.id); }} className="mt-0.5">
            {task.is_completed ? <CheckCircle2 size={20} className="text-accent-green" /> : <Circle size={20} className="text-zinc-300" />}
          </button>
        )}

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={cn("text-sm font-bold tracking-tight mb-2 transition-all duration-500", task.is_completed && "line-through text-zinc-400 font-medium")}>{task.title}</h3>
            {!isSelectMode && (
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }} className="text-zinc-300 hover:text-zinc-600">
                  <MoreVertical size={16} />
                </button>
                <AnimatePresence>
                  {showOptions && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowOptions(false); }} />
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-6 bg-white border border-zinc-100 shadow-xl rounded-xl p-1 z-50 w-32">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(task); setShowOptions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 rounded-lg">
                          <CheckSquare size={14} /> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDuplicate(task); setShowOptions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 rounded-lg">
                          <Copy size={14} /> Duplicate
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); setShowOptions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash size={14} /> Delete
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {task.tag_name && (
              <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white bg-zinc-400")}>
                {task.tag_name}
              </span>
            )}
            {task.priority && <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", task.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-500' : task.priority.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-500' : 'bg-blue-100 text-blue-500')}>{task.priority}</span>}
            {task.due_date && <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1 ml-1"><Clock size={10} /> {task.due_time || 'All Day'}</span>}
          </div>

          {task.subtasks?.length > 0 && (
            <div className="mt-4 space-y-3">
              {task.subtasks.map(sub => (
                <div key={sub.id} className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-3 flex items-start gap-3 ml-2 relative">
                  <div className={cn("absolute left-0 top-3 bottom-3 w-0.5 rounded-full", task.priority === 'high' ? 'bg-red-400' : 'bg-zinc-300')} />
                  <button onClick={(e) => { e.stopPropagation(); onToggleSubtask(task.id, sub.id); }} className="mt-0.5">
                    {sub.is_completed ? <CheckCircle2 size={16} className="text-accent-green" /> : <Circle size={16} className="text-zinc-300" />}
                  </button>
                  <span className={cn("text-xs font-bold transition-all duration-500", sub.is_completed ? "line-through text-zinc-400 font-medium opacity-50" : "")}>{sub.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Page Components ---

const SchedulePage = ({ tasks, riseTime, windDownTime }) => {
  const dates = useMemo(() => getDatesRange(), []);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const carouselRef = useRef(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    if (carouselRef.current) {
      const weekIdx = Math.floor(dates.findIndex(d => d.toDateString() === date.toDateString()) / 7);
      if (weekIdx !== -1) {
        carouselRef.current.scrollTo({ left: weekIdx * carouselRef.current.offsetWidth, behavior: 'smooth' });
      }
    }
  };

  const todayTasks = tasks.filter(t => {
    if (t.recurrence_type === 'Daily') return true;
    if (!t.due_date) {
      return selectedDate.toDateString() === new Date().toDateString();
    }
    const d = new Date(t.due_date);
    return d.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => (a.due_time || '00:00').localeCompare(b.due_time || '00:00'));

  const timelineItems = [
    { time: riseTime, title: 'Rise & Shine', type: 'anchor' },
    ...todayTasks.map(t => ({ time: t.due_time || 'All Day', title: t.title, type: 'task', is_completed: t.is_completed })),
    { time: windDownTime, title: 'Wind Down', type: 'anchor' }
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="px-6 pt-16 pb-4 flex justify-between items-end border-b border-zinc-50">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-green">Mesmer</h1>
            <span className="text-[9px] font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full">{getEthiopianDate(selectedDate)}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
        </div>
        <div className="relative">
          <button onClick={() => setShowCalendar(!showCalendar)} className="w-10 h-10 flex items-center justify-center bg-zinc-50 rounded-full">
            <Calendar size={20} className="text-zinc-600" />
          </button>
          <AnimatePresence>
            {showCalendar && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 bg-white apple-card border border-zinc-100 shadow-2xl p-4 z-[60] w-64">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <span key={d} className="text-[8px] font-black text-zinc-300">{d}</span>)}
                    {Array.from({ length: 31 }).map((_, i) => {
                      const d = i + 1;
                      const isToday = d === new Date().getDate();
                      return (
                        <button key={i} onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(d);
                          handleDateSelect(newDate);
                        }} className={cn("h-7 w-7 rounded-lg text-[10px] font-bold flex items-center justify-center", isToday ? "bg-accent-green text-white" : "hover:bg-zinc-50")}>{d}</button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div ref={carouselRef} className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory border-b border-zinc-50 transition-all scroll-smooth">
        {Array.from({ length: 4 }).map((_, weekIdx) => (
          <div key={weekIdx} className="min-w-full flex justify-between px-4 py-6 snap-center">
            {dates.slice(weekIdx * 7, (weekIdx + 1) * 7).map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              return (
                <button key={i} onClick={() => handleDateSelect(date)} className="flex flex-col items-center gap-1.5 w-10">
                  <span className={cn("text-[10px] font-black uppercase font-mono", isSelected ? "text-accent-green" : "text-zinc-300")}>{date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</span>
                  <div className={cn("w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold transition-all", isSelected ? "bg-charcoal text-white" : isToday ? "text-accent-green border border-accent-green/20" : "text-zinc-500 hover:bg-zinc-50")}>{date.getDate()}</div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-32 no-scrollbar">
        <div className="relative border-l border-zinc-100 ml-4 space-y-12">
          {timelineItems.map((item, idx) => (
            <div key={idx} className="relative pl-8">
              <div className={cn("absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white", item.type === 'task' ? (item.is_completed ? "bg-accent-green" : "bg-zinc-300") : "bg-charcoal")} />
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black font-mono text-zinc-300">{item.time}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.title}</span>
              </div>
              {item.type === 'task' && (
                <div className={cn("apple-card p-4 border-none shadow-sm", item.is_completed ? "bg-emerald-50/50" : "bg-zinc-50")}>
                  <p className={cn("text-sm font-bold", item.is_completed && "line-through text-zinc-400")}>{item.title}</p>
                </div>
              )}
            </div>
          ))}
          {timelineItems.length === 2 && (
            <div className="py-12 text-center">
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">No objectives for this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsPage = ({ userName, profile, setProfile, tasks, pages, setPages, riseTime, setRiseTime, windDownTime, setWindDownTime }) => {
  const [dataSaver, setDataSaver] = useState(false);
  const [language, setLanguage] = useState('Eng (US)');
  const [popupContent, setPopupContent] = useState(null);

  // Calculate realtime performance
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // approx start of week
  const completedThisWeek = tasks.filter(t => t.is_completed && new Date(t.created_at || t.due_date) >= startOfWeek).length;
  const totalThisWeek = tasks.filter(t => new Date(t.created_at || t.due_date) >= startOfWeek).length;
  const currentProgress = totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0;
  const progress = { current: currentProgress, previous: 62 }; // Mocked historical

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

      {/* Section 1: Performance */}
      <section className="mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-6 font-mono">Performance Overview</h4>
        <div className="space-y-6">
          {['Current Week', 'Previous Week'].map(label => (
            <div key={label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-zinc-500">{label}</span>
                <span className="text-xs font-black text-accent-green">{label.includes('Current') ? progress.current : progress.previous}%</span>
              </div>
              <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${label.includes('Current') ? progress.current : progress.previous}%` }} className="h-full bg-accent-green rounded-full" />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl">
            <Sparkles size={20} className="text-accent-green" />
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-400">Efficiency Score</p>
              <p className="text-lg font-black leading-tight text-charcoal">84.2%</p>
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

// --- Landing Flow ---

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
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

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
            <button onClick={() => setStep(4)} className="apple-button bg-charcoal text-white w-full py-4 uppercase font-bold text-xs tracking-widest">Align Workspace</button>
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

// --- Main App ---

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('ToDo');
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [sortOrder, setSortOrder] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceInput, setWorkspaceInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [pages, setPages] = useState([]);
  const [riseTime, setRiseTime] = useState('05:45');
  const [windDownTime, setWindDownTime] = useState('23:45');

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (session) {
          await handleSession(session);
        }
      } catch (err) {
        console.error("Supabase init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        if (session) {
          await handleSession(session);
        } else {
          setTasks([]);
          setPages([]);
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session) => {
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{ 
          id: session.user.id, 
          full_name: session.user.user_metadata?.full_name || '',
          onboarding_completed: false 
        }])
        .select()
        .single();
      if (!createError) profileData = newProfile;
    }

    setProfile(profileData);
    setUserName(profileData?.full_name || session.user.email.split('@')[0]);
    fetchData(session.user.id);

    // Set up Realtime subscriptions
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData(session.user.id))
      .subscribe();

    const subtasksSubscription = supabase
      .channel('subtasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, () => fetchData(session.user.id))
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
      subtasksSubscription.unsubscribe();
    };
  };

  const fetchData = async (userId) => {
    // Fetch Swipe Pages
    let { data: swipePages, error: pagesError } = await supabase
      .from('swipe_pages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!swipePages || swipePages.length === 0) {
      const { data: newPages } = await supabase
        .from('swipe_pages')
        .insert(DEFAULT_PAGES.map(p => ({ ...p, user_id: userId })))
        .select();
      swipePages = newPages;
    }
    setPages(swipePages || []);

    // Fetch Tasks & Subtasks separately as per new schema
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: subtasksData } = await supabase
      .from('subtasks')
      .select('*')
      .eq('user_id', userId);

    const tasksWithSubtasks = tasksData?.map(task => ({
      ...task,
      subtasks: subtasksData?.filter(s => s.task_id === task.id) || []
    })) || [];

    console.log('Retrieved Tasks:', tasksWithSubtasks);
    setTasks(tasksWithSubtasks);
  };

  const activePages = useMemo(() => [
    { name: 'Main', is_active: true },
    ...pages.filter(p => p.is_active)
  ], [pages]);

  const currentFilteredTasks = useMemo(() => {
    let filtered = tasks;
    const pageObj = activePages[swipeIndex] || activePages[0];
    if (pageObj && pageObj.name !== 'Main') {
      filtered = tasks.filter(t => t.tag_name === pageObj.name || (pageObj.name.includes('Work') && t.tag_name === 'Coding'));
    }
    
    if (sortOrder === 'priority') {
      const pMap = { high: 1, medium: 2, low: 3 };
      filtered = [...filtered].sort((a, b) => (pMap[a.priority?.toLowerCase()] || 4) - (pMap[b.priority?.toLowerCase()] || 4));
    } else if (sortOrder === 'date') {
      filtered = [...filtered].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
    }
    
    return filtered;
  }, [tasks, swipeIndex, activePages, sortOrder]);

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newDone = !task.is_completed;
    
    // Cascading Done
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, is_completed: newDone, subtasks: newDone ? t.subtasks.map(s => ({ ...s, is_completed: true })) : t.subtasks } 
        : t
    ));

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: newDone })
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
      fetchData(session.user.id);
    } else {
      if (newDone && task.subtasks?.length > 0) {
        await supabase.from('subtasks').update({ is_completed: true }).eq('task_id', id);
      }
      
      // Recurrence Check: Spawn next instance if repeating
      if (newDone && task.recurrence_type && ['Daily', 'Weekly', 'Monthly'].includes(task.recurrence_type) && task.due_date) {
        const { id: oldId, created_at, is_completed, subtasks, ...rest } = task;
        const newDate = new Date(task.due_date);
        
        if (task.recurrence_type === 'Daily') newDate.setDate(newDate.getDate() + 1);
        if (task.recurrence_type === 'Weekly') newDate.setDate(newDate.getDate() + 7);
        if (task.recurrence_type === 'Monthly') newDate.setMonth(newDate.getMonth() + 1);
        
        const newDateStr = newDate.toISOString().split('T')[0];
        
        const { error: spawnError } = await supabase.from('tasks').insert([{ ...rest, due_date: newDateStr, is_completed: false }]);
        if (!spawnError) fetchData(session.user.id);
      }
    }
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task:', error);
      fetchData(session?.user?.id);
    }
  };

  const toggleSubtask = async (taskId, subId) => {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(s => s.id === subId);
    if (!subtask) return;

    const newDone = !subtask.is_completed;
    
    // Optimistic UI
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      subtasks: t.subtasks.map(s => s.id === subId ? { ...s, is_completed: newDone } : s)
    } : t));

    const { error } = await supabase
      .from('subtasks')
      .update({ is_completed: newDone })
      .eq('id', subId);

    if (error) {
      console.error('Error updating subtask:', error);
      fetchData(session.user.id); // Revert
    }
  };

  const addSubtask = async (taskId, title) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('subtasks')
      .insert([{ 
        title, 
        task_id: taskId, 
        user_id: user.id, 
        is_completed: false 
      }])
      .select();

    if (error) console.error('Error creating subtask:', error);
    else fetchData(user.id);
  };

  const addTask = async (taskData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { 
      id, title, priority, color, is_completed, 
      recurrence, custom_days, tags, date, time, location,
      subtasks
    } = taskData;
    
    const finalTaskData = {
      title,
      priority,
      color,
      is_completed,
      recurrence_type: recurrence,
      custom_days,
      user_id: user.id,
      tag_name: tags?.[0]?.name || null,
      due_date: date || null,
      due_time: time || null,
      location_data: location ? { address: location } : null,
      deadline_passed: false 
    };

    if (id) finalTaskData.id = id;
    const tempId = id || ('temp-' + Date.now()); 

    // Optimistic UI Update
    const optimisticTask = { 
       ...finalTaskData, 
       id: tempId, 
       subtasks: subtasks || []
    };
    
    if (id) {
      setTasks(prev => prev.map(t => t.id === id ? optimisticTask : t));
    } else {
      setTasks(prev => [optimisticTask, ...prev]);
    }

    // Perform Supabase Operation
    const { data, error } = await supabase
      .from('tasks')
      .upsert([finalTaskData])
      .select()
      .single();

    if (error) {
      console.error('Error adding/updating task:', error.message, error.details);
      fetchData(user.id); // Revert UI
    } else {
      // Background Subtask Insertions
      if (subtasks && subtasks.length > 0) {
        const subtasksToInsert = subtasks.filter(s => s.id.startsWith('temp-')).map(s => ({
          title: s.title,
          task_id: data.id,
          user_id: user.id,
          is_completed: s.is_completed
        }));
        
        if (subtasksToInsert.length > 0) {
          await supabase.from('subtasks').insert(subtasksToInsert);
        }
      }
      fetchData(user.id);
    }
  };

  const duplicateTask = async (task) => {
    const { id, created_at, subtasks, ...rest } = task;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newTasks, error } = await supabase
      .from('tasks')
      .insert([{ ...rest, title: `${task.title} (Copy)`, is_completed: false, user_id: user.id }])
      .select();

    if (error) {
      console.error('Error duplicating task:', error);
    } else if (newTasks && newTasks.length > 0) {
      // Also duplicate its subtasks
      if (subtasks && subtasks.length > 0) {
        const subtasksToInsert = subtasks.map(s => ({
          title: s.title,
          task_id: newTasks[0].id,
          user_id: user.id,
          is_completed: false
        }));
        await supabase.from('subtasks').insert(subtasksToInsert);
      }
      fetchData(user.id);
    }
  };

  const handleAddWorkspace = async () => {
    if (!workspaceInput.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('swipe_pages')
      .insert([{ name: workspaceInput.trim(), color: 'bg-zinc-800', user_id: user.id, is_active: true }])
      .select();

    if (error) console.error('Error adding page:', error);
    else {
      setWorkspaceInput('');
      setShowWorkspaceModal(false);
      fetchData(user.id);
    }
  };

  const completeOnboarding = async (name, role = 'Personal') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: name, 
        workspace_role: role,
        onboarding_completed: true 
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
    } else {
      setProfile(prev => ({ ...prev, full_name: name, workspace_role: role, onboarding_completed: true }));
      setUserName(name);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-4">
      <Sparkles className="animate-spin text-accent-green" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Workspace...</p>
    </div>
  );

  if (!session) return <AuthPage />;

  if (profile && !profile.onboarding_completed) {
    return <LandingPage onComplete={completeOnboarding} />;
  }


  return (
    <div className="relative h-screen w-full max-w-md mx-auto bg-white overflow-hidden border-x border-zinc-100 flex flex-col font-sans transition-all duration-300">

      {activeTab === 'ToDo' && (
        <header className="px-6 pt-16 pb-4 flex justify-between items-end bg-white z-10">
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-green mb-0.5">Mesmer</h1>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{activePages[swipeIndex]?.name || 'ToDo'}</h2>
              {isSelectMode && <span className="bg-charcoal text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{selectedTaskIds.length}</span>}
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 flex items-center justify-center bg-zinc-50 rounded-full"><MoreVertical size={20} /></button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 bg-white apple-card border border-zinc-100 shadow-2xl p-2 z-[60] w-48">
                    {[
                      { label: 'Sort By', icon: Search, action: () => setShowSortModal(true) },
                      { label: 'Manage Workspaces', icon: Layout, action: () => setShowWorkspaceModal(true) },
                      { label: isSelectMode ? 'Cancel Selection' : 'Select Tasks', icon: CheckSquare, action: () => { setIsSelectMode(!isSelectMode); setSelectedTaskIds([]); } }
                    ].map(item => (
                      <button key={item.label} onClick={() => { item.action?.(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 text-sm font-semibold transition-colors">
                        <item.icon size={16} className="text-zinc-400" /> {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>
      )}

      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'ToDo' && (
            <motion.div key={`todo-${swipeIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full px-6 overflow-y-auto pb-48 no-scrollbar"
              drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(e, info) => {
                if (info.offset.x < -50 && swipeIndex < activePages.length - 1) setSwipeIndex(prev => prev + 1);
                if (info.offset.x > 50 && swipeIndex > 0) setSwipeIndex(prev => prev - 1);
              }}
            >
              {activePages[swipeIndex]?.name === 'Custom' ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-16 h-16 bg-zinc-50 rounded-[28px] flex items-center justify-center border-2 border-dashed border-zinc-200"><Plus className="text-zinc-300" size={32} /></div>
                  <h3 className="font-bold text-lg">Create Custom View</h3>
                </div>
              ) : (
                <div className="pt-4">
                  {currentFilteredTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTask} onToggleSubtask={toggleSubtask} onDuplicate={duplicateTask} onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }} onDelete={deleteTask} isSelectMode={isSelectMode} isSelected={selectedTaskIds.includes(task.id)} onSelect={(id) => setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'Schedule' && <SchedulePage tasks={tasks} riseTime={riseTime} windDownTime={windDownTime} />}
          {activeTab === 'AI' && <AIPage />}
          {activeTab === 'Settings' && <SettingsPage userName={userName} profile={profile} setProfile={setProfile} tasks={tasks} pages={pages} setPages={setPages} riseTime={riseTime} setRiseTime={setRiseTime} windDownTime={windDownTime} setWindDownTime={setWindDownTime} />}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSelectMode && selectedTaskIds.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="absolute bottom-28 left-4 right-4 z-[90] bg-charcoal text-white rounded-[24px] shadow-2xl p-4 flex justify-between items-center px-6">
            <span className="text-xs font-black uppercase tracking-widest">{selectedTaskIds.length} Selected</span>
            <div className="flex gap-2">
              <button onClick={() => {
                 selectedTaskIds.forEach(id => toggleTask(id));
                 setIsSelectMode(false);
                 setSelectedTaskIds([]);
              }} className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">Done</button>
              <button onClick={async () => {
                 const ws = prompt('Enter exact Workspace name to move tasks to:');
                 if (ws) {
                   await Promise.all(selectedTaskIds.map(id => supabase.from('tasks').update({ tag_name: ws }).eq('id', id)));
                   fetchData(session?.user?.id);
                   setIsSelectMode(false);
                   setSelectedTaskIds([]);
                 }
              }} className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">Move</button>
              <button onClick={() => {
                 selectedTaskIds.forEach(id => deleteTask(id));
                 setIsSelectMode(false);
                 setSelectedTaskIds([]);
              }} className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl transition-all">Delete</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 z-50">
        {activeTab === 'ToDo' && (
          <div className="flex justify-center gap-1.5 py-4 bg-gradient-to-t from-white via-white to-transparent">
            {activePages.map((_, i) => <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", swipeIndex === i ? "w-6 bg-charcoal" : "w-1.5 bg-zinc-200")} />)}
          </div>
        )}
        {activeTab !== 'AI' && !isSelectMode && (
          <div className="absolute -top-20 right-6">
            <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="w-14 h-14 bg-charcoal text-white flex items-center justify-center rounded-[20px] shadow-2xl shadow-charcoal/30 active:scale-95 transition-transform"><Plus size={28} /></button>
          </div>
        )}
        <nav className="bg-white/90 backdrop-blur-xl border-t border-zinc-100 flex justify-between px-8 pt-4 pb-10">
          {[
            { label: 'ToDo', icon: Layers },
            { label: 'Schedule', icon: CalendarDays },
            { label: 'AI', icon: Sparkles },
            { label: 'Settings', icon: SettingsIcon },
          ].map(item => (
            <button key={item.label} onClick={() => { setActiveTab(item.label); setIsSelectMode(false); }} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === item.label ? "text-charcoal scale-110" : "text-zinc-300")}>
              <item.icon size={22} strokeWidth={activeTab === item.label ? 2.5 : 1.5} />
              <span className="text-[9px] font-black uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} onAdd={addTask} availableTags={activePages.map(p => p.name)} initialData={editingTask} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSortModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm flex items-end px-4 pb-4" onClick={() => setShowSortModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-[32px] p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Sort Objectives By</h3>
              <div className="space-y-2">
                {['default', 'priority', 'date'].map(s => (
                  <button key={s} onClick={() => { setSortOrder(s); setShowSortModal(false); }} className={cn("w-full text-left px-4 py-3 rounded-xl font-bold text-sm capitalize transition-all", sortOrder === s ? "bg-accent-green text-white" : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100")}>
                    {s === 'default' ? 'Creation Order (Default)' : s === 'date' ? 'Due Date' : 'Priority'}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWorkspaceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm flex items-end px-4 pb-4" onClick={() => setShowWorkspaceModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-[32px] p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">New Workspace</h3>
              <input autoFocus value={workspaceInput} onChange={e => setWorkspaceInput(e.target.value)} placeholder="Workspace Name (e.g. Finance)" className="w-full bg-zinc-50 border-none p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent-green mb-4" />
              <button onClick={handleAddWorkspace} className="w-full py-4 bg-charcoal text-white rounded-2xl font-bold text-sm tracking-widest uppercase">Create</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

const AddTaskModal = ({ onClose, onAdd, availableTags, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.due_date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.due_time || '');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [reminders, setReminders] = useState(false);
  const [location, setLocation] = useState(initialData?.location_data?.address || '');
  const [color, setColor] = useState(initialData?.color || 'bg-zinc-800');
  const [recurrence, setRecurrence] = useState(initialData?.recurrence_type || 'Once');
  const [customDays, setCustomDays] = useState(initialData?.custom_days || []);
  const [selectedTags, setSelectedTags] = useState(initialData?.tag_name ? [initialData.tag_name] : []);
  
  // Subtasks State
  const [subtasks, setSubtasks] = useState(initialData?.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState('');

  const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const colors = ['bg-zinc-800', 'bg-emerald-500', 'bg-blue-500', 'bg-yellow-400', 'bg-red-500', 'bg-purple-500'];

  const toggleDay = (d) => setCustomDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleTag = (tagName) => setSelectedTags([tagName]); // Only one tag allowed based on old flow

  const handleAddSubtask = (e) => {
    if (e.key === 'Enter' && subtaskInput.trim()) {
      e.preventDefault();
      setSubtasks([...subtasks, { id: 'temp-' + Date.now(), title: subtaskInput.trim(), is_completed: false }]);
      setSubtaskInput('');
    }
  };

  const handleAdd = () => {
    if (!title) return;
    onAdd({
      id: initialData?.id,
      title,
      date,
      time,
      priority,
      color,
      recurrence,
      custom_days: customDays,
      is_completed: initialData?.is_completed || false,
      tags: selectedTags.map(name => ({ name })),
      location,
      subtasks: subtasks.filter(s => s.title.trim() !== '')
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-charcoal/40 backdrop-blur-md flex items-end px-4 pb-4" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-[40px] p-8 pb-12 max-w-md mx-auto shadow-2xl relative overflow-y-auto no-scrollbar max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold">{initialData ? 'Edit Objective' : 'New Objective'}</h3>
          <button onClick={onClose} className="p-2 bg-zinc-50 rounded-full"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <input autoFocus placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-2xl font-bold border-none p-0 focus:ring-0 bg-transparent" />

          {/* Subtasks UI */}
          <div className="space-y-3 bg-zinc-50/50 p-4 rounded-3xl border border-zinc-100">
            <div className="flex justify-between items-center">
               <label className="text-[9px] font-black uppercase text-zinc-400">Subtasks</label>
               <button onClick={() => setSubtasks([...subtasks, { id: 'temp-' + Date.now(), title: '', is_completed: false }])} className="text-[9px] font-black text-accent-green bg-accent-green/10 px-2 py-1 rounded-lg uppercase tracking-widest flex items-center"><Plus size={10} className="mr-1" />Add</button>
            </div>
            <div className="space-y-2 relative pl-2">
              {subtasks.length > 0 && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-zinc-200 rounded-full" />}
              {subtasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-2 relative z-10 pl-2">
                   <div className="w-4 h-4 rounded-full border-2 border-zinc-300 bg-white shadow-sm flex items-center justify-center">
                      {sub.is_completed && <div className="w-2 h-2 rounded-full bg-accent-green" />}
                   </div>
                   <input autoFocus={sub.title === ''} value={sub.title} onChange={e => setSubtasks(subtasks.map(s => s.id === sub.id ? { ...s, title: e.target.value } : s))} placeholder="Enter subtask..." className="flex-1 bg-white border border-zinc-100 p-2.5 rounded-xl text-xs font-bold focus:ring-1 focus:ring-accent-green transition-all shadow-sm" />
                   <button onClick={() => setSubtasks(subtasks.filter(s => s.id !== sub.id))} className="text-zinc-300 hover:text-red-400 p-2"><X size={14} /></button>
                </div>
              ))}
              {subtasks.length === 0 && <p className="text-[10px] text-zinc-400 font-bold ml-2">No subtasks added.</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-300">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.filter(t => t !== 'Main').map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all", selectedTags.includes(tag) ? "bg-charcoal border-charcoal text-white" : "bg-zinc-50 border-zinc-100 text-zinc-400")}>{tag}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-zinc-300">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-zinc-50 p-3 rounded-xl border-none text-xs font-bold" /></div>
            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-zinc-300">Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-zinc-50 p-3 rounded-xl border-none text-xs font-bold" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-300">Priority</label>
              <div className="flex bg-zinc-50 rounded-xl p-1">
                {['low', 'medium', 'high'].map(p => (
                  <button key={p} onClick={() => setPriority(p)} className={cn("flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all", priority === p ? "bg-white shadow-sm" : "text-zinc-400")}>{p}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-300">Reminders</label>
              <button onClick={() => setReminders(!reminders)} className={cn("w-full py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all text-center", reminders ? "bg-accent-green text-white" : "bg-zinc-50 text-zinc-400")}>{reminders ? 'On' : 'Off'}</button>
            </div>
          </div>

          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-zinc-300">Location</label><div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-xl"><MapPin size={14} className="text-zinc-300" /><input placeholder="Add Location" value={location} onChange={e => setLocation(e.target.value)} className="bg-transparent border-none p-0 text-xs font-bold w-full" /></div></div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-zinc-300">Task Color</label>
            <div className="flex gap-3">
              {colors.map(c => <button key={c} onClick={() => setColor(c)} className={cn("w-6 h-6 rounded-full transition-transform", c, color === c ? "scale-125 ring-2 ring-charcoal ring-offset-2" : "opacity-40 hover:opacity-100")} />)}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-300">Recurrence</label>
            <div className="grid grid-cols-5 gap-1">
              {['Once', 'Daily', 'Weekly', 'Monthly', 'Custom'].map(r => (
                <button key={r} onClick={() => setRecurrence(r)} className={cn("py-2 rounded-lg text-[8px] font-black uppercase transition-all", recurrence === r ? "bg-charcoal text-white" : "bg-zinc-50 text-zinc-400")}>{r}</button>
              ))}
            </div>
            {recurrence === 'Custom' && (
              <div className="flex justify-between py-2">
                {daysLabels.map((d, i) => (
                  <button key={i} onClick={() => toggleDay(d)} className={cn("w-8 h-8 rounded-full text-[9px] font-bold transition-all", customDays.includes(d) ? "bg-accent-green text-white" : "bg-zinc-50 text-zinc-400")}>{d}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={handleAdd} className="w-full bg-charcoal text-white py-4 rounded-[22px] font-bold text-sm tracking-widest uppercase mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all">{initialData ? 'Save Objective' : 'Activate Task'}</button>
      </motion.div>
    </motion.div>
  );
};
