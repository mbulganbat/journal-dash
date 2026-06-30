import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconBrain, IconDownload, IconLoader2, IconCalendar, IconCurrencyDollar,
  IconTrendingUp, IconTrendingDown, IconRosette, IconListDetails, IconEye, IconEyeOff
} from '@tabler/icons-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { useAppContext } from '../../context/AppContext';
import { stagger, fadeUp } from '../../lib/animations';
import { MetricCard, premiumHoverProps } from '../../components/ui/Shared';
import { useCountUp } from '../../hooks/useCountUp';
import { TABS, PERIODS } from './constants';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { OverviewTab } from './components/OverviewTab';
import { TimeSessionTab } from './components/TimeSessionTab';
import { SetupsPairsTab } from './components/SetupsPairsTab';
import { BehaviorTab } from './components/BehaviorTab';
import { ReportModal } from './components/ReportModal';

export const Analytics = () => {
  const { trades, accounts, selectedAccountId, settings } = useAppContext();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [activePeriod, setActivePeriod] = useState(PERIODS[2].id);

  // Privacy Toggles
  const [isMostWinHidden, setIsMostWinHidden] = useState(false);
  const [isMostLostHidden, setIsMostLostHidden] = useState(false);
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);

  // Report Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportStep, setReportStep] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const {
    filteredTrades,
    metrics,
    setupAnalytics,
    pairAnalytics,
    symbolStats,
    streakStats,
    sessionAnalytics,
    emotionSpectrum,
    mistakeAnalytics,
    blueprint
  } = useAnalyticsData(trades, accounts, selectedAccountId, activePeriod, settings);

  // Report Generation Handler
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportStep('Analyzing behavioral patterns...');

    setTimeout(() => {
      setReportStep('Computing equity drawdowns...');
      setTimeout(() => {
        setReportStep('Formulating coach guidelines...');
        setTimeout(() => {
          setIsGenerating(false);
          setShowReportModal(true);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleDownloadPDF = () => {
    toast.success("Monthly AI Report PDF downloaded successfully!");
    navigator.clipboard.writeText("https://lumex.app/report/shared/xyz123");
    toast("Sharing link copied to clipboard", { icon: '🔗' });
    setShowReportModal(false);
  };

  // Animated Numbers
  const animatedNetPnl = useCountUp(metrics.netPnl);
  const animatedWinRate = useCountUp(metrics.winRate);

  // Detailed Stats Cards Data
  const detailedStats = [
    { label: 'Total Trades', value: filteredTrades.length, color: 'text-text-1' },
    { label: 'Winning Trades', value: metrics.winsCount, color: 'text-[#00FFB2]' },
    { label: 'Losing Trades', value: metrics.lossesCount, color: 'text-[#FF5A5A]' },
    { label: 'Break Even', value: metrics.breakevensCount, color: 'text-[#A0A0B0]' },
    { label: 'Largest Profit', value: `$ ${metrics.largestProfit.toLocaleString(undefined, {maximumFractionDigits:2})}`, color: 'text-[#00FFB2]' },
    { label: 'Largest Loss', value: `- $ ${Math.abs(metrics.largestLoss).toLocaleString(undefined, {maximumFractionDigits:2})}`, color: 'text-[#FF5A5A]' },
    { label: 'Avg Winning Trade', value: `$ ${metrics.avgWin.toLocaleString(undefined, {maximumFractionDigits:2})}`, color: 'text-[#00FFB2]' },
    { label: 'Avg Losing Trade', value: `- $ ${Math.abs(metrics.avgLoss).toLocaleString(undefined, {maximumFractionDigits:2})}`, color: 'text-[#FF5A5A]' }
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="p-6 md:p-9 pb-20 max-w-[1600px] mx-auto">

      {/* Header & Report Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-text-1 flex items-center gap-3">
            <IconBrain className="text-[#00FFB2]" size={28} />
            Analytics & Intelligence Center
          </h1>
          <button
            onClick={() => setIsPrivacyEnabled(!isPrivacyEnabled)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-3 hover:text-text-1 hover:bg-white/[0.08] transition-all"
            title={isPrivacyEnabled ? "Show Balances" : "Hide Balances"}
          >
            {isPrivacyEnabled ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating || filteredTrades.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-br from-[#00FFB2] to-[#00E5A0] shadow-[0_0_20px_rgba(0,255,178,0.25)] hover:brightness-110 transition-all disabled:opacity-70"
        >
          {isGenerating ? <IconLoader2 size={18} className="animate-spin" /> : <IconDownload size={18} />}
          {isGenerating ? reportStep : 'Generate AI Report'}
        </button>
      </div>

      {/* Premium Period Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-bg-2 border border-white/[0.06] p-2 rounded-2xl">
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activePeriod === p.id
                ? 'bg-[#00FFB2]/10 text-[#00FFB2] border border-[#00FFB2]/30 shadow-[0_0_15px_rgba(0,255,178,0.1)]'
                : 'text-text-2 hover:text-text-1 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            {p.label}
          </button>
        ))}

        {/* Custom Day Button */}
        <button className="px-4 py-2 rounded-xl text-sm font-medium text-text-2 hover:text-text-1 hover:bg-white/[0.04] border border-transparent flex items-center gap-2">
          <IconCalendar size={16} /> Custom Day
        </button>

        <div className="ml-auto px-4 text-sm text-text-3 font-medium">
          Analyzing <span className="text-text-1 font-bold">{filteredTrades.length}</span> trades
        </div>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
        <MetricCard
          title="Net P&L"
          value={metrics.netPnl}
          prefix="$"
          icon={IconCurrencyDollar}
          hoverType={metrics.netPnl >= 0 ? 'positive' : 'negative'}
          changeColor={metrics.netPnl >= 0 ? 'text-success' : 'text-danger'}
        />
        <MetricCard
          title="Win Rate"
          value={metrics.winRate}
          suffix="%"
          icon={IconRosette}
          hoverType="info"
        />
        <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#00FFB2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-white/[0.04] rounded-xl flex items-center justify-center mb-4">
              <IconTrendingUp size={22} stroke={2.5} className="text-text-3" />
            </div>
            <button onClick={() => setIsMostWinHidden(!isMostWinHidden)} className="p-1.5 text-text-3 hover:text-text-1 transition-colors rounded-lg hover:bg-white/[0.04]">
              {isMostWinHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
          <p className="uppercase text-[11px] text-text-3 tracking-wide font-semibold">Most Win Profit Day</p>
          <h3 className={`text-[24px] font-extrabold text-text-1 mt-1 transition-all duration-200 ${isMostWinHidden ? 'blur-[6px] select-none' : ''}`}>
            ${metrics.bestDay.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
          <p className={`text-[13px] text-text-3 mt-1.5 font-medium transition-all duration-200 ${isMostWinHidden ? 'blur-[4px] select-none' : ''}`}>
            {metrics.bestDay.date ? format(new Date(metrics.bestDay.date), 'MMM dd, yyyy') : 'N/A'}
          </p>
        </motion.div>

        <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#FF5A5A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-white/[0.04] rounded-xl flex items-center justify-center mb-4">
              <IconTrendingDown size={22} stroke={2.5} className="text-text-3" />
            </div>
            <button onClick={() => setIsMostLostHidden(!isMostLostHidden)} className="p-1.5 text-text-3 hover:text-text-1 transition-colors rounded-lg hover:bg-white/[0.04]">
              {isMostLostHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
          <p className="uppercase text-[11px] text-text-3 tracking-wide font-semibold">Most Lost Day</p>
          <h3 className={`text-[24px] font-extrabold text-text-1 mt-1 transition-all duration-200 ${isMostLostHidden ? 'blur-[6px] select-none' : ''}`}>
            -${Math.abs(metrics.worstDay.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
          <p className={`text-[13px] text-text-3 mt-1.5 font-medium transition-all duration-200 ${isMostLostHidden ? 'blur-[4px] select-none' : ''}`}>
            {metrics.worstDay.date ? format(new Date(metrics.worstDay.date), 'MMM dd, yyyy') : 'N/A'}
          </p>
        </motion.div>
      </div>

      {/* Detailed Performance Statistics */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <IconListDetails size={20} stroke={2.5} className="text-[#00FFB2]" />
          <h3 className="text-[16px] font-bold text-text-1">Detailed Performance Statistics</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {detailedStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.04 }}
              whileHover={{ y: -4, borderColor: "rgba(0,255,178,0.15)" }}
              className="bg-[#0C0C0E] border border-white/[0.06] rounded-card-sm p-5 relative overflow-hidden group transition-colors"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl pointer-events-none" />
              <p className="text-[10px] uppercase text-[#505060] tracking-widest font-bold mb-1.5 relative z-10">{stat.label}</p>
              <p className={`text-xl font-bold relative z-10 transition-all duration-200 ${isPrivacyEnabled && stat.label !== 'Total Trades' && stat.label !== 'Winning Trades' && stat.label !== 'Losing Trades' && stat.label !== 'Break Even' ? 'blur-[6px] select-none' : ''} ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/[0.06] pb-4 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white/[0.08] text-text-1 border border-white/[0.1]'
                : 'text-text-3 hover:text-text-2 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-[#00FFB2]' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[500px]"
        >

          {/* TAB 1: OVERVIEW & COACH */}
          {activeTab === 'overview' && (
            <OverviewTab
              metrics={metrics}
              blueprint={blueprint}
              symbolStats={symbolStats}
              streakStats={streakStats}
              isPrivacyEnabled={isPrivacyEnabled}
            />
          )}

          {/* TAB 2: SESSIONS */}
          {activeTab === 'time' && (
            <TimeSessionTab
              sessionAnalytics={sessionAnalytics}
              isPrivacyEnabled={isPrivacyEnabled}
            />
          )}

          {/* TAB 3: SETUPS & PAIRS */}
          {activeTab === 'setups' && (
            <SetupsPairsTab
              setupAnalytics={setupAnalytics}
              pairAnalytics={pairAnalytics}
              isPrivacyEnabled={isPrivacyEnabled}
            />
          )}

          {/* TAB 4: RISK & BEHAVIOR */}
          {activeTab === 'behavior' && (
            <BehaviorTab
              emotionSpectrum={emotionSpectrum}
              mistakeAnalytics={mistakeAnalytics}
              isPrivacyEnabled={isPrivacyEnabled}
            />
          )}

        </motion.div>
      </AnimatePresence>

      {/* Report Generation Modal */}
      <ReportModal
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        activePeriod={activePeriod}
        metrics={metrics}
        blueprint={blueprint}
        isPrivacyEnabled={isPrivacyEnabled}
        handleDownloadPDF={handleDownloadPDF}
      />

    </motion.div>
  );
};
