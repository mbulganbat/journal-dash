import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconReportAnalytics, IconEye, IconEyeOff } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { stagger } from '../../lib/animations';
import { useReportsData } from './hooks/useReportsData';
import { PropFirmCard } from './components/PropFirmCard';
import { ExecutiveBriefingCard } from './components/ExecutiveBriefingCard';
import { ComplianceExportCard } from './components/ComplianceExportCard';

export const Reports = () => {
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { accounts, activeAccount, propFirmReadiness, executiveBriefing, complianceTelemetry } = useReportsData();

  const handleExport = (type: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`${type} report generated successfully!`);
    }, 1500);
  };

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-9 text-center">
        <IconReportAnalytics size={40} className="text-text-3 mb-4" />
        <h2 className="text-lg font-bold text-text-1 mb-1">No accounts yet</h2>
        <p className="text-sm text-text-3 max-w-sm">Add a trading account to generate compliance reports and AI briefings.</p>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="p-6 md:p-9 pb-20 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-1 flex items-center gap-3">
            <IconReportAnalytics className="text-[#00FFB2]" size={28} />
            Reports & Compliance
          </h1>
          <p className="text-sm text-text-3 mt-1">Institutional auditing, AI briefings, and tax compliance exports.</p>
        </div>

        <button
          onClick={() => setIsPrivacyEnabled(!isPrivacyEnabled)}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-3 hover:text-text-1 hover:bg-white/[0.08] transition-all"
          title={isPrivacyEnabled ? "Show Values" : "Hide Values"}
        >
          {isPrivacyEnabled ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropFirmCard propFirmReadiness={propFirmReadiness} activeAccount={activeAccount} />
        <ExecutiveBriefingCard executiveBriefing={executiveBriefing} />
        <ComplianceExportCard
          complianceTelemetry={complianceTelemetry}
          isPrivacyEnabled={isPrivacyEnabled}
          isGenerating={isGenerating}
          onExport={handleExport}
        />
      </div>
    </motion.div>
  );
};
