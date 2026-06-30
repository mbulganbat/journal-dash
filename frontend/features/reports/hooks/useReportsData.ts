import { useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { getNetPnL } from '../../../data/mockTrades';
import { selectActiveTrades } from '../../../lib/selectActiveTrades';
import { Account } from '../../../types';

// Safe fallback so downstream calculations never read from `undefined`
// when there are no accounts (e.g. user deleted the last one).
const FALLBACK_ACCOUNT: Account = {
  id: 'none', name: 'No Account', type: 'Personal', broker: 'N/A', platform: 'Other',
  currency: 'USD', initialBalance: 0, isChallenge: false,
  profitTarget: 10, maxDailyDrawdown: 5, maxTotalDrawdown: 10,
};

export const useReportsData = () => {
  const { trades, accounts, selectedAccountId } = useAppContext();

  // Filter trades by active account (shared challenge-account rule)
  const activeTrades = useMemo(
    () => selectActiveTrades(trades, accounts, selectedAccountId),
    [trades, accounts, selectedAccountId]
  );

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

  return { accounts, activeTrades, activeAccount, propFirmReadiness, executiveBriefing, complianceTelemetry };
};

export type ReportsData = ReturnType<typeof useReportsData>;
