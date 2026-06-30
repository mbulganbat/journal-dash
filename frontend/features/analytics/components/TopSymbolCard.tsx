import { useState } from 'react';
import { motion } from 'framer-motion';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  symbolStats: AnalyticsData['symbolStats'];
  isPrivacyEnabled: boolean;
}

export const TopSymbolCard = ({ symbolStats, isPrivacyEnabled }: Props) => {
  const [topSymbolView, setTopSymbolView] = useState<'top'|'bottom'>('top');

  const displayedSymbols = topSymbolView === 'top'
    ? symbolStats.slice(0, 5)
    : [...symbolStats].reverse().slice(0, 5);

  return (
    <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-text-1">Top Symbol</h3>
        <div className="flex bg-bg-3 rounded-lg p-1 border border-white/[0.04]">
          <button onClick={() => setTopSymbolView('top')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${topSymbolView === 'top' ? 'bg-[#5B6BFF] text-white' : 'text-text-3 hover:text-text-2'}`}>Top</button>
          <button onClick={() => setTopSymbolView('bottom')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${topSymbolView === 'bottom' ? 'bg-[#5B6BFF] text-white' : 'text-text-3 hover:text-text-2'}`}>Bottom</button>
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {displayedSymbols.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full ${s.pnl >= 0 ? 'bg-[#00FFB2]' : 'bg-[#FF5A5A]'}`} />
              <div>
                <p className="text-[14px] font-bold text-text-1">{s.pair}</p>
                <p className="text-[12px] text-text-3">{s.trades} trades | {s.wr.toFixed(0)}% wr | {s.volume.toFixed(1)} vol.</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-[14px] font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${s.pnl >= 0 ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
                {s.pnl >= 0 ? '+' : '-'}${Math.abs(s.pnl).toLocaleString(undefined, {maximumFractionDigits:0})}
              </p>
              <p className="text-[12px] text-text-3">PF: {s.pf === Infinity ? 'Infinity' : s.pf.toFixed(2)}</p>
            </div>
          </div>
        ))}
        {displayedSymbols.length === 0 && (
          <div className="text-sm text-text-3 text-center py-4">No symbol data available.</div>
        )}
      </div>
    </motion.div>
  );
};
