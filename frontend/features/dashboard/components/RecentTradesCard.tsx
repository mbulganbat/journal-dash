import { motion } from 'framer-motion';
import { IconActivity } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { fadeUp } from '../../../lib/animations';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { Trade } from '../../../types';

export const RecentTradesCard = ({ recentTrades }: { recentTrades: Trade[] }) => {
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeUp} {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <IconActivity size={20} stroke={2.5} className="text-[#00FFB2]" />
          <h3 className="text-[15px] font-semibold text-text-1">Recent Live Trades</h3>
        </div>
        <button onClick={() => navigate('/trades')} className="text-[12px] text-em hover:text-em-2 transition-colors">View all</button>
      </div>
      <div className="flex-1 flex flex-col justify-between py-2">
        {recentTrades.map((trade, index) => (
          <motion.div
            key={trade.id}
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.04)" }}
            onClick={() => navigate(`/trade/${trade.id}`)}
            className={`flex items-center gap-4 py-3.5 cursor-pointer rounded-xl px-2 transition-colors ${index !== recentTrades.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
          >
            <div className="w-10 h-10 bg-bg-4 rounded-xl border border-white/[0.08] flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-text-2">{trade.pair.substring(0,3)}</span>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-text-1">{trade.pair}</p>
              <p className="text-[12px] text-text-3">{format(new Date(trade.date), 'MMM dd')} · {trade.session}</p>
            </div>
            <div className="text-right ml-auto min-w-[70px]">
              <p className={`text-[14px] font-bold ${trade.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                {trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toFixed(0)}
              </p>
              <p className="text-[12px] text-text-3">{trade.rr}R</p>
            </div>
          </motion.div>
        ))}
        {recentTrades.length === 0 && (
          <div className="py-8 text-center text-text-3 text-sm m-auto">No trades found for this account.</div>
        )}
      </div>
    </motion.div>
  );
};
