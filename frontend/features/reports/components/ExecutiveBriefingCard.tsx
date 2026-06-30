import { motion } from 'framer-motion';
import { IconBrain } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { ReportsData } from '../hooks/useReportsData';

export const ExecutiveBriefingCard = ({ executiveBriefing }: { executiveBriefing: ReportsData['executiveBriefing'] }) => {
  return (
    <motion.div variants={fadeUp} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <IconBrain size={20} className="text-[#B259FF]" />
        <h3 className="text-[16px] font-bold text-text-1">AI Executive Briefing</h3>
      </div>

      {executiveBriefing ? (
        <div className="flex flex-col gap-5 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#16161A] border border-white/[0.04] rounded-xl p-4">
              <p className="text-[10px] uppercase text-text-3 tracking-wide font-semibold mb-1">Primary Driver</p>
              <p className="text-[14px] font-bold text-[#00FFB2]">{executiveBriefing.primaryDriver}</p>
            </div>
            <div className="bg-[#16161A] border border-white/[0.04] rounded-xl p-4">
              <p className="text-[10px] uppercase text-text-3 tracking-wide font-semibold mb-1">Main Risk Leak</p>
              <p className="text-[14px] font-bold text-[#FF5A5A]">{executiveBriefing.mainRiskLeak}</p>
            </div>
          </div>

          <div className="bg-[#B259FF]/5 border border-[#B259FF]/20 rounded-xl p-5 flex-1">
            <p className="text-[11px] uppercase text-[#B259FF]/80 tracking-wide font-semibold mb-3">Tactical Adjustments</p>
            <ul className="flex flex-col gap-3">
              {executiveBriefing.aiAdjustmentRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-text-2 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B259FF] mt-1.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-text-3 text-center">
          Not enough data to generate briefing. Log at least 5 trades.
        </div>
      )}
    </motion.div>
  );
};
