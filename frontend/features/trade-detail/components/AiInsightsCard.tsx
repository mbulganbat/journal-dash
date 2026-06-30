import { motion } from 'framer-motion';
import { IconSparkles } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { Trade } from '../../../types';

export const AiInsightsCard = ({ trade }: { trade: Trade }) => {
  return (
    <motion.div variants={fadeUp} className="bg-bg-2 border border-[#00FFB2]/10 rounded-card p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00FFB2] to-[#14F195]" />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <IconSparkles size={16} className="text-[#00FFB2]" />
          <h3 className="text-[14px] font-semibold text-[#00FFB2]">AI Analysis</h3>
        </div>
        <span className="text-[9px] font-bold text-[#00FFB2] bg-[#00FFB2]/10 px-1.5 py-0.5 rounded">BETA</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] mt-1.5 shrink-0" />
          <p className="text-[13px] text-text-2 leading-relaxed">
            {trade.rr > 2 ? "Strong R:R execution — entry timing was efficient." : "R:R is below optimal threshold. Consider tighter invalidation points."}
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] mt-1.5 shrink-0" />
          <p className="text-[13px] text-text-2 leading-relaxed">
            {['FOMO', 'Rushed'].includes(trade.emotion) ? `${trade.emotion} trades historically underperform for you — review entry criteria.` : `Emotional state (${trade.emotion}) aligns with your highest probability setups.`}
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] mt-1.5 shrink-0" />
          <p className="text-[13px] text-text-2 leading-relaxed">
            Your {trade.setup} setup is performing well recently. This trade aligned with your best pattern.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
