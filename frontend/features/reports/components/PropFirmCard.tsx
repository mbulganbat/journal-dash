import { motion } from 'framer-motion';
import { IconCertificate, IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { ReportsData } from '../hooks/useReportsData';

interface Props {
  propFirmReadiness: ReportsData['propFirmReadiness'];
  activeAccount: ReportsData['activeAccount'];
}

export const PropFirmCard = ({ propFirmReadiness, activeAccount }: Props) => {
  return (
    <motion.div variants={fadeUp} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <IconCertificate size={20} className="text-[#FFB800]" />
        <h3 className="text-[16px] font-bold text-text-1">Prop Firm Readiness</h3>
      </div>

      <div className="flex items-center justify-between mb-6 bg-[#16161A] border border-white/[0.04] rounded-xl p-4">
        <div>
          <p className="text-[11px] uppercase text-text-3 tracking-wide font-semibold mb-1">Evaluation Target</p>
          <p className="text-[15px] font-bold text-text-1">{propFirmReadiness.evaluationCompany} Challenge</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-text-3 tracking-wide font-semibold mb-1">Status</p>
          <span className={`px-3 py-1 rounded-md text-[12px] font-bold border ${propFirmReadiness.isPass ? 'bg-[#00FFB2]/10 text-[#00FFB2] border-[#00FFB2]/30' : 'bg-[#FF5A5A]/10 text-[#FF5A5A] border-[#FF5A5A]/30'}`}>
            {propFirmReadiness.isPass ? 'PASSED' : 'IN PROGRESS'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 mb-6">
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-2">Profit Target Progress</span>
            <span className="font-bold text-[#00FFB2]">{propFirmReadiness.profitTargetProgressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-full">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${propFirmReadiness.profitTargetProgressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-[#00FFB2]"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-2">Max Drawdown Limit</span>
            <span className={`font-bold ${propFirmReadiness.maxDrawdownPct > (activeAccount.maxDailyDrawdown || 5) ? 'text-[#FF5A5A]' : 'text-[#FFB800]'}`}>
              {propFirmReadiness.maxDrawdownPct.toFixed(1)}% / {activeAccount.maxDailyDrawdown || 5}%
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-full">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${Math.min((propFirmReadiness.maxDrawdownPct / (activeAccount.maxDailyDrawdown || 5)) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${propFirmReadiness.maxDrawdownPct > (activeAccount.maxDailyDrawdown || 5) ? 'bg-[#FF5A5A]' : 'bg-[#FFB800]'}`}
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${propFirmReadiness.consistencyRuleViolated ? 'bg-[#FF5A5A]/10' : 'bg-[#00FFB2]/10'}`}>
            {propFirmReadiness.consistencyRuleViolated ? <IconAlertTriangle size={18} className="text-[#FF5A5A]" /> : <IconCheck size={18} className="text-[#00FFB2]" />}
          </div>
          <div>
            <p className="text-[13px] font-bold text-text-1">Consistency Rule</p>
            <p className="text-[11px] text-text-3">
              {propFirmReadiness.consistencyRuleViolated ? 'Violation: Single day > 30% of total profit.' : 'Passed: Profits are evenly distributed.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
