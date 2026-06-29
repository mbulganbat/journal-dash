import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconReportAnalytics, IconCertificate, IconShieldCheck, IconDownload, 
  IconFileAnalytics, IconEye, IconEyeOff, IconAlertTriangle, IconCheck,
  IconTrendingUp, IconTrendingDown, IconBrain, IconLoader2
} from '@tabler/icons-react';
import { useAppContext } from '../context/AppContext';
import { stagger, fadeUp } from '../lib/animations';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getNetPnL } from '../data/mockTrades';
import { selectActiveTrades } from '../lib/selectActiveTrades';
import { Account } from '../types';

export const Reports = () => {
  const { trades, accounts, selectedAccountId } = useAppContext();
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter trades by active account (shared challenge-account rule)
  const activeTrades = useMemo(
    () => selectActiveTrades(trades, accounts, selectedAccountId),
    [trades, accounts, selectedAccountId]
  );

  // Safe fallback so downstream calculations never read from `undefined`
  // when there are no accounts (e.g. user deleted the last one).
  const FALLBACK_ACCOUNT: Account = {
    id: 'none', name: 'No Account', type: 'Personal', broker: 'N/A', platform: 'Other',
    currency: 'USD', initialBalance: 0, isChallenge: false,
    profitTarget: 10, maxDailyDrawdown: 5, maxTotalDrawdown: 10,
  };

  const activeAccount = useMemo(() => {
    if (!selectedAccountId || selectedAccountId === 'all') return accounts[0] ?? FALLBACK_ACCOUNT;
    return accounts.find(a => a.id === selectedAccountId) || accounts[0] || FALLBACK_ACCOUNT;
  }, [accounts, selectedAccountId]);

  // 1. Prop Firm Audit & Compliance Pipeline
  const propFirmReadiness = useMemo(() => {
    const netPnl = getNetPnL(activeTrades);
    const profitTarget = activeAccount.profitTarget || 10;
    const maxDailyDrawdown = activeAccount.maxDailyDrawdown || 5;
    
    const profitTargetAmount = activeAccount.initialBalance * (profitTarget / 100);
    const profitTargetProgressPercent = Math.min((netPnl / profitTargetAmount) * 100, 100);
    
    // Mock Consistency Check (e.g., no single day > 30% of total profit)
    const dailyPnL: Record<string, number> = {};
    activeTrades.forEach(t => {
      const d = t.date.split('T')[0];
      dailyPnL[d] = (dailyPnL[d] || 0) + t.pnl;
    });
    
    let maxDailyProfit = 0;
    Object.values(dailyPnL).forEach(pnl => {
      if (pnl > maxDailyProfit) maxDailyProfit = pnl;
    });
    
    const consistencyRuleViolated = netPnl > 0 && (maxDailyProfit / netPnl) > 0.3;
    
    // Mock Drawdown Check
    let currentEquity = activeAccount.initialBalance;
    let peak = currentEquity;
    let maxDrawdownPct = 0;
    
    activeTrades.forEach(t => {
      currentEquity += t.pnl;
      if (currentEquity > peak) peak = currentEquity;
      const ddPct = ((peak - currentEquity) / peak) * 100;
      if (ddPct > maxDrawdownPct) maxDrawdownPct = ddPct;
    });

    const isPass = profitTargetProgressPercent >= 100 && !consistencyRuleViolated && maxDrawdownPct < maxDailyDrawdown;
    
    let readinessScore = 0;
    if (profitTargetProgressPercent > 0) readinessScore += profitTargetProgressPercent * 0.6;
    if (!consistencyRuleViolated) readinessScore += 20;
    if (maxDrawdownPct < maxDailyDrawdown) readinessScore += 20;

    return {
      evaluationCompany: activeAccount.broker,
      isPass,
      profitTargetProgressPercent: Math.max(0, profitTargetProgressPercent),
      consistencyRuleViolated,
      readinessScore: Math.min(100, Math.max(0, readinessScore)),
      maxDrawdownPct
    };
  }, [activeTrades, activeAccount]);

  // 2. AI Executive Briefing
  const executiveBriefing = useMemo(() => {
    if (activeTrades.length < 5) return null;

    // Find best setup
    const setupsMap: Record<string, number> = {};
    activeTrades.forEach(t => {
      setupsMap[t.setup] = (setupsMap[t.setup] || 0) + t.pnl;
    });
    const bestSetup = Object.entries(setupsMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Find worst mistake
    const mistakesMap: Record<string, number> = {};
    activeTrades.forEach(t => {
      if (t.mistakes && t.pnl < 0) {
        t.mistakes.forEach(m => {
          mistakesMap[m] = (mistakesMap[m] || 0) + Math.abs(t.pnl);
        });
      }
    });
    const worstMistake = Object.entries(mistakesMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      period: "Last 30 Days",
      primaryDriver: `${bestSetup} setups`,
      mainRiskLeak: worstMistake,
      aiAdjustmentRules: [
        `Increase position sizing on ${bestSetup} setups by 0.25% as they hold your highest expectancy.`,
        `Implement a hard stop after 2 consecutive losses to mitigate ${worstMistake} leaks.`,
        `Review entry criteria for Asian session trades, as win rate drops significantly during this period.`
      ]
    };
  }, [activeTrades]);

  // 3. Compliance Export Metrics
  const complianceTelemetry = useMemo(() => {
    const totalVolumeTraded = activeTrades.reduce((sum, t) => sum + (t.lotSize || 1), 0);
    const taxablePnL = getNetPnL(activeTrades);
    
    return {
      totalVolumeTraded,
      taxablePnL,
      exportReadyUrl: "https://lumex.app/export/compliance/xyz123"
    };
  }, [activeTrades]);

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
        
        {/* 1. Prop Firm Audit & Compliance Pipeline */}
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

        {/* 2. AI Executive Briefing */}
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

        {/* 3. Compliance Export Metrics */}
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
                <button onClick={() => handleExport('CSV')} className="flex-1 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-text-1 transition-colors border border-white/[0.08]">CSV</button>
                <button onClick={() => handleExport('JSON')} className="flex-1 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-text-1 transition-colors border border-white/[0.08]">JSON</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-white/[0.04]">
            <div className="flex items-center gap-2 text-text-3">
              <IconFileAnalytics size={16} />
              <span className="text-[12px]">Includes Trade ID, Open/Close Time (UTC), Symbol, Direction, Volume, Gross & Net P&L.</span>
            </div>
            <button 
              onClick={() => handleExport('PDF')}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-[#00FFB2] hover:brightness-110 transition-all disabled:opacity-70 shadow-[0_0_15px_rgba(0,255,178,0.2)]"
            >
              {isGenerating ? <IconLoader2 size={16} className="animate-spin" /> : <IconDownload size={16} />}
              {isGenerating ? 'Generating...' : 'Download PDF Report'}
            </button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
