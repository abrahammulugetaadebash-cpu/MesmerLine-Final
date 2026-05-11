import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

// Helper for rough Ethiopian calendar display
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

export default SchedulePage;
