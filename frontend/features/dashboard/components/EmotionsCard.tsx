import { motion } from 'framer-motion';
import { IconMoodSmile } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { fadeUp } from '../../../lib/animations';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { Trade } from '../../../types';

export const EmotionsCard = ({ activeTrades }: { activeTrades: Trade[] }) => {
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeUp} {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 w-full">
      <div className="flex items-center gap-2 mb-5">
        <IconMoodSmile size={20} stroke={2.5} className="text-[#FFB800]" />
        <h3 className="text-[15px] font-semibold text-text-1">Emotions</h3>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {['Focused', 'Patient', 'Neutral', 'Rushed', 'FOMO', 'Unsure'].map(emo => {
          const count = activeTrades.filter(t => t.emotion === emo).length;
          if (count === 0) return null;
          const isGood = ['Focused', 'Patient'].includes(emo);
          const isBad = ['Rushed', 'FOMO'].includes(emo);
          const colorClass = isGood ? 'text-success bg-success/10 border-success/20' : isBad ? 'text-danger bg-danger/10 border-danger/20' : emo === 'Unsure' ? 'text-warning bg-warning/10 border-warning/20' : 'text-text-2 bg-white/[0.04] border-white/[0.08]';
          return (
            <motion.div
              key={emo}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/journal')}
              className={`px-3.5 py-2 rounded-full text-xs font-medium border flex items-center gap-2 cursor-pointer transition-all ${colorClass}`}
            >
              <span>{emo}</span>
              <span className="opacity-60 text-[11px]">{count}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
