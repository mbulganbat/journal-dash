import { motion } from 'framer-motion';
import { IconLayoutGrid } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { fadeUp } from '../../../lib/animations';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { getWinRate, getAvgRR } from '../../../data/mockTrades';
import { Trade } from '../../../types';

export const TopSetupsCard = ({ setupData }: { setupData: Record<string, Trade[]> }) => {
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeUp} {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 w-full">
      <div className="flex items-center gap-2 mb-6">
        <IconLayoutGrid size={20} stroke={2.5} className="text-[#B259FF]" />
        <h3 className="text-[15px] font-semibold text-text-1">Top Setups</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(setupData).sort((a,b) => b[1].length - a[1].length).slice(0,4).map(([setup, arr]) => {
          const wr = getWinRate(arr);
          const rr = getAvgRR(arr);
          return (
            <motion.div
              key={setup}
              whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,255,178,0.05)", borderColor: "rgba(0,255,178,0.3)" }}
              onClick={() => navigate('/setups')}
              className="bg-bg-3 rounded-xl p-4 border border-white/[0.04] cursor-pointer transition-colors"
            >
              <p className="text-[13px] font-semibold text-text-1 truncate">{setup}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-bold text-em bg-em/10 px-2 py-0.5 rounded">{wr}% WR</span>
                <span className="text-[11px] text-text-3">{rr}R</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
