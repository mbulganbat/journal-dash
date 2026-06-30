import { motion } from 'framer-motion';
import { IconActivity, IconCalendar, IconClock, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fadeUp } from '../../../lib/animations';
import { MonthlyWeek, StatBadge, WeekStats } from '../types';
import { formatCurrency, privacyStyle } from '../utils';

interface Props {
  weekStats: WeekStats;
  weekTone: string;
  weeklyNetPnlValue: string;
  monthlyWeeks: MonthlyWeek[];
  privacyMode: boolean;
}

export const WeekSidebar = ({ weekStats, weekTone, weeklyNetPnlValue, monthlyWeeks, privacyMode }: Props) => {
  return (
    <motion.aside variants={fadeUp} className="xl:col-span-3 min-w-0 xl:sticky xl:top-9">
      <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-[20px] p-5 overflow-hidden relative">
        <div
          className="absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${weekTone}18` }}
        />

        <div className="relative z-10 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-3 font-bold">Week Window</p>
              <p className="text-sm text-text-2 mt-1">
                {format(weekStats.start, 'MMM d')} to {format(weekStats.end, 'MMM d')}
              </p>
            </div>
            <div className="h-10 w-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              {weekStats.netPnl >= 0 ? (
                <IconTrendingUp size={20} className="text-[#00FFB2]" />
              ) : (
                <IconTrendingDown size={20} className="text-[#FF5A5A]" />
              )}
            </div>
          </div>

          <div
            className="w-full h-[90px] flex flex-col justify-between p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/[0.06] overflow-hidden flex-shrink-0 min-w-0"
            style={{
              borderColor: `${weekTone}33`,
              background: `linear-gradient(145deg, ${weekTone}12, rgba(255,255,255,0.02))`,
              boxShadow: `0 0 32px ${weekTone}12`
            }}
          >
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase truncate">Weekly Net P&L</p>
            <p
              className="text-3xl font-bold font-mono leading-tight truncate overflow-hidden transition-all min-w-0"
              style={{ color: weekTone, ...privacyStyle(privacyMode) }}
              title={weeklyNetPnlValue}
            >
              {weeklyNetPnlValue}
            </p>
          </div>

          <div className="flex flex-col gap-2 overflow-hidden">
            {([
              { label: 'Total Executed Trades', value: weekStats.trades.length.toLocaleString(), icon: IconActivity },
              { label: 'Win/Loss Ratio', value: weekStats.winLossRatio, icon: IconTrendingUp },
              { label: 'Best-Performing Asset', value: weekStats.bestAsset, icon: IconCalendar },
              { label: 'Best Trading Session', value: weekStats.bestSession, icon: IconClock }
            ] satisfies StatBadge[]).map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                title={`${label}: ${value}`}
                className="w-full h-[90px] flex flex-col justify-between p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/[0.06] overflow-hidden flex-shrink-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={16} className="text-white/40 shrink-0" />
                  <p
                    title={label}
                    className="text-[10px] font-semibold tracking-widest text-white/40 uppercase truncate"
                  >
                    {label}
                  </p>
                </div>
                <p title={value} className="text-xl font-bold font-mono text-text-1 truncate">{value}</p>
              </div>
            ))}
          </div>

          <div className="w-full rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/[0.06] p-4 flex-shrink-0 overflow-hidden">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-3">
              Monthly Overview
            </p>
            <div className="flex flex-col gap-1">
              {monthlyWeeks.map((week, index) => (
                <motion.div
                  key={`${week.label}-${index}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
                  whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className="flex items-center justify-between gap-3 min-w-0 rounded-lg -mx-2 px-2 py-1.5 cursor-default"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-white/70 font-mono shrink-0">
                      {week.label}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono truncate">
                      {week.range}
                    </span>
                  </div>
                  <span
                    className={`text-[12px] font-bold font-mono truncate ${
                      week.pnl > 0
                        ? 'text-[#00FFB2]'
                        : week.pnl < 0
                          ? 'text-[#FF5A5A]'
                          : 'text-white/30'
                    }`}
                    style={privacyStyle(privacyMode)}
                    title={week.pnl === 0 ? 'No executions' : formatCurrency(week.pnl)}
                  >
                    {week.pnl === 0 ? '-' : formatCurrency(week.pnl)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
