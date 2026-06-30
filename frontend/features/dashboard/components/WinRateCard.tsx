import { motion } from 'framer-motion';
import { IconCirclePercentage } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { Trade } from '../../../types';

interface Props {
  winRate: number;
  activeTrades: Trade[];
}

export const WinRateCard = ({ winRate, activeTrades }: Props) => {
  return (
    <motion.div variants={fadeUp} {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col items-center w-full">
      <div className="w-full flex items-center gap-2 mb-6">
        <IconCirclePercentage size={20} stroke={2.5} className="text-[#00E5A0]" />
        <h3 className="text-[15px] font-semibold text-text-1">Win Rate</h3>
      </div>

      <div className="relative w-[180px] h-[180px]">
        <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
          <circle cx="90" cy="90" r="75" stroke="rgba(255,255,255,0.06)" strokeWidth="14" fill="none" />
          <motion.circle
            cx="90" cy="90" r="75"
            stroke="#00FFB2" strokeWidth="14" fill="none" strokeLinecap="round"
            strokeDasharray="471.24"
            initial={{ strokeDashoffset: 471.24 }}
            animate={{ strokeDashoffset: 471.24 * (1 - winRate/100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: 'drop-shadow(0 0 12px rgba(0,255,178,0.4))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[32px] font-extrabold text-text-1">{Math.round(winRate)}%</span>
          <span className="text-[11px] text-text-3 uppercase tracking-wide mt-1">Win Rate</span>
        </div>
      </div>

      <div className="grid grid-cols-2 w-full gap-3 mt-8">
        <div className="bg-bg-3 rounded-xl p-4 text-center border border-white/[0.04]">
          <p className="text-success font-bold text-xl">{activeTrades.filter(t=>t.result==='win').length}</p>
          <p className="text-[11px] text-text-3 uppercase mt-1">Wins</p>
        </div>
        <div className="bg-bg-3 rounded-xl p-4 text-center border border-white/[0.04]">
          <p className="text-danger font-bold text-xl">{activeTrades.filter(t=>t.result==='loss').length}</p>
          <p className="text-[11px] text-text-3 uppercase mt-1">Losses</p>
        </div>
      </div>
    </motion.div>
  );
};
