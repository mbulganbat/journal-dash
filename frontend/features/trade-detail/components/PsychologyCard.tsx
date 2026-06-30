import { motion } from 'framer-motion';
import { IconMoodSmile } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { Trade } from '../../../types';

interface Props {
  trade: Trade;
  onEmotionChange: (emotion: string) => void;
}

export const PsychologyCard = ({ trade, onEmotionChange }: Props) => {
  return (
    <motion.div variants={fadeUp} className="bg-bg-2 border border-white/[0.06] rounded-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <IconMoodSmile size={16} className="text-text-3" />
        <h3 className="text-[14px] font-semibold text-text-1">Psychology</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {['Focused', 'Patient', 'Neutral', 'Rushed', 'FOMO', 'Unsure'].map(emo => (
          <button
            key={emo}
            onClick={() => onEmotionChange(emo)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              trade.emotion === emo
                ? 'bg-[#00FFB2]/10 text-[#00FFB2] border-[#00FFB2]/30'
                : 'bg-white/[0.04] text-text-2 border border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            {emo}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
