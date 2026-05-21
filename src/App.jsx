import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Search,
  MoreVertical,
  CheckSquare,
  Layers,
  Layout,
  Plus,
  CalendarDays,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import AuthPage from './AuthPage';
import { cn } from './lib/utils';

// Extracted Components
import TaskCard from './components/TaskCard';
import SchedulePage from './components/SchedulePage';
import AIPage from './components/AIPage';
import SettingsPage from './components/SettingsPage';
import LandingPage from './components/LandingPage';
import AddTaskModal from './components/AddTaskModal';

// --- Constants ---
const DEFAULT_PAGES = [
  { name: 'Work (Coding)', is_active: true, color: 'bg-zinc-500' },
  { name: 'Family', is_active: true, color: 'bg-blue-500' },
  { name: 'Groceries', is_active: true, color: 'bg-yellow-400' },
];

export default function App() {
  if (!supabase) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-8 text-center bg-red-50 font-sans">
        <Shield size={48} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-red-900 mb-2 uppercase tracking-tight">Vercel Environment Variables Not Detected</h1>
        <p className="text-sm text-red-700 max-w-md font-medium leading-relaxed">
          Critical runtime failure: The application cannot establish a connection to the backend. 
          Please ensure <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> are correctly configured in your Vercel project settings and a new deployment has been triggered.
        </p>
        <div className="mt-8 p-4 bg-white/50 rounded-2xl border border-red-100 text-[10px] font-mono text-red-400 uppercase tracking-widest">
          Status: Offline | Data Plane: Disconnected
        </div>
      </div>
    );
  }

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forceShowApp, setForceShowApp] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('ToDo');
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [animatingIds, setAnimatingIds] = useState(new Set());
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [sortOrder, setSortOrder] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceInput, setWorkspaceInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [pages, setPages] = useState([]);
  const [riseTime, setRiseTime] = useState('05:45');
  const [windDownTime, setWindDownTime] = useState('23:45');

  const fetchData = useCallback(async (userId) => {
    let { data: swipePages } = await supabase
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

    setTasks(tasksWithSubtasks);
  }, []);

  const handleSession = useCallback(async (session) => {
    try {
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

      setProfile(profileData || { onboarding_completed: false });
      setUserName(profileData?.full_name || session.user.email.split('@')[0]);
      fetchData(session.user.id);

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
    } catch (err) {
      console.error("Handle Session Error:", err);
      setProfile({ onboarding_completed: false }); // Fallback to allow app mount
      setLoading(false);
    }
  }, [fetchData]);

  // Bail-Out Switch: Break potential boot-loops
  useEffect(() => {
    const emergencyTimer = setTimeout(() => {
      setForceShowApp(true);
    }, 3000);
    return () => clearTimeout(emergencyTimer);
  }, []);

  useEffect(() => {
    // Safety Fallback: Ensure loading never runs indefinitely
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3s definitive timeout

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth Session Error:", error);
          // Purge corrupted session data
          localStorage.clear();
          throw error;
        }
        setSession(session);
        if (session) {
          await handleSession(session);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Supabase init error:", err);
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_OUT') {
           localStorage.clear();
           setSession(null);
           setProfile(null);
           setLoading(false);
           return;
        }

        setSession(session);
        if (session) {
          await handleSession(session);
        } else {
          setTasks([]);
          setPages([]);
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [handleSession]);

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
    if (!task || animatingIds.has(id)) return;

    // Trigger Kinetic Animation
    setAnimatingIds(prev => new Set(prev).add(id));
    
    setTimeout(async () => {
      const newDone = !task.is_completed;
      setTasks(prev => prev.map(t => 
        t.id === id 
          ? { ...t, is_completed: newDone, subtasks: newDone ? t.subtasks.map(s => ({ ...s, is_completed: true })) : t.subtasks } 
          : t
      ));

      const { error } = await supabase.from('tasks').update({ is_completed: newDone }).eq('id', id);
      setAnimatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      if (error) {
        console.error('Error updating task:', error);
        fetchData(session.user.id);
      } else {
        if (newDone && task.subtasks?.length > 0) {
          await supabase.from('subtasks').update({ is_completed: true }).eq('task_id', id);
        }
        if (newDone && task.recurrence_type && ['Daily', 'Weekly', 'Monthly'].includes(task.recurrence_type) && task.due_date) {
          const { id: _oldId, created_at: _created_at, is_completed: _is_completed, subtasks: _subtasks, ...rest } = task;
          const newDate = new Date(task.due_date);
          if (task.recurrence_type === 'Daily') newDate.setDate(newDate.getDate() + 1);
          if (task.recurrence_type === 'Weekly') newDate.setDate(newDate.getDate() + 7);
          if (task.recurrence_type === 'Monthly') newDate.setMonth(newDate.getMonth() + 1);
          const newDateStr = newDate.toISOString().split('T')[0];
          await supabase.from('tasks').insert([{ ...rest, due_date: newDateStr, is_completed: false }]);
          fetchData(session.user.id);
        }
      }
    }, 400); // Wait for Kinetic Animation timeline
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
    if (!subtask || animatingIds.has(subId)) return;

    // Trigger Kinetic Animation
    setAnimatingIds(prev => new Set(prev).add(subId));

    setTimeout(async () => {
      const newDone = !subtask.is_completed;
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t,
        subtasks: t.subtasks.map(s => s.id === subId ? { ...s, is_completed: newDone } : s)
      } : t));

      const { error } = await supabase.from('subtasks').update({ is_completed: newDone }).eq('id', subId);
      setAnimatingIds(prev => {
        const next = new Set(prev);
        next.delete(subId);
        return next;
      });

      if (error) {
        console.error('Error updating subtask:', error);
        fetchData(session.user.id);
      }
    }, 400); // Kinetic Animation delay
  };

  const addTask = async (taskData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, title, priority, color, is_completed, recurrence, custom_days, tags, date, time, location, subtasks } = taskData;
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

    // Optimistic UI Update
    const tempId = id || ('temp-' + Date.now()); 
    const optimisticTask = { ...finalTaskData, id: tempId, subtasks: subtasks || [] };
    if (id) {
      setTasks(prev => prev.map(t => t.id === id ? optimisticTask : t));
    } else {
      setTasks(prev => [optimisticTask, ...prev]);
    }

    try {
      let result;
      if (id) {
        result = await supabase.from('tasks').update(finalTaskData).eq('id', id).select().single();
      } else {
        result = await supabase.from('tasks').insert([finalTaskData]).select().single();
      }

      const { data, error } = result;
      if (error) throw error;

      if (subtasks && subtasks.length > 0) {
        const subtasksToInsert = subtasks
          .filter(s => typeof s.id === 'string' && s.id.startsWith('temp-'))
          .map(s => ({ 
            title: s.title, 
            task_id: data.id, 
            user_id: user.id, 
            is_completed: s.is_completed 
          }));
        
        if (subtasksToInsert.length > 0) {
          const { error: subError } = await supabase.from('subtasks').insert(subtasksToInsert);
          if (subError) console.error('Error adding subtasks:', subError.message);
        }
      }
      fetchData(user.id);
    } catch (err) {
      console.error('Task Sync Error:', err.message);
      fetchData(user.id); // Rollback optimistic update
    }
  };

  const duplicateTask = async (task) => {
    const { id: _id, created_at: _created_at, subtasks, ...rest } = task;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newTasks, error } = await supabase.from('tasks').insert([{ ...rest, title: `${task.title} (Copy)`, is_completed: false, user_id: user.id }]).select();
    if (error) console.error('Error duplicating task:', error);
    else if (newTasks && newTasks.length > 0) {
      if (subtasks && subtasks.length > 0) {
        const subtasksToInsert = subtasks.map(s => ({ title: s.title, task_id: newTasks[0].id, user_id: user.id, is_completed: false }));
        await supabase.from('subtasks').insert(subtasksToInsert);
      }
      fetchData(user.id);
    }
  };

  const handleAddWorkspace = async () => {
    if (!workspaceInput.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('swipe_pages').insert([{ name: workspaceInput.trim(), color: 'bg-zinc-800', user_id: user.id, is_active: true }]).select();
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
    const { error } = await supabase.from('profiles').update({ full_name: name, workspace_role: role, onboarding_completed: true }).eq('id', user.id);
    if (error) console.error('Error updating profile:', error);
    else {
      setProfile(prev => ({ ...prev, full_name: name, workspace_role: role, onboarding_completed: true }));
      setUserName(name);
    }
  };

  if (loading && !forceShowApp) return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-4">
      <Sparkles className="animate-spin text-accent-green" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Workspace...</p>
    </div>
  );

  if (!session) return <AuthPage />;
  
  // Wait for profile to load before deciding to show Onboarding or App, but respect the Bail-Out Switch
  if (!profile && !forceShowApp) return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-4">
      <Sparkles className="animate-spin text-accent-green" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verifying your identity...</p>
    </div>
  );

  if (profile && !profile.onboarding_completed) return <LandingPage onComplete={completeOnboarding} />;

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
            <motion.div key={`todo-${swipeIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full px-6 overflow-y-auto pb-48 no-scrollbar" drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(e, info) => {
              if (info.offset.x < -50 && swipeIndex < activePages.length - 1) setSwipeIndex(prev => prev + 1);
              if (info.offset.x > 50 && swipeIndex > 0) setSwipeIndex(prev => prev - 1);
            }}>
              <div className="pt-4">
                {currentFilteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggle={toggleTask} 
                    onToggleSubtask={toggleSubtask} 
                    onDuplicate={duplicateTask} 
                    onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }} 
                    onDelete={deleteTask} 
                    isSelectMode={isSelectMode} 
                    isSelected={selectedTaskIds.includes(task.id)} 
                    onSelect={(id) => setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    isAnimating={animatingIds.has(task.id)}
                    animatingSubtasks={animatingIds}
                  />
                ))}
                {currentFilteredTasks.length === 0 && <div className="py-20 text-center opacity-20 font-black uppercase text-[10px] tracking-widest">No Objectives Found</div>}
              </div>
            </motion.div>
          )}
          {activeTab === 'Schedule' && <SchedulePage tasks={tasks} riseTime={riseTime} windDownTime={windDownTime} />}
          {activeTab === 'AI' && <AIPage />}
          {activeTab === 'Settings' && <SettingsPage userName={userName} profile={profile} setProfile={setProfile} tasks={tasks} pages={pages} setPages={setPages} riseTime={riseTime} setRiseTime={setRiseTime} windDownTime={windDownTime} setWindDownTime={setWindDownTime} />}
        </AnimatePresence>
      </main>

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
