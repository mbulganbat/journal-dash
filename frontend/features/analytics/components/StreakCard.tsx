import { motion } from 'framer-motion';
import { IconInfoCircle } from '@tabler/icons-react';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  streakStats: AnalyticsData['streakStats'];
  isPrivacyEnabled: boolean;
}

export const StreakCard = ({ streakStats, isPrivacyEnabled }: Props) => {
  return (
    <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-text-1">Streak Analysis</h3>
        <IconInfoCircle size={18} className="text-text-3" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
        <div className="border border-[#00FFB2]/30 bg-[#00FFB2]/[0.02] rounded-xl p-5">
          <p className="text-[13px] text-text-3 font-medium mb-3">Longest Win Streak</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-text-1 leading-none">{streakStats.maxWinStreak.count} <span className="text-sm font-medium text-text-3">trades</span></span>
            <span className={`text-lg font-bold text-[#00FFB2] leading-none transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>${streakStats.maxWinStreak.pnl.toFixed(0)}</span>
          </div>
        </div>
        <div className="border border-[#FF5A5A]/30 bg-[#FF5A5A]/[0.02] rounded-xl p-5">
          <p className="text-[13px] text-text-3 font-medium mb-3">Longest Lose Streak</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-text-1 leading-none">{streakStats.maxLossStreak.count} <span className="text-sm font-medium text-text-3">trades</span></span>
            <span className={`text-lg font-bold text-[#FF5A5A] leading-none transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>-${Math.abs(streakStats.maxLossStreak.pnl).toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[15px] text-text-3 font-medium">Current Streak:</span>
          <span className="text-[16px] font-bold text-text-1">{streakStats.currentStreak.count} {streakStats.currentStreak.type === 'win' ? 'wins' : 'loses'}</span>
          <span className={`text-[16px] font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${streakStats.currentStreak.type === 'win' ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
            {streakStats.currentStreak.type === 'win' ? '+' : '-'}${Math.abs(streakStats.currentStreak.pnl).toFixed(0)}
          </span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: Math.min(streakStats.currentStreak.count, 10) }).map((_, i) => (
            <div key={i} className={`w-5 h-5 rounded-full ${streakStats.currentStreak.type === 'win' ? 'bg-[#00FFB2]' : 'bg-[#FF5A5A]'}`} />
          ))}
          {streakStats.currentStreak.count === 0 && (
            <span className="text-sm text-text-3">No active streak</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
