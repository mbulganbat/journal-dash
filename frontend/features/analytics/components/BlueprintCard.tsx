import { motion } from 'framer-motion';
import { IconTrophy, IconAlertTriangle } from '@tabler/icons-react';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  blueprint: AnalyticsData['blueprint'];
  isPrivacyEnabled: boolean;
}

export const BlueprintCard = ({ blueprint, isPrivacyEnabled }: Props) => {
  return (
    <motion.div {...premiumHoverProps} className="bg-bg-2 border border-[#FFB800]/20 rounded-card p-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFB800] to-[#FFD700]" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-6 relative z-10">
        <IconTrophy size={24} className="text-[#FFB800]" />
        <h3 className="text-[18px] font-bold text-text-1">Personal Blueprint</h3>
      </div>

      {blueprint ? (
        <div className="flex flex-col gap-5 relative z-10 flex-1">
          <div className="bg-[#16161A] border border-white/[0.06] rounded-xl p-4">
            <p className="text-[11px] uppercase text-text-3 tracking-wide font-semibold mb-3">Optimal Trading Profile</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 font-mono">
              <div>
                <span className="text-[10px] text-text-3 block uppercase tracking-wider mb-1">Best Session</span>
                <span className="text-[13px] font-bold text-[#00FFB2]">{blueprint.bestSession}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-3 block uppercase tracking-wider mb-1">Best Pair</span>
                <span className="text-[13px] font-bold text-[#00FFB2]">{blueprint.bestPair}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-3 block uppercase tracking-wider mb-1">Best Setup</span>
                <span className="text-[13px] font-bold text-[#00FFB2]">{blueprint.bestSetup}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-3 block uppercase tracking-wider mb-1">Peak Hour</span>
                <span className="text-[13px] font-bold text-[#00FFB2]">{blueprint.bestHour}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase text-[#FF5A5A]/80 tracking-wide font-semibold">Critical Weaknesses</p>
            <div className="bg-[#FF5A5A]/5 border border-[#FF5A5A]/15 rounded-xl p-4 flex items-start gap-3">
              <IconAlertTriangle size={16} className="text-[#FF5A5A] mt-0.5 shrink-0" />
              <p className="text-[13px] text-text-2 leading-tight">
                <span className="font-bold text-text-1">{blueprint.worstEmotion}</span> state trades are severely underperforming.
              </p>
            </div>
            <div className="bg-[#FF5A5A]/5 border border-[#FF5A5A]/15 rounded-xl p-4 flex items-start gap-3">
              <IconAlertTriangle size={16} className="text-[#FF5A5A] mt-0.5 shrink-0" />
              <p className="text-[13px] text-text-2 leading-tight">
                <span className="font-bold text-text-1">{blueprint.worstMistake}</span> cost you <span className={`text-[#FF5A5A] font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>${blueprint.worstMistakeCost.toFixed(0)}</span> this period.
              </p>
            </div>
          </div>

          <div className="mt-auto pt-5 border-t border-white/[0.06]">
            <p className="text-[14px] text-text-1 leading-relaxed italic font-medium">
              "Your strongest absolute edge is trading <span className="text-[#00FFB2]">{blueprint.bestPair} {blueprint.bestSetup}</span> setups during <span className="text-[#00FFB2]">{blueprint.bestSession}</span> sessions with <span className="text-[#00FFB2]">{blueprint.optimalRisk}</span> risk."
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-text-3 text-center">
          Not enough data to generate blueprint. Log at least 5 trades.
        </div>
      )}
    </motion.div>
  );
};
