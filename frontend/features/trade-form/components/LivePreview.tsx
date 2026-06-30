import { motion } from 'framer-motion';
import { IconX, IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import { TradeFormState } from '../hooks/useTradeForm';

export const LivePreview = ({ form, onClose }: { form: TradeFormState, onClose: () => void }) => {
  const { direction, pair, calcData, setupQualityScore } = form;

  return (
    <div className="hidden md:flex w-[45%] bg-[#0C0C0E] border-l border-white/[0.06] p-4 lg:p-5 flex-col justify-between relative">

      {/* Close Button (Desktop) */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-text-3 hover:text-text-1 transition-colors"
      >
        <IconX size={20} />
      </button>

      <div>
        <h3 className="text-[11px] uppercase text-text-3 tracking-widest font-bold mb-6">Live Preview</h3>

        <div className="bg-[#111114] border border-white/[0.06] rounded-2xl p-5 mb-4 shadow-xl">
          <div className="flex justify-between items-center mb-5">
            <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide ${direction === 'long' ? 'bg-[#00FFB2]/10 text-[#00FFB2] border border-[#00FFB2]/20' : 'bg-[#FF5A5A]/10 text-[#FF5A5A] border border-[#FF5A5A]/20'}`}>
              {direction.toUpperCase()}
            </span>
            <span className="text-[16px] font-bold text-text-1 tracking-wide">{pair || 'SYMBOL'}</span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-text-3 font-medium">Stop Loss</span>
              <motion.span key={calcData.slPips} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[14px] font-bold text-[#FF5A5A]">
                {calcData.slPips.toFixed(1)} pips
              </motion.span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-text-3 font-medium">Take Profit</span>
              <motion.span key={calcData.tpPips} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[14px] font-bold text-[#00FFB2]">
                {calcData.tpPips.toFixed(1)} pips
              </motion.span>
            </div>

            <div className="h-px bg-white/[0.06] my-1" />

            <div className="flex justify-between items-center">
              <span className="text-[13px] text-text-3 font-medium">Risk:Reward</span>
              <motion.span key={calcData.rr} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[18px] font-extrabold text-[#00FFB2]">
                {calcData.rr.toFixed(2)}R
              </motion.span>
            </div>

            {/* Visual R:R Bar */}
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden flex mt-1">
              <div className="bg-[#FF5A5A] h-full transition-all duration-300" style={{ width: `${(1 / (1 + calcData.rr)) * 100}%` }} />
              <div className="bg-[#00FFB2] h-full transition-all duration-300" style={{ width: `${(calcData.rr / (1 + calcData.rr)) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="bg-[#FF5A5A]/[0.03] border border-[#FF5A5A]/20 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5A5A]" />
            <div className="flex justify-between items-start mb-1">
              <p className="text-[11px] uppercase text-[#FF5A5A]/80 tracking-wide font-semibold">Expected Loss</p>
              <motion.span key={`risk-${calcData.riskPercent}`} initial={{ opacity: 0.5, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-2 py-0.5 rounded bg-[#FF5A5A]/10 text-[#FF5A5A] text-[10px] font-bold border border-[#FF5A5A]/20">
                Risking {calcData.riskPercent.toFixed(2)}%
              </motion.span>
            </div>
            <motion.p key={calcData.riskAmount} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[24px] font-extrabold text-[#FF5A5A]">
              -${calcData.riskAmount.toFixed(2)}
            </motion.p>
          </div>

          <div className="bg-[#00FFB2]/[0.03] border border-[#00FFB2]/20 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00FFB2]" />
            <div className="flex justify-between items-start mb-1">
              <p className="text-[11px] uppercase text-[#00FFB2]/80 tracking-wide font-semibold">Expected Profit</p>
              <motion.span key={`reward-${calcData.riskPercent}`} initial={{ opacity: 0.5, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-2 py-0.5 rounded bg-[#00FFB2]/10 text-[#00FFB2] text-[10px] font-bold border border-[#00FFB2]/20">
                Reward {(calcData.riskPercent * calcData.rr).toFixed(2)}%
              </motion.span>
            </div>
            <motion.p key={calcData.rewardAmount} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[24px] font-extrabold text-[#00FFB2]">
              +${calcData.rewardAmount.toFixed(2)}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Setup Quality Badge */}
      <div className="mt-4 flex justify-center">
        {calcData.rr > 0 && (
          <motion.div
            key={setupQualityScore >= 90 ? 'pristine' : setupQualityScore >= 70 ? 'good' : setupQualityScore >= 50 ? 'average' : 'critical'}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`px-4 py-3 rounded-xl text-[12px] font-bold border flex flex-col items-center text-center gap-1 w-full ${
              setupQualityScore >= 90
                ? 'bg-[#00FFB2]/10 text-[#00FFB2] border-[#00FFB2]/30 shadow-[0_0_15px_rgba(0,255,178,0.15)]'
                : setupQualityScore >= 70
                  ? 'bg-[#00FFB2]/5 text-[#00E5A0] border-[#00E5A0]/20'
                  : setupQualityScore >= 50
                    ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20'
                    : 'bg-[#FF5A5A]/10 text-[#FF5A5A] border-[#FF5A5A]/30 shadow-[0_0_15px_rgba(255,90,90,0.15)]'
            }`}
          >
            <div className="flex items-center gap-2">
              {setupQualityScore >= 70 ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
              <span>
                {setupQualityScore >= 90 ? 'A+ Pristine Setup' : setupQualityScore >= 70 ? 'Good Setup Quality' : setupQualityScore >= 50 ? 'Average Setup Quality' : 'Critical Setup Risk'}
              </span>
            </div>
            <span className="text-[10px] font-medium opacity-80">
              {setupQualityScore >= 90 ? 'Flawless technical pattern backed by optimal psychology. High probability.' : setupQualityScore >= 70 ? 'Solid technical pattern with high confirmation alignment.' : setupQualityScore >= 50 ? 'Acceptable pattern, but caution advised due to missing confirmations.' : 'Poor execution risk — psychology & checklist severely misaligned!'}
            </span>
          </motion.div>
        )}
      </div>

    </div>
  );
};
