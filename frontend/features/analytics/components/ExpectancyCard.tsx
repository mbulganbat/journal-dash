import { motion } from 'framer-motion';
import { IconInfoCircle } from '@tabler/icons-react';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  metrics: AnalyticsData['metrics'];
  isPrivacyEnabled: boolean;
}

export const ExpectancyCard = ({ metrics, isPrivacyEnabled }: Props) => {
  // Expectancy Calculations
  const loseRate = 100 - metrics.winRate;
  const winContribution = (metrics.winRate / 100) * metrics.avgWin;
  const loseContribution = (loseRate / 100) * metrics.avgLoss;
  const isPositiveExpectancy = metrics.expectancy >= 0;

  return (
    <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-text-1">Expectancy per Trade</h3>
        <div className="flex items-center gap-2">
          <span className={`text-[16px] font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${isPositiveExpectancy ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
            {isPositiveExpectancy ? '+' : '-'}${Math.abs(metrics.expectancy).toFixed(2)}
          </span>
          <IconInfoCircle size={16} className="text-text-3" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-[14px] text-text-2">Rating</span>
        <span className={`text-[14px] font-bold ${isPositiveExpectancy ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
          {isPositiveExpectancy ? 'Positive' : 'Negative'}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-[14px] text-text-2 mb-4">Expectancy breakdown</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[12px] text-text-3 mb-1">Win contribution</p>
            <div className="h-1 w-8 bg-[#00FFB2] rounded-full mb-2" />
            <p className={`text-[16px] font-bold text-text-1 transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>${winContribution.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[12px] text-text-3 mb-1">Lose contribution</p>
            <div className="h-1 w-8 bg-[#FF5A5A] rounded-full mb-2" />
            <p className={`text-[16px] font-bold text-text-1 transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>-${loseContribution.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-auto pt-4 border-t border-white/[0.04]">
        <div>
          <p className="text-[11px] text-text-3 mb-1">Win<br/>Rate</p>
          <p className="text-[14px] font-bold text-[#00FFB2]">{metrics.winRate.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-[11px] text-text-3 mb-1">Lose<br/>Rate</p>
          <p className="text-[14px] font-bold text-[#FF5A5A]">{loseRate.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-[11px] text-text-3 mb-1">Avg<br/>Win</p>
          <p className={`text-[14px] font-bold text-[#00FFB2] transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>${metrics.avgWin.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-3 mb-1">Avg<br/>Loss</p>
          <p className={`text-[14px] font-bold text-[#FF5A5A] transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>-${metrics.avgLoss.toFixed(0)}</p>
        </div>
      </div>
    </motion.div>
  );
};
