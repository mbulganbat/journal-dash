import { motion } from 'framer-motion';
import { IconClock } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { ProgressBar, premiumHoverProps } from '../../../components/ui/Shared';
import { Trade } from '../../../types';

export const SessionPnlCard = ({ sessionData }: { sessionData: Record<string, Trade[]> }) => {
  return (
    <motion.div variants={fadeUp} {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 w-full">
      <div className="flex items-center gap-2 mb-6">
        <IconClock size={20} stroke={2.5} className="text-[#00E5A0]" />
        <h3 className="text-[15px] font-semibold text-text-1">By Session</h3>
      </div>
      <div className="flex flex-col gap-5">
        {['London', 'NY AM', 'NY PM', 'Asian', 'Overlap'].map((session) => {
          const sessionTrades = sessionData[session] || [];
          const pnl = sessionTrades.reduce((sum, t) => sum + t.pnl, 0);
          const maxPnl = Math.max(...Object.values(sessionData).map(arr => Math.abs(arr.reduce((s,t)=>s+t.pnl,0))));
          const pct = maxPnl === 0 ? 0 : (Math.abs(pnl) / maxPnl) * 100;

          let color = 'bg-em';
          if (pnl < 0) color = 'bg-danger';
          else if (session === 'NY PM') color = 'bg-warning';

          return (
            <div key={session}>
              <div className="flex justify-between text-[13px] mb-2">
                <span className="text-text-2">{session}</span>
                <span className={`font-semibold ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(0)}
                </span>
              </div>
              <ProgressBar percentage={pct} colorClass={color} />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
