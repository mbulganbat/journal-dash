import { useMemo } from 'react';
import { subDays, isAfter, getDay, getHours } from 'date-fns';
import { Trade, Account, AppSettings } from '../../../types';
import { selectActiveTrades } from '../../../lib/selectActiveTrades';
import { toZonedTime } from '../../../lib/timezone';
import { PERIODS } from '../constants';

export const useAnalyticsData = (
  trades: Trade[],
  accounts: Account[],
  selectedAccountId: string | null,
  activePeriod: string,
  settings: AppSettings
) => {
  // 1. Core Filtering Engine
  const filteredTrades = useMemo(() => {
    // Account filter (shared challenge-account rule)
    let r = selectActiveTrades(trades, accounts, selectedAccountId);

    // Period Filter
    const periodObj = PERIODS.find(p => p.id === activePeriod);
    if (periodObj && periodObj.id !== 'all') {
      const cutoffDate = subDays(new Date(), periodObj.days);
      r = r.filter(t => isAfter(new Date(t.date), cutoffDate));
    }

    return [...r].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trades, accounts, selectedAccountId, activePeriod]);

  // Calculate Initial Balance for Equity Curve
  const initialBalance = useMemo(() => {
    if (!selectedAccountId) {
      // "All accounts" = sum of non-challenge accounts only.
      return accounts.filter(a => !a.isChallenge).reduce((sum, acc) => sum + acc.initialBalance, 0);
    }
    return accounts.find(a => a.id === selectedAccountId)?.initialBalance || 0;
  }, [accounts, selectedAccountId]);

  // 2. Deep Performance Calculations
  const metrics = useMemo(() => {
    const resolvedTrades = filteredTrades.filter(t => t.result !== 'breakeven');
    const wins = filteredTrades.filter(t => t.result === 'win');
    const losses = filteredTrades.filter(t => t.result === 'loss');
    const breakevens = filteredTrades.filter(t => t.result === 'breakeven');

    const netPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

    const winRate = resolvedTrades.length > 0 ? (wins.length / resolvedTrades.length) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 0);

    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const expectancy = resolvedTrades.length > 0 ? netPnl / resolvedTrades.length : 0;

    const avgRR = resolvedTrades.length > 0 ? resolvedTrades.reduce((sum, t) => sum + t.rr, 0) / resolvedTrades.length : 0;

    const uniqueDays = new Set(filteredTrades.map(t => t.date.split('T')[0]));
    const activeDays = uniqueDays.size;

    // Largest Profit / Loss
    const largestProfit = wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : 0;

    // Best / Worst Day
    const dailyPnL: Record<string, number> = {};
    filteredTrades.forEach(t => {
      const d = t.date.split('T')[0];
      dailyPnL[d] = (dailyPnL[d] || 0) + t.pnl;
    });

    let bestDay = { date: '', pnl: -Infinity };
    let worstDay = { date: '', pnl: Infinity };

    Object.entries(dailyPnL).forEach(([date, pnl]) => {
      if (pnl > bestDay.pnl) bestDay = { date, pnl };
      if (pnl < worstDay.pnl) worstDay = { date, pnl };
    });

    if (bestDay.pnl === -Infinity) bestDay = { date: '', pnl: 0 };
    if (worstDay.pnl === Infinity) worstDay = { date: '', pnl: 0 };

    // Mock Commission ($3 per trade)
    const totalCommission = filteredTrades.length * 3.00;

    // Equity Curve & Drawdown
    let currentEquity = initialBalance;
    let peak = currentEquity;
    let maxDrawdownAmt = 0;
    let maxDrawdownPct = 0;

    let equityCurve = filteredTrades.map(t => {
      currentEquity += t.pnl;
      if (currentEquity > peak) peak = currentEquity;

      const ddAmt = peak - currentEquity;
      const ddPct = (ddAmt / peak) * 100;

      if (ddAmt > maxDrawdownAmt) maxDrawdownAmt = ddAmt;
      if (ddPct > maxDrawdownPct) maxDrawdownPct = ddPct;

      return { date: t.date, equity: currentEquity, drawdown: -ddPct };
    });

    if (equityCurve.length === 0) {
      const now = new Date();
      equityCurve = [
        { date: subDays(now, 1).toISOString(), equity: initialBalance, drawdown: 0 },
        { date: now.toISOString(), equity: initialBalance, drawdown: 0 }
      ];
    }

    const recoveryFactor = maxDrawdownAmt > 0 ? netPnl / maxDrawdownAmt : (netPnl > 0 ? 99 : 0);

    // Simulated Sharpe Ratio (Simplified)
    const returns = filteredTrades.map(t => t.pnl);
    const meanReturn = returns.length > 0 ? returns.reduce((a,b)=>a+b,0)/returns.length : 0;
    const variance = returns.length > 0 ? returns.reduce((a,b)=>a + Math.pow(b - meanReturn, 2), 0) / returns.length : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0;

    return {
      netPnl, grossProfit, grossLoss, winRate, profitFactor, avgWin, avgLoss, expectancy, avgRR, activeDays,
      maxDrawdownPct, recoveryFactor, sharpeRatio, equityCurve,
      winsCount: wins.length, lossesCount: losses.length, breakevensCount: breakevens.length,
      largestProfit, largestLoss, totalCommission, bestDay, worstDay
    };
  }, [filteredTrades, initialBalance]);

  // 3. Dynamic Setup & Pair Analytics
  const setupAnalytics = useMemo(() => {
    const setupsMap: Record<string, Trade[]> = {};
    filteredTrades.forEach(t => {
      if (!setupsMap[t.setup]) setupsMap[t.setup] = [];
      setupsMap[t.setup].push(t);
    });

    return Object.entries(setupsMap).map(([name, trades]) => {
      const resolved = trades.filter(t => t.result !== 'breakeven');
      const wins = resolved.filter(t => t.result === 'win');
      const pnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      const wr = resolved.length > 0 ? (wins.length / resolved.length) * 100 : 0;
      const rr = resolved.length > 0 ? resolved.reduce((sum, t) => sum + t.rr, 0) / resolved.length : 0;

      const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
      const grossLoss = Math.abs(resolved.filter(t => t.result === 'loss').reduce((sum, t) => sum + t.pnl, 0));
      const pf = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 0);

      return { name, count: trades.length, pnl, wr, rr, pf };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  const pairAnalytics = useMemo(() => {
    const pairsMap: Record<string, Trade[]> = {};
    filteredTrades.forEach(t => {
      if (!pairsMap[t.pair]) pairsMap[t.pair] = [];
      pairsMap[t.pair].push(t);
    });

    return Object.entries(pairsMap).map(([name, trades]) => {
      const resolved = trades.filter(t => t.result !== 'breakeven');
      const wins = resolved.filter(t => t.result === 'win');
      const pnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      const wr = resolved.length > 0 ? (wins.length / resolved.length) * 100 : 0;
      return { name, count: trades.length, pnl, wr };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  // Top Symbol Stats
  const symbolStats = useMemo(() => {
    const stats: Record<string, { trades: number, wins: number, losses: number, volume: number, pnl: number, grossProfit: number, grossLoss: number }> = {};
    filteredTrades.forEach(t => {
      if (!stats[t.pair]) stats[t.pair] = { trades: 0, wins: 0, losses: 0, volume: 0, pnl: 0, grossProfit: 0, grossLoss: 0 };
      stats[t.pair].trades++;
      stats[t.pair].volume += (t.lotSize || 1);
      stats[t.pair].pnl += t.pnl;
      if (t.result === 'win') {
        stats[t.pair].wins++;
        stats[t.pair].grossProfit += t.pnl;
      } else if (t.result === 'loss') {
        stats[t.pair].losses++;
        stats[t.pair].grossLoss += Math.abs(t.pnl);
      }
    });
    return Object.entries(stats).map(([pair, s]) => {
      // Win rate excludes breakeven trades, matching getWinRate elsewhere.
      const resolved = s.wins + s.losses;
      const wr = resolved > 0 ? (s.wins / resolved) * 100 : 0;
      const pf = s.grossLoss > 0 ? s.grossProfit / s.grossLoss : (s.grossProfit > 0 ? Infinity : 0);
      return { pair, ...s, wr, pf };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  // Streak Analysis
  const streakStats = useMemo(() => {
    let maxWinStreak = { count: 0, pnl: 0 };
    let maxLossStreak = { count: 0, pnl: 0 };
    let currentStreak = { type: 'none', count: 0, pnl: 0 };

    if (filteredTrades.length === 0) {
      return { maxWinStreak, maxLossStreak, currentStreak };
    }

    // filteredTrades is sorted newest first. We need oldest first to calculate streaks correctly.
    const chronologicalTrades = [...filteredTrades].reverse();

    chronologicalTrades.forEach(t => {
      if (t.result === 'breakeven') return;

      if (currentStreak.type === t.result) {
        currentStreak.count++;
        currentStreak.pnl += t.pnl;
      } else {
        currentStreak = { type: t.result, count: 1, pnl: t.pnl };
      }

      if (currentStreak.type === 'win' && currentStreak.count > maxWinStreak.count) {
        maxWinStreak = { ...currentStreak };
      }
      if (currentStreak.type === 'loss' && currentStreak.count > maxLossStreak.count) {
        maxLossStreak = { ...currentStreak };
      }
    });

    return { maxWinStreak, maxLossStreak, currentStreak };
  }, [filteredTrades]);

  // 4. Time & Session Analytics (Timezone Aware)
  const sessionAnalytics = useMemo(() => {
    const sessionsMap: Record<string, Trade[]> = {};
    filteredTrades.forEach(t => {
      if (!sessionsMap[t.session]) sessionsMap[t.session] = [];
      sessionsMap[t.session].push(t);
    });

    return Object.entries(sessionsMap).map(([name, trades]) => {
      const resolved = trades.filter(t => t.result !== 'breakeven');
      const wins = trades.filter(t => t.result === 'win');
      const losses = trades.filter(t => t.result === 'loss');
      const breakevens = trades.filter(t => t.result === 'breakeven');

      const pnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      const wr = resolved.length > 0 ? (wins.length / resolved.length) * 100 : 0;

      const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
      const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
      const pf = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 0);

      return {
        name,
        subject: name,
        count: trades.length,
        wins: wins.length,
        losses: losses.length,
        breakevens: breakevens.length,
        pnl,
        wr,
        A: wr,
        B: pf * 20,
        rawPF: pf,
        fullMark: 100
      };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  const { hourlyHeatmap, peakHours } = useMemo(() => {
    const grid = Array.from({ length: 5 }, () => Array(24).fill({ pnl: 0, count: 0 })); // 5 days (Mon-Fri), 24 hours
    let maxAbsPnl = 1;

    const hourStats = Array.from({ length: 24 }, () => ({ wins: 0, losses: 0, total: 0 }));

    filteredTrades.forEach(t => {
      // Bucket each trade by the hour-of-day in the selected timezone.
      const date = toZonedTime(new Date(t.date), settings.timezone);
      const day = getDay(date); // 0=Sun, 1=Mon...
      const hour = getHours(date);

      if (day >= 1 && day <= 5) {
        const currentCell = grid[day - 1][hour];
        grid[day - 1][hour] = {
          pnl: currentCell.pnl + t.pnl,
          count: currentCell.count + 1
        };
        if (Math.abs(grid[day - 1][hour].pnl) > maxAbsPnl) maxAbsPnl = Math.abs(grid[day - 1][hour].pnl);
      }

      hourStats[hour].total++;
      if (t.result === 'win') hourStats[hour].wins++;
      if (t.result === 'loss') hourStats[hour].losses++;
    });

    // Calculate Peak Hours
    let bestTpHour = 0;
    let maxTpRatio = -1;
    let worstSlHour = 0;
    let maxSlCount = -1;

    hourStats.forEach((stat, h) => {
      if (stat.total >= 3) { // Minimum sample size
        const tpRatio = stat.wins / stat.total;
        if (tpRatio > maxTpRatio) { maxTpRatio = tpRatio; bestTpHour = h; }
      }
      if (stat.losses > maxSlCount) { maxSlCount = stat.losses; worstSlHour = h; }
    });

    return {
      hourlyHeatmap: { grid, maxAbsPnl },
      peakHours: {
        bestTp: `${bestTpHour.toString().padStart(2, '0')}:00 - ${(bestTpHour+1).toString().padStart(2, '0')}:00`,
        worstSl: `${worstSlHour.toString().padStart(2, '0')}:00 - ${(worstSlHour+1).toString().padStart(2, '0')}:00`
      }
    };
  }, [filteredTrades, settings.timezone]);

  // 5. Psychology & Behavior Analytics (5-Segment Spectrum)
  const emotionSpectrum = useMemo(() => {
    const spectrum = [
      { zone: "Panic / FOMO", emotions: ['FOMO'], tradeCount: 0, netPnL: 0, wins: 0, resolved: 0, color: "#FF5A5A" },
      { zone: "Impatient / Rushed", emotions: ['Rushed'], tradeCount: 0, netPnL: 0, wins: 0, resolved: 0, color: "#FFB800" },
      { zone: "Neutral / Execution", emotions: ['Neutral', 'Unsure'], tradeCount: 0, netPnL: 0, wins: 0, resolved: 0, color: "#A0A0B0" },
      { zone: "Disciplined Plan", emotions: ['Patient'], tradeCount: 0, netPnL: 0, wins: 0, resolved: 0, color: "#14F195" },
      { zone: "Zen / Flow State", emotions: ['Focused'], tradeCount: 0, netPnL: 0, wins: 0, resolved: 0, color: "#00FFB2" }
    ];

    filteredTrades.forEach(t => {
      const segment = spectrum.find(s => s.emotions.includes(t.emotion));
      if (segment) {
        segment.tradeCount++;
        segment.netPnL += t.pnl;
        if (t.result !== 'breakeven') {
          segment.resolved++;
          if (t.result === 'win') segment.wins++;
        }
      }
    });

    return spectrum.map(s => ({
      ...s,
      winRate: s.resolved > 0 ? (s.wins / s.resolved) * 100 : 0
    }));
  }, [filteredTrades]);

  const mistakeAnalytics = useMemo(() => {
    const mistakesMap: Record<string, { count: number, lossAmt: number }> = {};
    let totalLossesFromMistakes = 0;

    filteredTrades.forEach(t => {
      if (t.mistakes && t.mistakes.length > 0) {
        t.mistakes.forEach(m => {
          if (!mistakesMap[m]) mistakesMap[m] = { count: 0, lossAmt: 0 };
          mistakesMap[m].count++;
          if (t.pnl < 0) {
            mistakesMap[m].lossAmt += Math.abs(t.pnl);
            totalLossesFromMistakes += Math.abs(t.pnl);
          }
        });
      }
    });

    return Object.entries(mistakesMap).map(([name, data]) => ({
      name,
      count: data.count,
      lossAmt: data.lossAmt,
      severity: data.lossAmt > 500 ? 'high' : 'medium' as 'high' | 'medium'
    })).sort((a, b) => b.lossAmt - a.lossAmt);
  }, [filteredTrades]);

  // 6. AI Trading Coach Blueprint
  const blueprint = useMemo(() => {
    if (filteredTrades.length < 5) return null;

    const bestSession = sessionAnalytics.sort((a,b) => b.pnl - a.pnl)[0];
    const bestPair = pairAnalytics.sort((a,b) => b.pnl - a.pnl)[0];
    const bestSetup = setupAnalytics.sort((a,b) => b.pnl - a.pnl)[0];

    const worstMistake = mistakeAnalytics[0];

    // Worst emotion = emotion with the lowest net P&L (min 1 trade)
    const emotionPnl: Record<string, number> = {};
    filteredTrades.forEach(t => {
      emotionPnl[t.emotion] = (emotionPnl[t.emotion] || 0) + t.pnl;
    });
    const worstEmotion = Object.entries(emotionPnl).sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A';

    return {
      bestSession: bestSession?.subject || 'N/A',
      bestPair: bestPair?.name || 'N/A',
      bestSetup: bestSetup?.name || 'N/A',
      bestHour: peakHours.bestTp,
      worstEmotion,
      worstMistake: worstMistake?.name || 'N/A',
      worstMistakeCost: worstMistake?.lossAmt || 0,
      optimalRisk: '1.0% - 1.5%'
    };
  }, [filteredTrades, sessionAnalytics, pairAnalytics, setupAnalytics, mistakeAnalytics, peakHours]);

  return {
    filteredTrades,
    initialBalance,
    metrics,
    setupAnalytics,
    pairAnalytics,
    symbolStats,
    streakStats,
    sessionAnalytics,
    hourlyHeatmap,
    peakHours,
    emotionSpectrum,
    mistakeAnalytics,
    blueprint
  };
};

export type AnalyticsData = ReturnType<typeof useAnalyticsData>;
