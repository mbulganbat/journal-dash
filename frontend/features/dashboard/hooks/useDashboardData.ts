import { useMemo } from 'react';
import { startOfWeek, addDays, isSameDay } from 'date-fns';
import { Account, Trade } from '../../../types';
import { selectActiveTrades } from '../../../lib/selectActiveTrades';
import {
  getNetPnL, getWinRate, getProfitFactor, getExpectancy, getAvgRR,
  getEquityCurve, filterByPeriod, groupBySession, groupBySetup,
  getAvgWin, getAvgLoss, getActiveDays
} from '../../../data/mockTrades';
import { Period } from '../types';

interface Params {
  trades: Trade[];
  accounts: Account[];
  selectedAccountId: string | null;
  activePeriod: Period;
}

export const useDashboardData = ({ trades, accounts, selectedAccountId, activePeriod }: Params) => {
  // Filter trades by active account (shared challenge-account rule)
  const activeTrades = useMemo(
    () => selectActiveTrades(trades, accounts, selectedAccountId),
    [trades, selectedAccountId, accounts]
  );

  // Calculate Initial Balance for Equity Curve
  const initialBalance = useMemo(() => {
    if (!selectedAccountId) {
      return accounts
        .filter(acc => !acc.isChallenge)
        .reduce((sum, acc) => sum + acc.initialBalance, 0);
    }
    return accounts.find(a => a.id === selectedAccountId)?.initialBalance || 0;
  }, [accounts, selectedAccountId]);

  // Metrics
  const netPnl = getNetPnL(activeTrades);
  const totalBalance = initialBalance + netPnl;
  const winRate = getWinRate(activeTrades);
  const profitFactor = getProfitFactor(activeTrades);
  const expectancy = getExpectancy(activeTrades);
  const avgRR = getAvgRR(activeTrades);
  const avgWin = getAvgWin(activeTrades);
  const avgLoss = getAvgLoss(activeTrades);
  const activeDays = getActiveDays(activeTrades);

  const chartData = getEquityCurve(filterByPeriod(activeTrades, activePeriod), initialBalance);
  const sessionData = groupBySession(activeTrades);
  const setupData = groupBySetup(activeTrades);

  // Exactly 7 recent trades for perfect height alignment
  const recentTrades = [...activeTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);

  // Sparkline calculation for Net P&L card
  const sparklineData = chartData.slice(-10).map(d => d.equity);
  const sparkMin = Math.min(...sparklineData);
  const sparkMax = Math.max(...sparklineData);
  const sparkRange = sparkMax - sparkMin || 1;
  const sparkPoints = sparklineData.map((val, i) => `${(i / 9) * 100},${100 - ((val - sparkMin) / sparkRange) * 100}`).join(' ');

  // 5-Day Calendar Strip Data (Mon-Fri of current week)
  const currentWeekDays = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // 1 = Monday
    return Array.from({ length: 5 }).map((_, i) => {
      const date = addDays(start, i);
      const dayTrades = activeTrades.filter(t => isSameDay(new Date(t.date), date));
      const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
      return { date, pnl, count: dayTrades.length };
    });
  }, [activeTrades]);

  return {
    activeTrades,
    initialBalance,
    netPnl,
    totalBalance,
    winRate,
    profitFactor,
    expectancy,
    avgRR,
    avgWin,
    avgLoss,
    activeDays,
    chartData,
    sessionData,
    setupData,
    recentTrades,
    sparkPoints,
    currentWeekDays
  };
};
