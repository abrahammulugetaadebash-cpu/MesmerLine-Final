import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, CheckCircle2, Circle, Copy, Trash, CheckSquare, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

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

export default TaskCard;
