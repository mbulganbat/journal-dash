import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconChartHistogram, IconCalendar, IconLayoutGrid, IconMoodSmile, 
  IconBrain, IconDownload, IconLoader2, IconTrophy, IconAlertTriangle,
  IconTrendingUp, IconTrendingDown, IconTarget, IconClock, IconCurrencyDollar,
  IconCheck, IconX, IconRosette, IconCalculator, IconChartLine, IconArrowsRightLeft,
  IconFlame, IconListDetails, IconInfoCircle, IconEye, IconEyeOff
} from '@tabler/icons-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis, Cell, ReferenceLine
} from 'recharts';
import { format, subDays, subMonths, startOfYear, isAfter, isSameDay, getDay, getHours, addHours } from 'date-fns';
import toast from 'react-hot-toast';

import { useAppContext } from '../context/AppContext';
import { stagger, fadeUp } from '../lib/animations';
import { MetricCard, ProgressBar, premiumHoverProps } from '../components/ui/Shared';
import { Trade } from '../types';
import { useCountUp } from '../hooks/useCountUp';
import { selectActiveTrades } from '../lib/selectActiveTrades';

const TABS = [
  { id: 'overview', label: 'Overview & Coach', icon: IconBrain },
  { id: 'time', label: 'Time & Session', icon: IconClock },
  { id: 'setups', label: 'Setups & Pairs', icon: IconLayoutGrid },
  { id: 'behavior', label: 'Risk & Behavior', icon: IconMoodSmile }
];

const PERIODS = [
  { id: 'today', label: 'Today', days: 0 },
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
  { id: '6m', label: 'Last 6 Months', days: 180 },
  { id: '1y', label: 'Last Year', days: 365 },
  { id: 'all', label: 'All Time', days: 9999 }
];

// Helper to simulate timezone offset
const getTimezoneOffset = (tz: string) => {
  if (tz === 'EST') return -5;
  if (tz === 'GMT') return 0;
  if (tz === 'ULAT') return 8; // Ulaanbaatar
  return 0; // UTC default
};

export const Analytics = () => {
  const { trades, accounts, selectedAccountId, settings } = useAppContext();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [activePeriod, setActivePeriod] = useState(PERIODS[2].id);
  const [topSymbolView, setTopSymbolView] = useState<'top'|'bottom'>('top');
  
  // Privacy Toggles
  const [isMostWinHidden, setIsMostWinHidden] = useState(false);
  const [isMostLostHidden, setIsMostLostHidden] = useState(false);
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
  
  // Report Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportStep, setReportStep] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

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

  const displayedSymbols = topSymbolView === 'top' 
    ? symbolStats.slice(0, 5) 
    : [...symbolStats].reverse().slice(0, 5);

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
    const tzOffset = getTimezoneOffset(settings.timezone);

    filteredTrades.forEach(t => {
      // Timezone adjustment
      const date = addHours(new Date(t.date), tzOffset);
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

  // Custom Tooltips
  const CustomTooltip = ({ active, payload, label, prefix='', suffix='' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-3 border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl z-50">
          <p className="text-text-3 text-xs mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="font-bold text-[13px]" style={{ color: p.color || p.fill }}>
              {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString(undefined, {maximumFractionDigits:2}) : p.value}{suffix}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomAssetTooltip = ({ active, payload, label, isPrivacyEnabled }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isWin = data.pnl >= 0;
      return (
        <div className="bg-[#16161A]/90 backdrop-blur-md rounded-card-sm border border-white/10 p-3 shadow-2xl min-w-[160px]">
          <p className="text-text-1 font-bold text-[14px] mb-2 border-b border-white/[0.06] pb-2">{label}</p>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-text-3 uppercase tracking-wide">Trades</span>
            <span className="text-[13px] font-bold text-text-1">{data.count}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-text-3 uppercase tracking-wide">Win Rate</span>
            <span className={`text-[13px] font-bold ${data.wr >= 50 ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>{data.wr.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-text-3 uppercase tracking-wide">Net P&L</span>
            <span className={`text-[13px] font-extrabold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${isWin ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
              {isWin ? '+' : '-'}${Math.abs(data.pnl).toLocaleString(undefined, {maximumFractionDigits:2})}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomEquityTooltip = ({ active, payload, label, isPrivacyEnabled }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#16161A]/95 backdrop-blur-md border border-white/[0.06] rounded-card-sm px-4 py-3 shadow-2xl z-50 min-w-[200px]">
          <p className="text-text-3 text-xs mb-3 font-semibold uppercase tracking-wider">{format(new Date(label), 'MMM dd, yyyy')}</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-6">
              <span className="text-[12px] text-text-2">Account Balance</span>
              <span className={`text-[13px] font-bold text-[#00FFB2] transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>
                ${data.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-[12px] text-text-2">Drawdown</span>
              <span className="text-[13px] font-bold text-[#FF5A5A]">
                {data.drawdown.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0C0C0E]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl z-50 min-w-[180px]">
          <p className="text-text-1 font-bold text-[14px] mb-3 border-b border-white/[0.06] pb-2 uppercase tracking-wider">{data.subject}</p>
          <div className="flex justify-between items-center gap-4 mb-2">
            <span className="text-[11px] text-text-3 uppercase tracking-wide font-semibold">Win Rate</span>
            <span className="text-[13px] font-bold text-[#00FFB2]">{data.A.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center gap-4 mb-2">
            <span className="text-[11px] text-text-3 uppercase tracking-wide font-semibold">Profit Factor</span>
            <span className="text-[13px] font-bold text-[#B259FF]">{data.rawPF.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[11px] text-text-3 uppercase tracking-wide font-semibold">Net P&L</span>
            <span className={`text-[13px] font-extrabold ${data.pnl >= 0 ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
              {data.pnl >= 0 ? '+' : '-'}${Math.abs(data.pnl).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
            </span>
          </div>
        </div>
      );
    }
    return null;
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

  // Expectancy Calculations
  const loseRate = 100 - metrics.winRate;
  const winContribution = (metrics.winRate / 100) * metrics.avgWin;
  const loseContribution = (loseRate / 100) * metrics.avgLoss;
  const isPositiveExpectancy = metrics.expectancy >= 0;

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
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                
                {/* Equity & Drawdown Chart (70/30 Split) */}
                <div className="flex flex-col gap-6">
                  <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 w-full">
                    <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
                      <IconChartLine size={18} className="text-[#00FFB2]" /> Equity Growth & Drawdown
                    </h3>
                    <div className="h-[400px] w-full flex flex-col">
                      {/* Top 70%: Equity Curve */}
                      <ResponsiveContainer width="100%" height="70%">
                        <AreaChart data={metrics.equityCurve} syncId="equity-drawdown" margin={{ top: 10, right: 60, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEq" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00FFB2" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} />
                          <XAxis dataKey="date" hide />
                          <YAxis domain={['auto', 'auto']} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} width={60} />
                          <Tooltip content={<CustomEquityTooltip isPrivacyEnabled={isPrivacyEnabled} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                          <Area type="monotone" dataKey="equity" stroke="#00FFB2" strokeWidth={1.5} fill="url(#colorEq)" activeDot={{ r: 4, fill: '#00FFB2', stroke: '#0C0C0E', strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                      
                      {/* Bottom 30%: Drawdown Curve */}
                      <ResponsiveContainer width="100%" height="30%">
                        <AreaChart data={metrics.equityCurve} syncId="equity-drawdown" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorDd" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF5A5A" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} horizontal={false} />
                          <XAxis dataKey="date" tickFormatter={v => format(new Date(v), 'MMM dd')} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} dy={10} />
                          <YAxis domain={['auto', 0]} orientation="right" tickFormatter={v => `${v}%`} stroke="none" tick={{ fill: '#FF5A5A', fontSize: 11 }} width={60} />
                          <Tooltip content={() => null} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                          <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />
                          <Area type="monotone" dataKey="drawdown" stroke="#FF5A5A" strokeWidth={1.5} fill="url(#colorDd)" activeDot={{ r: 4, fill: '#FF5A5A', stroke: '#0C0C0E', strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* AI Trading Coach Blueprint */}
                <div className="flex flex-col gap-6">
                  <motion.div {...premiumHoverProps} className="bg-bg-2 border border-[#FFB800]/20 rounded-card p-6 relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFB800] to-[#FFD700]" />
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-6 relative z-10">
                      <IconTrophy size={24} className="text-[#FFB800]" />
                      <h3 className="text-[18px] font-bold text-text-1">Personal Blueprint</h3>
                    </div>

                    {blueprint ? (
                      <div className="flex flex-col gap-5 relative z-10 flex-1">
                        <div className="bg-[#16161A] border border-white/[0.06] rounded-xl p-4">
                          <p className="text-[11px] uppercase text-text-3 tracking-wide font-semibold mb-3">Optimal Trading Profile</p>
                          <div className="grid grid-cols-2 gap-y-4 gap-x-4 font-mono">
                            <div>
                              <span className="text-[10px] text-text-3 block uppercase tracking-wider mb-1">Best Session</span>
                              <span className="text-[13px] font-bold text-[#00FFB2]">{blueprint.bestSession}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-text-3 block uppercase tracking-wider mb-1">Best Pair</span>
                              <span className="text-[13px] font-bold text-[#00FFB2]">{blueprint.bestPair}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-text-3 block uppercase tracking-wider mb-1">Best Setup</span>
                              <span className="text-[13px] font-bold text-[#00FFB2]">{blueprint.bestSetup}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-text-3 block uppercase tracking-wider mb-1">Peak Hour</span>
                              <span className="text-[13px] font-bold text-[#00FFB2]">{blueprint.bestHour}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <p className="text-[11px] uppercase text-[#FF5A5A]/80 tracking-wide font-semibold">Critical Weaknesses</p>
                          <div className="bg-[#FF5A5A]/5 border border-[#FF5A5A]/15 rounded-xl p-4 flex items-start gap-3">
                            <IconAlertTriangle size={16} className="text-[#FF5A5A] mt-0.5 shrink-0" />
                            <p className="text-[13px] text-text-2 leading-tight">
                              <span className="font-bold text-text-1">{blueprint.worstEmotion}</span> state trades are severely underperforming.
                            </p>
                          </div>
                          <div className="bg-[#FF5A5A]/5 border border-[#FF5A5A]/15 rounded-xl p-4 flex items-start gap-3">
                            <IconAlertTriangle size={16} className="text-[#FF5A5A] mt-0.5 shrink-0" />
                            <p className="text-[13px] text-text-2 leading-tight">
                              <span className="font-bold text-text-1">{blueprint.worstMistake}</span> cost you <span className={`text-[#FF5A5A] font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>${blueprint.worstMistakeCost.toFixed(0)}</span> this period.
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto pt-5 border-t border-white/[0.06]">
                          <p className="text-[14px] text-text-1 leading-relaxed italic font-medium">
                            "Your strongest absolute edge is trading <span className="text-[#00FFB2]">{blueprint.bestPair} {blueprint.bestSetup}</span> setups during <span className="text-[#00FFB2]">{blueprint.bestSession}</span> sessions with <span className="text-[#00FFB2]">{blueprint.optimalRisk}</span> risk."
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-sm text-text-3 text-center">
                        Not enough data to generate blueprint. Log at least 5 trades.
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* NEW ROW: Expectancy, Top Symbol & Streak Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Expectancy per Trade Card */}
                <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[18px] font-bold text-text-1">Expectancy per Trade</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[16px] font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${isPositiveExpectancy ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
                        {isPositiveExpectancy ? '+' : '-'}${Math.abs(metrics.expectancy).toFixed(2)}
                      </span>
                      <IconInfoCircle size={16} className="text-text-3" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[14px] text-text-2">Rating</span>
                    <span className={`text-[14px] font-bold ${isPositiveExpectancy ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
                      {isPositiveExpectancy ? 'Positive' : 'Negative'}
                    </span>
                  </div>

                  <div className="mb-6">
                    <p className="text-[14px] text-text-2 mb-4">Expectancy breakdown</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[12px] text-text-3 mb-1">Win contribution</p>
                        <div className="h-1 w-8 bg-[#00FFB2] rounded-full mb-2" />
                        <p className={`text-[16px] font-bold text-text-1 transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>${winContribution.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[12px] text-text-3 mb-1">Lose contribution</p>
                        <div className="h-1 w-8 bg-[#FF5A5A] rounded-full mb-2" />
                        <p className={`text-[16px] font-bold text-text-1 transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>-${loseContribution.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-auto pt-4 border-t border-white/[0.04]">
                    <div>
                      <p className="text-[11px] text-text-3 mb-1">Win<br/>Rate</p>
                      <p className="text-[14px] font-bold text-[#00FFB2]">{metrics.winRate.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-3 mb-1">Lose<br/>Rate</p>
                      <p className="text-[14px] font-bold text-[#FF5A5A]">{loseRate.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-3 mb-1">Avg<br/>Win</p>
                      <p className={`text-[14px] font-bold text-[#00FFB2] transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>${metrics.avgWin.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-3 mb-1">Avg<br/>Loss</p>
                      <p className={`text-[14px] font-bold text-[#FF5A5A] transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>-${metrics.avgLoss.toFixed(0)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Top Symbol Card */}
                <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[18px] font-bold text-text-1">Top Symbol</h3>
                    <div className="flex bg-bg-3 rounded-lg p-1 border border-white/[0.04]">
                      <button onClick={() => setTopSymbolView('top')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${topSymbolView === 'top' ? 'bg-[#5B6BFF] text-white' : 'text-text-3 hover:text-text-2'}`}>Top</button>
                      <button onClick={() => setTopSymbolView('bottom')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${topSymbolView === 'bottom' ? 'bg-[#5B6BFF] text-white' : 'text-text-3 hover:text-text-2'}`}>Bottom</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {displayedSymbols.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full ${s.pnl >= 0 ? 'bg-[#00FFB2]' : 'bg-[#FF5A5A]'}`} />
                          <div>
                            <p className="text-[14px] font-bold text-text-1">{s.pair}</p>
                            <p className="text-[12px] text-text-3">{s.trades} trades | {s.wr.toFixed(0)}% wr | {s.volume.toFixed(1)} vol.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-[14px] font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${s.pnl >= 0 ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
                            {s.pnl >= 0 ? '+' : '-'}${Math.abs(s.pnl).toLocaleString(undefined, {maximumFractionDigits:0})}
                          </p>
                          <p className="text-[12px] text-text-3">PF: {s.pf === Infinity ? 'Infinity' : s.pf.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {displayedSymbols.length === 0 && (
                      <div className="text-sm text-text-3 text-center py-4">No symbol data available.</div>
                    )}
                  </div>
                </motion.div>

                {/* Streak Analysis Card */}
                <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[18px] font-bold text-text-1">Streak Analysis</h3>
                    <IconInfoCircle size={18} className="text-text-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                    <div className="border border-[#00FFB2]/30 bg-[#00FFB2]/[0.02] rounded-xl p-5">
                      <p className="text-[13px] text-text-3 font-medium mb-3">Longest Win Streak</p>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-text-1 leading-none">{streakStats.maxWinStreak.count} <span className="text-sm font-medium text-text-3">trades</span></span>
                        <span className={`text-lg font-bold text-[#00FFB2] leading-none transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>${streakStats.maxWinStreak.pnl.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="border border-[#FF5A5A]/30 bg-[#FF5A5A]/[0.02] rounded-xl p-5">
                      <p className="text-[13px] text-text-3 font-medium mb-3">Longest Lose Streak</p>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-text-1 leading-none">{streakStats.maxLossStreak.count} <span className="text-sm font-medium text-text-3">trades</span></span>
                        <span className={`text-lg font-bold text-[#FF5A5A] leading-none transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>-${Math.abs(streakStats.maxLossStreak.pnl).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[15px] text-text-3 font-medium">Current Streak:</span>
                      <span className="text-[16px] font-bold text-text-1">{streakStats.currentStreak.count} {streakStats.currentStreak.type === 'win' ? 'wins' : 'loses'}</span>
                      <span className={`text-[16px] font-bold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${streakStats.currentStreak.type === 'win' ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
                        {streakStats.currentStreak.type === 'win' ? '+' : '-'}${Math.abs(streakStats.currentStreak.pnl).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(streakStats.currentStreak.count, 10) }).map((_, i) => (
                        <div key={i} className={`w-5 h-5 rounded-full ${streakStats.currentStreak.type === 'win' ? 'bg-[#00FFB2]' : 'bg-[#FF5A5A]'}`} />
                      ))}
                      {streakStats.currentStreak.count === 0 && (
                        <span className="text-sm text-text-3">No active streak</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* TAB 2: SESSIONS */}
          {activeTab === 'time' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* Session P&L Bar Chart */}
              <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6">
                <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
                  <IconChartHistogram size={18} className="text-[#B259FF]" /> P&L by Session
                </h3>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionAnalytics} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00FFB2" stopOpacity={1} />
                          <stop offset="100%" stopColor="#14F195" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF5A5A" stopOpacity={1} />
                          <stop offset="100%" stopColor="#FF1F1F" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
                      <XAxis dataKey="name" stroke="none" tick={{ fill: '#A0A0B0', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                      <YAxis tickFormatter={v => `$${v}`} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} dx={-10} />
                      <Tooltip content={<CustomAssetTooltip isPrivacyEnabled={isPrivacyEnabled} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} strokeDasharray="3 3" />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]} barSize={32}>
                        {sessionAnalytics.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.pnl >= 0 ? 'url(#profitGrad)' : 'url(#lossGrad)'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Session Detailed Table */}
              <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 overflow-hidden flex flex-col">
                <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
                  <IconListDetails size={18} className="text-[#00FFB2]" /> Session Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold">Session</th>
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Trades</th>
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">W / L / BE</th>
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Win Rate</th>
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionAnalytics.map((s, i) => {
                        let wrColor = 'text-danger bg-danger/10 border-danger/20';
                        if (s.wr >= 70) wrColor = 'text-[#00FFB2] bg-[#00FFB2]/10 border-[#00FFB2]/20';
                        else if (s.wr >= 40) wrColor = 'text-warning bg-warning/10 border-warning/20';

                        return (
                          <motion.tr
                            key={i}
                            whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.02)" }}
                            className="border-b border-white/[0.04] last:border-0 transition-colors cursor-pointer"
                          >
                            <td className="py-3 text-[13px] font-bold text-text-1">{s.name}</td>
                            <td className="py-3 text-[13px] text-text-2 text-right">{s.count}</td>
                            <td className="py-3 text-[12px] text-text-3 text-right">
                              <span className="text-[#00FFB2]">{s.wins}</span> / <span className="text-[#FF5A5A]">{s.losses}</span> / <span>{s.breakevens}</span>
                            </td>
                            <td className="py-3 text-right">
                              <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md border ${wrColor}`}>
                                {s.wr.toFixed(0)}%
                              </span>
                            </td>
                            <td className={`py-3 text-[13px] font-bold text-right transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${s.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                              {s.pnl >= 0 ? '+' : '-'}${Math.abs(s.pnl).toLocaleString(undefined, {maximumFractionDigits:0})}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* TAB 3: SETUPS & PAIRS */}
          {activeTab === 'setups' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              
              {/* Setups Table */}
              <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 overflow-hidden flex flex-col">
                <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
                  <IconLayoutGrid size={18} className="text-[#00FFB2]" /> Setup Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold">Setup</th>
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Trades</th>
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Win Rate</th>
                        <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {setupAnalytics.map((s, i) => {
                        let wrColor = 'text-danger bg-danger/10 border-danger/20';
                        if (s.wr >= 70) wrColor = 'text-[#00FFB2] bg-[#00FFB2]/10 border-[#00FFB2]/20';
                        else if (s.wr >= 40) wrColor = 'text-warning bg-warning/10 border-warning/20';

                        return (
                          <motion.tr
                            key={i}
                            whileHover={{ x: 4, backgroundColor: "rgba(0,255,178,0.02)" }}
                            className="border-b border-white/[0.04] last:border-0 transition-colors cursor-pointer"
                          >
                            <td className="py-3 text-[13px] font-bold text-text-1">{s.name}</td>
                            <td className="py-3 text-[13px] text-text-2 text-right">{s.count}</td>
                            <td className="py-3 text-right">
                              <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md border ${wrColor}`}>
                                {s.wr.toFixed(0)}%
                              </span>
                            </td>
                            <td className={`py-3 text-[13px] font-bold text-right transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${s.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                              {s.pnl >= 0 ? '+' : '-'}${Math.abs(s.pnl).toLocaleString(undefined, {maximumFractionDigits:0})}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Pairs Bar Chart */}
              <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6">
                <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
                  <IconArrowsRightLeft size={18} className="text-[#FFB800]" /> Asset Performance
                </h3>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pairAnalytics} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profitGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#00FFB2" stopOpacity={1} />
                          <stop offset="100%" stopColor="#14F195" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="lossGrad" x1="1" y1="0" x2="0" y2="0">
                          <stop offset="0%" stopColor="#FF5A5A" stopOpacity={1} />
                          <stop offset="100%" stopColor="#FF1F1F" stopOpacity={0.4} />
                        </linearGradient>
                        <filter id="glowProfit" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00FFB2" floodOpacity="0.5" />
                        </filter>
                        <filter id="glowLoss" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FF5A5A" floodOpacity="0.5" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" horizontal={false} vertical={true} />
                      <XAxis type="number" tickFormatter={v => `$${v}`} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} dy={10} />
                      <YAxis dataKey="name" type="category" stroke="none" tick={{ fill: '#A0A0B0', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }} dx={-10} />
                      <Tooltip content={<CustomAssetTooltip isPrivacyEnabled={isPrivacyEnabled} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <ReferenceLine x={0} stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} strokeDasharray="3 3" />
                      <Bar dataKey="pnl" radius={[0, 6, 6, 0]} barSize={16}>
                        {pairAnalytics.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.pnl >= 0 ? 'url(#profitGrad)' : 'url(#lossGrad)'} 
                            filter={entry.pnl >= 0 ? 'url(#glowProfit)' : 'url(#glowLoss)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </div>
          )}

          {/* TAB 4: RISK & BEHAVIOR */}
          {activeTab === 'behavior' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              
              {/* 5-Segment Emotional Spectrum Grid */}
              <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col">
                <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
                  <IconMoodSmile size={18} className="text-[#00E5A0]" /> Emotion vs P&L
                </h3>
                
                <div className="flex flex-col gap-3 flex-1">
                  {emotionSpectrum.map((segment, i) => (
                    <div key={i} className="bg-[#16161A] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-white/[0.1] transition-colors">
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: segment.color }} />
                      
                      <div className="flex flex-col pl-3">
                        <span className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: segment.color }}>{segment.zone}</span>
                        <span className="text-[12px] text-text-3 font-mono">{segment.tradeCount} trades</span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className={`text-[16px] font-extrabold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`} style={{ color: segment.netPnL >= 0 ? '#00FFB2' : '#FF5A5A', textShadow: `0 0 10px ${segment.netPnL >= 0 ? 'rgba(0,255,178,0.3)' : 'rgba(255,90,90,0.3)'}` }}>
                          {segment.netPnL >= 0 ? '+' : '-'}${Math.abs(segment.netPnL).toLocaleString(undefined, {maximumFractionDigits:0})}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-text-3">WR: {segment.winRate.toFixed(0)}%</span>
                          <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full" style={{ width: `${segment.winRate}%`, backgroundColor: segment.color }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Coach Callout */}
                <div className="mt-6 pt-4 border-t border-white/[0.04]">
                  <p className="text-[12px] text-text-2 leading-relaxed">
                    <span className="font-bold text-[#FF5A5A]">ALERT:</span> Trading in 'Panic / FOMO' states accounts for a significant portion of your drawdowns. Curbing these trades boosts your net profit.
                  </p>
                </div>
              </motion.div>

              {/* Mistake Cost Analysis */}
              <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 flex flex-col">
                <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
                  <IconAlertTriangle size={18} className="text-[#FF5A5A]" /> Mistake Cost Analysis
                </h3>
                
                <div className="flex flex-col gap-3 flex-1">
                  {mistakeAnalytics.length > 0 ? mistakeAnalytics.map((m, i) => (
                    <div key={i} className="bg-[#16161A] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between group hover:border-white/[0.1] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.severity === 'high' ? 'bg-[#FF5A5A]/10' : 'bg-[#FFB800]/10'}`}>
                          <IconAlertTriangle size={16} className={m.severity === 'high' ? 'text-[#FF5A5A]' : 'text-[#FFB800]'} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-text-1">{m.name}</span>
                          <span className="text-[11px] text-text-3">{m.count} occurrences</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-[15px] font-extrabold text-[#FF5A5A] transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>
                          -${m.lossAmt.toLocaleString(undefined, {maximumFractionDigits:0})}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-text-3 text-center">
                      No mistakes recorded in this period.
                    </div>
                  )}
                </div>
              </motion.div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Report Generation Modal */}
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

    </motion.div>
  );
};

const RadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0C0C0E]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl z-50 min-w-[180px]">
        <p className="text-text-1 font-bold text-[14px] mb-3 border-b border-white/[0.06] pb-2 uppercase tracking-wider">{data.subject}</p>
        <div className="flex justify-between items-center gap-4 mb-2">
          <span className="text-[11px] text-text-3 uppercase tracking-wide font-semibold">Win Rate</span>
          <span className="text-[13px] font-bold text-[#00FFB2]">{data.A.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center gap-4 mb-2">
          <span className="text-[11px] text-text-3 uppercase tracking-wide font-semibold">Profit Factor</span>
          <span className="text-[13px] font-bold text-[#B259FF]">{data.rawPF.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[11px] text-text-3 uppercase tracking-wide font-semibold">Net P&L</span>
          <span className={`text-[13px] font-extrabold ${data.pnl >= 0 ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
            {data.pnl >= 0 ? '+' : '-'}${Math.abs(data.pnl).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
          </span>
        </div>
      </div>
    );
  }
  return null;
};
