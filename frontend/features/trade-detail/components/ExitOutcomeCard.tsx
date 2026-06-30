import { motion } from 'framer-motion';
import { IconActivity } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { Trade } from '../../../types';

interface Props {
  trade: Trade;
  onOutcomeChange: (newOutcome: 'win' | 'loss' | 'breakeven') => void;
}

export const ExitOutcomeCard = ({ trade, onOutcomeChange }: Props) => {
  return (
    <motion.div variants={fadeUp} className="bg-bg-2 border border-white/[0.06] rounded-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <IconActivity size={16} className="text-text-3" />
        <h3 className="text-[14px] font-semibold text-text-1">Exit Outcome</h3>
      </div>
      <div className="flex gap-3">
        <motion.button
          layout
          onClick={() => onOutcomeChange('win')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            trade.result === 'win'
              ? 'bg-[#00FFB2]/10 border border-[#00FFB2]/30 text-[#00FFB2] shadow-[0_0_15px_rgba(0,255,178,0.1)]'
              : 'bg-white/[0.03] border border-white/[0.06] text-[#8888A0] hover:bg-white/[0.06]'
          }`}
        >
          TP
        </motion.button>
        <motion.button
          layout
          onClick={() => onOutcomeChange('breakeven')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            trade.result === 'breakeven'
              ? 'bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] shadow-[0_0_15px_rgba(255,184,0,0.1)]'
              : 'bg-white/[0.03] border border-white/[0.06] text-[#8888A0] hover:bg-white/[0.06]'
          }`}
        >
          BE
        </motion.button>
        <motion.button
          layout
          onClick={() => onOutcomeChange('loss')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            trade.result === 'loss'
              ? 'bg-[#FF5A5A]/10 border border-[#FF5A5A]/30 text-[#FF5A5A] shadow-[0_0_15px_rgba(255,90,90,0.1)]'
              : 'bg-white/[0.03] border border-white/[0.06] text-[#8888A0] hover:bg-white/[0.06]'
          }`}
        >
          SL
        </motion.button>
      </div>
    </motion.div>
  );
};
