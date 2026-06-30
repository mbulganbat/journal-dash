import { motion } from 'framer-motion';
import { IconActivity } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { Trade } from '../../../types';

export const ExecutionCard = ({ trade }: { trade: Trade }) => {
  const isWin = trade.result === 'win';
  const isLoss = trade.result === 'loss';

  return (
    <motion.div variants={fadeUp} className="bg-bg-2 border border-white/[0.06] rounded-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <IconActivity size={16} className="text-text-3" />
        <h3 className="text-[14px] font-semibold text-text-1">Execution</h3>
      </div>
      <div className="flex items-end gap-3 mb-6">
        <h2 className={`text-[32px] font-extrabold leading-none ${isWin ? 'text-success' : isLoss ? 'text-danger' : 'text-warning'}`}>
          {isWin ? '+' : isLoss ? '-' : ''}${Math.abs(trade.pnl).toFixed(2)}
        </h2>
        <span className={`px-2 py-1 rounded text-[10px] font-bold mb-1 ${isWin ? 'bg-success/10 text-success' : isLoss ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
          {trade.result.toUpperCase()}
        </span>
      </div>

      <div className="mb-2 flex justify-between items-end">
        <span className="text-[12px] text-text-3 uppercase tracking-wide">Risk:Reward</span>
        <span className="text-[20px] font-bold text-text-1">{trade.rr}R</span>
      </div>
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${Math.min((trade.rr / 4) * 100, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#00FFB2] to-[#14F195]"
        />
      </div>
    </motion.div>
  );
};
