import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth } from 'date-fns';

// Custom Date Picker Component
export const CustomDatePicker = ({ date, setDate, label = 'Date' }: { date: Date, setDate: (d: Date) => void, label?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(date);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const prefixCount = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Monday = 0

  return (
    <div className="relative w-full" ref={calendarRef}>
      <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[#16161A] border ${isOpen ? 'border-[#00FFB2]/40' : 'border-white/[0.08]'} rounded-xl h-11 px-4 flex justify-between items-center text-text-1 hover:border-[#00FFB2]/20 transition-all cursor-pointer`}
      >
        <span className="text-sm font-medium">{format(date, 'yyyy.MM.dd')}</span>
        <IconCalendar size={16} className="text-[#00FFB2]" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+4px)] left-0 w-[280px] bg-[#16161A] border border-white/[0.1] rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-[100]"
          >
            <div className="flex justify-between items-center mb-4">
              <button onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }} className="p-1 text-text-3 hover:text-text-1 transition-colors rounded-md hover:bg-white/[0.08]">
                <IconChevronLeft size={16} />
              </button>
              <span className="text-[13px] font-semibold text-text-1">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }} className="p-1 text-text-3 hover:text-text-1 transition-colors rounded-md hover:bg-white/[0.08]">
                <IconChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <div key={d} className="text-center text-[10px] text-text-3 font-semibold">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: prefixCount }).map((_, i) => (
                <div key={`pad-${i}`} className="p-2" />
              ))}
              {daysInMonth.map(d => {
                const isSelected = isSameDay(d, date);
                const isCurrentMonth = isSameMonth(d, currentMonth);
                return (
                  <div
                    key={d.toISOString()}
                    onClick={() => { setDate(d); setIsOpen(false); }}
                    className={`p-2 text-center text-xs rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#00FFB2] text-black font-bold'
                        : isCurrentMonth
                          ? 'text-[#8888A0] hover:bg-white/[0.05] hover:text-[#00FFB2]'
                          : 'text-text-3/30'
                    }`}
                  >
                    {format(d, 'd')}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
