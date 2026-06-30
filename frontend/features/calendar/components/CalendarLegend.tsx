import { motion } from 'framer-motion';
import { IconActivity, IconCalendar, IconChartCandle, IconTrendingUp } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { LegendItem, MicroStats, StatBadge } from '../types';

export const CalendarLegend = ({ microStats }: { microStats: MicroStats }) => {
  return (
    <motion.footer variants={fadeUp} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-[#0C0C0E] border border-white/[0.06] rounded-[20px] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-3 font-bold mb-4">Status Legend</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { label: 'Profit', description: 'Glowing Emerald', dotClass: 'bg-[#00FFB2] shadow-[0_0_12px_rgba(0,255,178,0.5)]' },
            { label: 'Loss', description: 'Crimson Red', dotClass: 'bg-[#FF5A5A]' },
            { label: 'Break Even', description: 'Amber', dotClass: 'bg-[#FFB800]' },
            { label: 'No Executions', description: 'Locked', dotClass: 'bg-white/[0.04] border border-white/[0.08]' }
          ] satisfies LegendItem[]).map(({ label, description, dotClass }) => (
            <div key={label} className="flex items-center gap-3 rounded-[12px] bg-white/[0.025] border border-white/[0.05] p-3">
              <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
              <div>
                <p className="text-sm font-bold text-text-1">{label}</p>
                <p className="text-xs text-text-3">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 grid grid-cols-2 gap-3">
        {([
          { label: 'Active Trading Days', value: microStats.activeDays.toLocaleString(), icon: IconCalendar },
          { label: 'Win Rate', value: `${microStats.winRate}%`, icon: IconTrendingUp },
          { label: 'Profit Factor', value: microStats.profitFactor.toFixed(2), icon: IconActivity },
          { label: 'Total Trades', value: microStats.totalTrades.toLocaleString(), icon: IconChartCandle }
        ] satisfies StatBadge[]).map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#0C0C0E] border border-white/[0.06] rounded-[20px] p-4 min-w-0">
            <Icon size={18} className="text-text-3 mb-3" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-text-3 font-bold truncate">{label}</p>
            <p className="text-lg font-extrabold text-text-1 mt-1 truncate">
              {value}
            </p>
          </div>
        ))}
      </div>
    </motion.footer>
  );
};
