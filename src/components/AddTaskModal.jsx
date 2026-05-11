import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

const AddTaskModal = ({ onClose, onAdd, availableTags, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.due_date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.due_time || '');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [reminders, setReminders] = useState(false);
  const [location, setLocation] = useState(initialData?.location_data?.address || '');
  const [color, setColor] = useState(initialData?.color || 'bg-zinc-800');
  const [recurrence, setRecurrence] = useState(initialData?.recurrence_type || 'Once');
  const [customDays, setCustomDays] = useState(initialData?.custom_days || []);
  const [selectedTags, setSelectedTags] = useState(initialData?.tag_name ? [initialData.tag_name] : []);
  
  // Subtasks State
  const [subtasks, setSubtasks] = useState(initialData?.subtasks || []);

  const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const colors = ['bg-zinc-800', 'bg-emerald-500', 'bg-blue-500', 'bg-yellow-400', 'bg-red-500', 'bg-purple-500'];

  const toggleDay = (d) => setCustomDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleTag = (tagName) => setSelectedTags([tagName]); // Only one tag allowed based on old flow

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

export default AddTaskModal;
