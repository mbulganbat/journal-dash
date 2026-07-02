import { motion } from 'framer-motion';
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Trade } from '../../../types';

export const TradeCard = ({ trade, onView, onEdit, onDelete }: { trade: Trade, onView: () => void, onEdit: () => void, onDelete: () => void }) => {
  const isWin = trade.result === 'win';
  const isLoss = trade.result === 'loss';
  const borderColor = isWin ? 'border-l-[#00FFB2]' : isLoss ? 'border-l-[#FF5A5A]' : 'border-l-[#FFB800]';
  const glowColor = isWin ? 'rgba(0,255,178,0.15)' : isLoss ? 'rgba(255,90,90,0.15)' : 'rgba(255,184,0,0.15)';
  const themeColor = isWin ? '#00FFB2' : isLoss ? '#FF5A5A' : '#FFB800';

  // Pattern matching the screenshot for the fancy candlestick placeholder
  const candles = [
    { bodyH: '16%', bodyTop: '45%', wickH: '40%', wickTop: '33%', isHollow: false },
    { bodyH: '28%', bodyTop: '22%', wickH: '46%', wickTop: '13%', isHollow: true },
    { bodyH: '16%', bodyTop: '60%', wickH: '40%', wickTop: '48%', isHollow: false },
    { bodyH: '28%', bodyTop: '28%', wickH: '46%', wickTop: '19%', isHollow: false }
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`group bg-bg-2 rounded-[20px] border border-white/[0.06] border-l-[3px] ${borderColor} overflow-hidden relative hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-shadow`}
    >
      {/* Screenshot Placeholder / Image */}
      <div
        className="aspect-video bg-[#0C0C0E] relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: trade.screenshotUrl ? 'none' : 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: 'center center'
        }}
      >
        {!trade.screenshotUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full blur-[50px]" style={{ backgroundColor: glowColor }} />
          </div>
        )}

        {trade.screenshotUrl ? (
          <img src={trade.screenshotUrl} alt={trade.pair} className="w-full h-full object-cover relative z-10" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center gap-4 z-10">
            {/* Simulated Dotted Entry Line */}
            <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-white/[0.05] -translate-y-1/2" />

            {/* Glowing Candlesticks */}
            {candles.map((c, i) => (
              <motion.div
                key={i}
                className="relative flex flex-col items-center w-3 h-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
              >
                {/* Wick */}
                <div
                  className="absolute w-[2px] rounded-full"
                  style={{
                    top: c.wickTop,
                    height: c.wickH,
                    backgroundColor: themeColor,
                    filter: `drop-shadow(0 0 4px ${themeColor})`,
                    opacity: 0.5
                  }}
                />
                {/* Body */}
                <div
                  className="absolute w-full rounded-[3px] z-10"
                  style={{
                    top: c.bodyTop,
                    height: c.bodyH,
                    backgroundColor: c.isHollow ? '#0C0C0E' : themeColor,
                    border: `1.5px solid ${themeColor}`,
                    filter: `drop-shadow(0 0 8px ${themeColor})`
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Vignette Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E] via-transparent to-transparent opacity-90 pointer-events-none z-10" />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[#0C0C0E]/80 backdrop-blur-xs flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button onClick={onView} className="w-12 h-12 rounded-full bg-white/[0.08] hover:bg-[#00FFB2] hover:text-black text-text-1 flex items-center justify-center transition-colors shadow-xl">
            <IconEye size={20} stroke={2.5} />
          </button>
          <button onClick={onEdit} className="w-12 h-12 rounded-full bg-white/[0.08] hover:bg-white/[0.2] text-text-1 flex items-center justify-center transition-colors shadow-xl">
            <IconEdit size={20} stroke={2.5} />
          </button>
          <button onClick={onDelete} className="w-12 h-12 rounded-full bg-white/[0.08] hover:bg-[#FF5A5A] hover:text-white text-text-1 flex items-center justify-center transition-colors shadow-xl">
            <IconTrash size={20} stroke={2.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-[16px] font-bold text-text-1">{trade.pair}</h4>
            <p className="text-[12px] text-text-3 mt-0.5">{format(new Date(trade.date), 'MMM dd, yyyy')} · {trade.session}</p>
          </div>
          <div className="text-right">
            <p className={`text-[16px] font-extrabold ${isWin ? 'text-[#00FFB2]' : isLoss ? 'text-[#FF5A5A]' : 'text-[#FFB800]'}`}>
              {isWin ? '+' : isLoss ? '-' : ''}${Math.abs(trade.pnl).toFixed(2)}
            </p>
            <p className="text-[12px] text-text-3 mt-0.5">{trade.rr}R</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-text-2">{trade.setup}</span>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-text-2">{trade.emotion}</span>
        </div>
      </div>
    </motion.div>
  );
};
