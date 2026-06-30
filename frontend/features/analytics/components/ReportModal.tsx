import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconBrain, IconDownload } from '@tabler/icons-react';
import { format } from 'date-fns';
import { PERIODS } from '../constants';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  showReportModal: boolean;
  setShowReportModal: (value: boolean) => void;
  activePeriod: string;
  metrics: AnalyticsData['metrics'];
  blueprint: AnalyticsData['blueprint'];
  isPrivacyEnabled: boolean;
  handleDownloadPDF: () => void;
}

export const ReportModal = ({ showReportModal, setShowReportModal, activePeriod, metrics, blueprint, isPrivacyEnabled, handleDownloadPDF }: Props) => {
  return (
    <AnimatePresence>
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowReportModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#111114] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-white/[0.06] bg-gradient-to-br from-[#00FFB2]/10 to-transparent">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-text-1 mb-1">AI Performance Report</h2>
                  <p className="text-sm text-text-3">{PERIODS.find(p=>p.id===activePeriod)?.label} · Generated {format(new Date(), 'MMM dd, yyyy')}</p>
                </div>
                <button onClick={() => setShowReportModal(false)} className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors">
                  <IconX size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-bg-2 border border-white/[0.04] rounded-xl p-4">
                  <p className="text-[10px] uppercase text-text-3 tracking-wide mb-1">Net Profit</p>
                  <p className={`text-xl font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${metrics.netPnl >= 0 ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
                    {metrics.netPnl >= 0 ? '+' : '-'}${Math.abs(metrics.netPnl).toLocaleString()}
                  </p>
                </div>
                <div className="bg-bg-2 border border-white/[0.04] rounded-xl p-4">
                  <p className="text-[10px] uppercase text-text-3 tracking-wide mb-1">Win Rate</p>
                  <p className="text-xl font-bold text-text-1">{metrics.winRate.toFixed(1)}%</p>
                </div>
                <div className="bg-bg-2 border border-white/[0.04] rounded-xl p-4">
                  <p className="text-[10px] uppercase text-text-3 tracking-wide mb-1">Profit Factor</p>
                  <p className="text-xl font-bold text-text-1">{metrics.profitFactor.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-[#16161A] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-[13px] font-bold text-[#00FFB2] mb-3 flex items-center gap-2"><IconBrain size={16}/> Coach Recommendations</h3>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-3 text-sm text-text-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] mt-1.5 shrink-0" />
                    Double down on your <strong>{blueprint?.bestSetup || 'best'}</strong> setups during the <strong>{blueprint?.bestSession || 'optimal'}</strong> session, as this accounts for the majority of your positive expectancy.
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A5A] mt-1.5 shrink-0" />
                    Implement a hard rule to stop trading when feeling <strong>{blueprint?.worstEmotion || 'negative'}</strong>. This state is severely degrading your win rate.
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFB800] mt-1.5 shrink-0" />
                    Your average R:R is <strong>{metrics.avgRR.toFixed(2)}R</strong>. Try to push winners slightly longer to improve your recovery factor from drawdowns.
                  </li>
                </ul>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="w-full py-3 rounded-xl font-bold text-black bg-[#00FFB2] hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <IconDownload size={18} /> Download Full PDF Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
