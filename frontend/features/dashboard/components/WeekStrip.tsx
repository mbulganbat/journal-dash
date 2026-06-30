import { motion } from 'framer-motion';
import { IconCalendarEvent } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { fadeUp } from '../../../lib/animations';
import { WeekDay } from '../types';

export const WeekStrip = ({ currentWeekDays }: { currentWeekDays: WeekDay[] }) => {
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeUp} className="mb-8 w-full">
      <div className="flex items-center gap-2 mb-4">
        <IconCalendarEvent size={20} stroke={2.5} className="text-[#B259FF]" />
        <h3 className="text-[15px] font-semibold text-text-1">This Week</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
        {currentWeekDays.map((day, i) => {
          const isWin = day.pnl > 0;
          const isLoss = day.pnl < 0;
          const hasTrades = day.count > 0;

          return (
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.05, boxShadow: isWin ? "0 10px 25px rgba(0,255,178,0.15)" : isLoss ? "0 10px 25px rgba(255,90,90,0.15)" : "0 10px 25px rgba(255,255,255,0.05)" }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate('/journal')}
              className="bg-bg-2 border border-white/[0.06] rounded-card p-5 flex flex-col items-center justify-center relative group cursor-pointer transition-colors w-full"
            >
              <span className="text-[11px] text-text-3 uppercase tracking-widest font-semibold mb-1">{format(day.date, 'EEE')}</span>
              <span className="text-[16px] font-bold text-text-1 mb-4">{format(day.date, 'MMM dd')}</span>

              {hasTrades ? (
                <div className={`px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2 ${isWin ? 'bg-em/10 text-em shadow-[0_0_12px_rgba(0,255,178,0.15)]' : 'bg-danger/10 text-danger shadow-[0_0_12px_rgba(255,90,90,0.15)]'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isWin ? 'bg-em' : 'bg-danger'} animate-pulse`} />
                  {isWin ? '+' : '-'}${Math.abs(day.pnl).toFixed(0)}
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-white/[0.04] text-text-3 border border-white/[0.05]">
                  No Trades
                </div>
              )}

              {/* Tooltip */}
              {hasTrades && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-bg-3 border border-white/10 text-text-1 text-[12px] px-4 py-2.5 rounded-xl shadow-2xl flex flex-col items-center">
                    <span className="font-bold mb-1">{day.count} Trades</span>
                    <span className="text-text-3">Avg: ${(day.pnl / day.count).toFixed(0)}</span>
                  </div>
                  <div className="w-2.5 h-2.5 bg-bg-3 border-r border-b border-white/10 rotate-45 -mt-1.5" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
