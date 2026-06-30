import { motion } from 'framer-motion';
import { IconMoodSmile, IconAlertTriangle } from '@tabler/icons-react';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  emotionSpectrum: AnalyticsData['emotionSpectrum'];
  mistakeAnalytics: AnalyticsData['mistakeAnalytics'];
  isPrivacyEnabled: boolean;
}

export const BehaviorTab = ({ emotionSpectrum, mistakeAnalytics, isPrivacyEnabled }: Props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

      {/* 5-Segment Emotional Spectrum Grid */}
      <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col">
        <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
          <IconMoodSmile size={18} className="text-[#00E5A0]" /> Emotion vs P&L
        </h3>

        <div className="flex flex-col gap-3 flex-1">
          {emotionSpectrum.map((segment, i) => (
            <div key={i} className="bg-[#16161A] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-white/[0.1] transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: segment.color }} />

              <div className="flex flex-col pl-3">
                <span className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: segment.color }}>{segment.zone}</span>
                <span className="text-[12px] text-text-3 font-mono">{segment.tradeCount} trades</span>
              </div>

              <div className="flex flex-col items-end">
                <span className={`text-[16px] font-extrabold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`} style={{ color: segment.netPnL >= 0 ? '#00FFB2' : '#FF5A5A', textShadow: `0 0 10px ${segment.netPnL >= 0 ? 'rgba(0,255,178,0.3)' : 'rgba(255,90,90,0.3)'}` }}>
                  {segment.netPnL >= 0 ? '+' : '-'}${Math.abs(segment.netPnL).toLocaleString(undefined, {maximumFractionDigits:0})}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-3">WR: {segment.winRate.toFixed(0)}%</span>
                  <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${segment.winRate}%`, backgroundColor: segment.color }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Coach Callout */}
        <div className="mt-6 pt-4 border-t border-white/[0.04]">
          <p className="text-[12px] text-text-2 leading-relaxed">
            <span className="font-bold text-[#FF5A5A]">ALERT:</span> Trading in 'Panic / FOMO' states accounts for a significant portion of your drawdowns. Curbing these trades boosts your net profit.
          </p>
        </div>
      </motion.div>

      {/* Mistake Cost Analysis */}
      <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col">
        <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
          <IconAlertTriangle size={18} className="text-[#FF5A5A]" /> Mistake Cost Analysis
        </h3>

        <div className="flex flex-col gap-3 flex-1">
          {mistakeAnalytics.length > 0 ? mistakeAnalytics.map((m, i) => (
            <div key={i} className="bg-[#16161A] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between group hover:border-white/[0.1] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.severity === 'high' ? 'bg-[#FF5A5A]/10' : 'bg-[#FFB800]/10'}`}>
                  <IconAlertTriangle size={16} className={m.severity === 'high' ? 'text-[#FF5A5A]' : 'text-[#FFB800]'} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-text-1">{m.name}</span>
                  <span className="text-[11px] text-text-3">{m.count} occurrences</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[15px] font-extrabold text-[#FF5A5A] transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>
                  -${m.lossAmt.toLocaleString(undefined, {maximumFractionDigits:0})}
                </span>
              </div>
            </div>
          )) : (
            <div className="flex-1 flex items-center justify-center text-sm text-text-3 text-center">
              No mistakes recorded in this period.
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};
