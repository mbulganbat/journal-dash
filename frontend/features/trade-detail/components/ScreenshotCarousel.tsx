import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { Trade } from '../../../types';

export const ScreenshotCarousel = ({ trade }: { trade: Trade }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const isWin = trade.result === 'win';
  const isLoss = trade.result === 'loss';
  const themeColor = isWin ? '#00FFB2' : isLoss ? '#FF5A5A' : '#FFB800';
  const glowColor = isWin ? 'rgba(0,255,178,0.15)' : isLoss ? 'rgba(255,90,90,0.15)' : 'rgba(255,184,0,0.15)';

  // Pattern matching the screenshot for the fancy candlestick placeholder
  const candles = [
    { bodyH: '16%', bodyTop: '45%', wickH: '40%', wickTop: '33%', isHollow: false },
    { bodyH: '28%', bodyTop: '22%', wickH: '46%', wickTop: '13%', isHollow: true },
    { bodyH: '16%', bodyTop: '60%', wickH: '40%', wickTop: '48%', isHollow: false },
    { bodyH: '28%', bodyTop: '28%', wickH: '46%', wickTop: '19%', isHollow: false }
  ];

  return (
    <motion.div variants={fadeUp} className="aspect-video bg-[#0C0C0E] rounded-xl relative overflow-hidden border border-white/[0.08] group">
      {trade.screenshotUrl ? (
        <img src={trade.screenshotUrl} alt={trade.pair} className="w-full h-full object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#0C0C0E]"
          style={{
            boxShadow: `inset 0 0 120px ${glowColor}`,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: 'center center'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full blur-[50px]" style={{ backgroundColor: glowColor }} />
          </div>
          <div className="relative w-full h-full flex items-center justify-center gap-5 z-10">
            <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-white/[0.08] -translate-y-1/2" />
            {candles.map((c, i) => (
              <motion.div
                key={i}
                className="relative flex flex-col items-center w-3.5 h-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
              >
                <div className="absolute w-[2px] rounded-full" style={{ top: c.wickTop, height: c.wickH, backgroundColor: themeColor, filter: `drop-shadow(0 0 6px ${themeColor})`, opacity: 0.7 }} />
                <div className="absolute w-full rounded-[3px] z-10" style={{ top: c.bodyTop, height: c.bodyH, backgroundColor: c.isHollow ? '#0C0C0E' : themeColor, border: `2px solid ${themeColor}`, filter: `drop-shadow(0 0 12px ${themeColor})` }} />
              </motion.div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E] via-transparent to-transparent opacity-90 pointer-events-none z-10" />
          <span className="absolute bottom-4 right-4 text-text-3/50 text-xs font-mono z-20">Screenshot {activeSlide + 1}/3</span>
        </div>
      )}
      <button
        onClick={() => setActiveSlide(p => Math.max(0, p-1))}
        disabled={activeSlide === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 disabled:opacity-30 transition-all z-30"
      >
        <IconChevronLeft size={20} />
      </button>
      <button
        onClick={() => setActiveSlide(p => Math.min(2, p+1))}
        disabled={activeSlide === 2}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 disabled:opacity-30 transition-all z-30"
      >
        <IconChevronRight size={20} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {[0,1,2].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full transition-colors ${activeSlide === i ? 'bg-em' : 'bg-white/20'}`} />
        ))}
      </div>
    </motion.div>
  );
};
