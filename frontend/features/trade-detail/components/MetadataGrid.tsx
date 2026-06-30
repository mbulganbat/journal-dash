import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fadeUp } from '../../../lib/animations';
import { Trade } from '../../../types';

export const MetadataGrid = ({ trade }: { trade: Trade }) => {
  return (
    <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { l: 'Pair', v: trade.pair },
        { l: 'Date', v: format(new Date(trade.date), 'MMM dd, yyyy') },
        { l: 'Session', v: trade.session },
        { l: 'Direction', v: <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.direction==='long'?'bg-[#00FFB2]/10 text-[#00FFB2]':'bg-[#FF5A5A]/10 text-[#FF5A5A]'}`}>{trade.direction.toUpperCase()}</span> },
        { l: 'Entry', v: trade.entry },
        { l: 'Exit', v: trade.exit },
        { l: 'Stop Loss', v: trade.sl },
        { l: 'Take Profit', v: trade.tp },
      ].map((item, i) => (
        <div key={i} className="bg-bg-3 rounded-xl p-3 border border-white/[0.04]">
          <p className="text-[10px] uppercase text-text-3 tracking-wide mb-1">{item.l}</p>
          <div className="text-[14px] font-bold text-text-1">{item.v}</div>
        </div>
      ))}
    </motion.div>
  );
};
