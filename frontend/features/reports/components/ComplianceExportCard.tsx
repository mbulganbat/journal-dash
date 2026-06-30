import { motion } from 'framer-motion';
import { IconShieldCheck, IconFileAnalytics, IconDownload, IconLoader2 } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';
import { ReportsData } from '../hooks/useReportsData';

interface Props {
  complianceTelemetry: ReportsData['complianceTelemetry'];
  isPrivacyEnabled: boolean;
  isGenerating: boolean;
  onExport: (type: string) => void;
}

export const ComplianceExportCard = ({ complianceTelemetry, isPrivacyEnabled, isGenerating, onExport }: Props) => {
  return (
    <motion.div variants={fadeUp} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 lg:col-span-2">
      <div className="flex items-center gap-2 mb-6">
        <IconShieldCheck size={20} className="text-[#00E5A0]" />
        <h3 className="text-[16px] font-bold text-text-1">Compliance & Tax Export</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#16161A] border border-white/[0.04] rounded-xl p-5">
          <p className="text-[11px] uppercase text-text-3 tracking-wide font-semibold mb-1">Total Volume Traded</p>
          <p className="text-[24px] font-extrabold text-text-1">{complianceTelemetry.totalVolumeTraded.toFixed(2)} <span className="text-sm text-text-3 font-medium">Lots</span></p>
        </div>
        <div className="bg-[#16161A] border border-white/[0.04] rounded-xl p-5">
          <p className="text-[11px] uppercase text-text-3 tracking-wide font-semibold mb-1">Taxable P&L</p>
          <p className={`text-[24px] font-extrabold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${complianceTelemetry.taxablePnL >= 0 ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
            {complianceTelemetry.taxablePnL >= 0 ? '+' : '-'}${Math.abs(complianceTelemetry.taxablePnL).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
          </p>
        </div>
        <div className="bg-[#16161A] border border-white/[0.04] rounded-xl p-5 flex flex-col justify-center">
          <p className="text-[11px] uppercase text-text-3 tracking-wide font-semibold mb-2">Export Format</p>
          <div className="flex gap-2">
            <button onClick={() => onExport('CSV')} className="flex-1 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-text-1 transition-colors border border-white/[0.08]">CSV</button>
            <button onClick={() => onExport('JSON')} className="flex-1 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-text-1 transition-colors border border-white/[0.08]">JSON</button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 text-text-3">
          <IconFileAnalytics size={16} />
          <span className="text-[12px]">Includes Trade ID, Open/Close Time (UTC), Symbol, Direction, Volume, Gross & Net P&L.</span>
        </div>
        <button
          onClick={() => onExport('PDF')}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-[#00FFB2] hover:brightness-110 transition-all disabled:opacity-70 shadow-[0_0_15px_rgba(0,255,178,0.2)]"
        >
          {isGenerating ? <IconLoader2 size={16} className="animate-spin" /> : <IconDownload size={16} />}
          {isGenerating ? 'Generating...' : 'Download PDF Report'}
        </button>
      </div>
    </motion.div>
  );
};
