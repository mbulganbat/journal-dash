import { Trade, Account, HeatmapDay, Setup, Goal } from '../types';
import { subDays, startOfYear, subMonths, addMonths, format, parseISO, startOfWeek, isSameDay, eachDayOfInterval } from 'date-fns';

export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Main Funded',
    type: 'Funded',
    broker: 'FTMO',
    platform: 'MT5',
    currency: 'USD',
    initialBalance: 100000,
    isChallenge: false,
    profitTarget: 10,
    maxDailyDrawdown: 5,
    maxTotalDrawdown: 10
  },
  {
    id: 'acc-2',
    name: 'Practice Demo',
    type: 'Demo',
    broker: 'IC Markets',
    platform: 'MT5',
    currency: 'USD',
    initialBalance: 10000,
    isChallenge: false
  }
];

// Default playbook seeded on first load. Names match the setup labels used
// by generateMockTrades() below so stats aren't empty out of the box.
export const mockSetups: Setup[] = [
  {
    id: 'setup-bms-fvg',
    name: 'BMS+FVG',
    description: 'Break of market structure confirmed by a fair value gap retracement entry.',
    rules: ['Clear break of structure on HTF', 'FVG formed after the break', 'Entry on FVG retest', 'Confirmation candle close'],
    color: 'em',
    icon: 'IconChartCandle'
  },
  {
    id: 'setup-order-block',
    name: 'Order Block',
    description: 'Institutional order block reaction entries at key supply/demand zones.',
    rules: ['Untested order block', 'Aligned with HTF bias', 'Liquidity swept before entry', 'Tight invalidation below/above block'],
    color: 'blue',
    icon: 'IconTarget'
  },
  {
    id: 'setup-cisd',
    name: 'CISD',
    description: 'Change in state of delivery — a shift from bearish to bullish delivery, or vice versa.',
    rules: ['Liquidity sweep first', 'Delivery shift confirmed', 'Entry on the retracement', 'Risk defined at the shift point'],
    color: 'purple',
    icon: 'IconWaveSquare'
  },
  {
    id: 'setup-liquidity',
    name: 'Liquidity',
    description: 'Fade or continuation entries built around swept liquidity pools.',
    rules: ['Obvious liquidity pool (EQH/EQL)', 'Sweep with rejection wick', 'Momentum shift after the sweep', 'Confirmation on LTF'],
    color: 'warning',
    icon: 'IconCrosshair'
  },
  {
    id: 'setup-other',
    name: 'Other',
    description: "Discretionary setups that don't fit a defined playbook rule set yet.",
    rules: ['Document the idea in the notes', 'Review after the trade closes'],
    color: 'blue',
    icon: 'IconSparkles'
  }
];

// Default goals seeded on first load. Deadlines are relative to "now" so they
// stay meaningful however long after this file first ships.
const seededAt = new Date().toISOString();
export const mockGoals: Goal[] = [
  {
    id: 'goal-net-profit',
    title: 'Reach $50,000 Net Profit',
    metric: 'netPnl',
    target: 50000,
    current: 0,
    unit: '$',
    deadline: addMonths(new Date(), 5).toISOString(),
    createdAt: seededAt,
    color: 'em',
    icon: 'IconCoin'
  },
  {
    id: 'goal-win-rate',
    title: 'Hit 75% Win Rate',
    metric: 'winRate',
    target: 75,
    current: 0,
    unit: '%',
    deadline: addMonths(new Date(), 2).toISOString(),
    createdAt: seededAt,
    color: 'blue',
    icon: 'IconTarget'
  },
  {
    id: 'goal-total-trades',
    title: 'Log 100 Trades',
    metric: 'totalTrades',
    target: 100,
    current: 0,
    unit: 'trades',
    deadline: addMonths(new Date(), 4).toISOString(),
    createdAt: seededAt,
    color: 'purple',
    icon: 'IconChartLine'
  },
  {
    id: 'goal-profit-factor',
    title: 'Maintain 3.0+ Profit Factor',
    metric: 'profitFactor',
    target: 3,
    current: 0,
    unit: '×',
    deadline: addMonths(new Date(), 3).toISOString(),
    createdAt: seededAt,
    color: 'warning',
    icon: 'IconTrophy'
  },
  {
    id: 'goal-backtesting',
    title: 'Backtest 20 Hours',
    metric: 'manual',
    target: 20,
    current: 6,
    unit: 'hrs',
    deadline: addMonths(new Date(), 1).toISOString(),
    createdAt: seededAt,
    color: 'blue',
    icon: 'IconRocket'
  }
];

function generateMockTrades(): Trade[] {
  const trades: Trade[] = [];
  
  const sessions = [
    ...Array(18).fill('London'),
    ...Array(14).fill('NY AM'),
    ...Array(8).fill('NY PM'),
    ...Array(5).fill('Asian'),
    ...Array(5).fill('Overlap')
  ];
  
  const pairs = [
    ...Array(20).fill('XAUUSD'),
    ...Array(12).fill('EURUSD'),
    ...Array(8).fill('GBPUSD'),
    ...Array(6).fill('USDJPY'),
    ...Array(4).fill('GBPJPY')
  ];
  
  const setups = [
    ...Array(18).fill('BMS+FVG'),
    ...Array(12).fill('Order Block'),
    ...Array(11).fill('CISD'),
    ...Array(9).fill('Liquidity')
  ];
  
  const emotions = [
    ...Array(12).fill('Focused'),
    ...Array(8).fill('Patient'),
    ...Array(22).fill('Neutral'),
    ...Array(5).fill('Rushed'),
    ...Array(3).fill('FOMO')
  ];

  const results = [
    ...Array(35).fill('win'),
    ...Array(12).fill('loss'),
    ...Array(3).fill('breakeven')
  ];

  // Seeded PRNG (mulberry32) — gives a stable sequence across reloads.
  let prngState = 0x9e3779b9;
  const rand = () => {
    prngState |= 0;
    prngState = (prngState + 0x6d2b79f5) | 0;
    let t = Math.imul(prngState ^ (prngState >>> 15), 1 | prngState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Deterministic Fisher-Yates shuffle (in place, stable across reloads).
  const shuffle = (arr: any[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  
  shuffle(sessions);
  shuffle(pairs);
  shuffle(setups);
  shuffle(emotions);
  shuffle(results);

  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const result = results[i];
    const isWin = result === 'win';
    const isBE = result === 'breakeven';
    
    // Pseudo-random values based on index for consistency
    const randomFactor = Math.abs(Math.sin(i + 1));
    
    let pnl = 0;
    if (isWin) {
      pnl = Math.floor(randomFactor * (1800 - 150 + 1)) + 150;
    } else if (!isBE) {
      pnl = -(Math.floor(randomFactor * (480 - 80 + 1)) + 80);
    }
      
    const rr = isWin
      ? Number((randomFactor * (4.2 - 1.5) + 1.5).toFixed(2))
      : isBE ? 0 : Number((randomFactor * (0.9 - 0.5) + 0.5).toFixed(2));

    const direction = randomFactor > 0.5 ? 'long' : 'short';
    const entry = direction === 'long' ? 100 : 110;
    const exit = direction === 'long' ? entry + (pnl/1000) : entry - (pnl/1000);
    const sl = direction === 'long' ? entry - ((exit-entry)/(rr || 1)) : entry + ((entry-exit)/(rr || 1));

    // Spread dates over last 90 days
    const daysAgo = Math.floor(randomFactor * 90);
    const date = subDays(now, daysAgo).toISOString();

    trades.push({
      id: `trd_${i}_${Math.floor(rand() * 1e9).toString(36)}`,
      accountId: i < 35 ? 'acc-1' : 'acc-2',
      pair: pairs[i],
      date,
      session: sessions[i] as Trade['session'],
      direction,
      entry: Number(entry.toFixed(5)),
      exit: Number(exit.toFixed(5)),
      sl: Number(sl.toFixed(5)),
      tp: Number((direction === 'long' ? entry + ((entry-sl)*3) : entry - ((sl-entry)*3)).toFixed(5)),
      lotSize: 1,
      pnl,
      rr,
      setup: setups[i],
      emotion: emotions[i] as Trade['emotion'],
      notes: "Saw the setup form perfectly on the 15m timeframe. Executed according to plan without hesitation.",
      result: result as 'win' | 'loss' | 'breakeven',
      mistakes: isWin ? [] : ["Entered too early", "Didn't wait for confirmation"],
      lessons: ["Always wait for the candle to close", "Trust the higher timeframe bias"],
      checklistScore: Math.floor(randomFactor * 100),
      screenshotUrl: null
    });
  }

  return trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const mockTrades = generateMockTrades();

// Multi-Account Helpers
export const filterByAccount = (trades: Trade[], accountId: string | null): Trade[] => {
  if (!accountId) return trades;
  return trades.filter(t => t.accountId === accountId);
};

export const getAccountBalance = (account: Account, trades: Trade[]): number => {
  const accTrades = filterByAccount(trades, account.id);
  return account.initialBalance + getNetPnL(accTrades);
};

export const getFundedProgress = (account: Account, trades: Trade[]) => {
  const accTrades = filterByAccount(trades, account.id);
  const netPnl = getNetPnL(accTrades);
  const profitPct = (netPnl / account.initialBalance) * 100;

  // Real drawdowns derived from the account equity curve (chronological).
  const sorted = [...accTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let equity = account.initialBalance;
  let peak = account.initialBalance;
  let totalDrawdownPct = 0; // worst peak-to-trough drawdown over the whole curve
  const dailyPnl = new Map<string, number>(); // day -> net pnl

  sorted.forEach(t => {
    equity += t.pnl;
    if (equity > peak) peak = equity;
    const ddPct = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
    if (ddPct > totalDrawdownPct) totalDrawdownPct = ddPct;

    const day = t.date.split('T')[0];
    dailyPnl.set(day, (dailyPnl.get(day) || 0) + t.pnl);
  });

  // Daily drawdown: worst single-day loss relative to the balance at that day's start.
  let dailyDrawdownPct = 0;
  let dayStartEquity = account.initialBalance;
  [...dailyPnl.keys()].sort().forEach(day => {
    const dayPnl = dailyPnl.get(day)!;
    const lossPct = dayStartEquity > 0 ? (Math.max(0, -dayPnl) / dayStartEquity) * 100 : 0;
    if (lossPct > dailyDrawdownPct) dailyDrawdownPct = lossPct;
    dayStartEquity += dayPnl;
  });

  const daysTraded = dailyPnl.size;

  let status: 'On Track' | 'At Risk' | 'Passed' | 'Blown' = 'On Track';
  
  if (account.profitTarget && profitPct >= account.profitTarget) {
    status = 'Passed';
  } else if (account.maxTotalDrawdown && totalDrawdownPct >= account.maxTotalDrawdown) {
    status = 'Blown';
  } else if (account.maxDailyDrawdown && dailyDrawdownPct >= account.maxDailyDrawdown) {
    status = 'Blown';
  } else if (account.maxTotalDrawdown && totalDrawdownPct > account.maxTotalDrawdown * 0.8) {
    status = 'At Risk';
  }

  return { profitPct, dailyDrawdownPct, totalDrawdownPct, daysTraded, status };
};

export const getTradingHeatmap = (trades: Trade[]): HeatmapDay[] => {
  const today = new Date();
  const startDate = subDays(today, 364); // 365 days total
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  return days.map(date => {
    const dayTrades = trades.filter(t => isSameDay(new Date(t.date), date));
    const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    return { date, pnl, count: dayTrades.length };
  });
};

// Pure Functions for Statistics
export const getNetPnL = (trades: Trade[]): number => trades.reduce((sum, t) => sum + t.pnl, 0);

export const getWinRate = (trades: Trade[]): number => {
  const resolvedTrades = trades.filter(t => t.result !== 'breakeven');
  if (resolvedTrades.length === 0) return 0;
  const wins = resolvedTrades.filter(t => t.result === 'win').length;
  return Math.round((wins / resolvedTrades.length) * 100);
};

export const getProfitFactor = (trades: Trade[]): number => {
  const grossProfit = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  if (grossLoss === 0) return grossProfit > 0 ? 99 : 0;
  return Number((grossProfit / grossLoss).toFixed(2));
};

export const getExpectancy = (trades: Trade[]): number => {
  const resolvedTrades = trades.filter(t => t.result !== 'breakeven');
  if (resolvedTrades.length === 0) return 0;
  const wins = resolvedTrades.filter(t => t.result === 'win');
  const losses = resolvedTrades.filter(t => t.result === 'loss');
  
  const winRate = wins.length / resolvedTrades.length;
  const lossRate = losses.length / resolvedTrades.length;
  
  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0)) / losses.length : 0;
  
  return Number(((winRate * avgWin) - (lossRate * avgLoss)).toFixed(2));
};

export const getAvgRR = (trades: Trade[]): number => {
  const resolvedTrades = trades.filter(t => t.result !== 'breakeven');
  if (resolvedTrades.length === 0) return 0;
  return Number((resolvedTrades.reduce((sum, t) => sum + t.rr, 0) / resolvedTrades.length).toFixed(2));
};

export const getAvgWin = (trades: Trade[]): number => {
  const wins = trades.filter(t => t.result === 'win');
  if (wins.length === 0) return 0;
  return wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length;
};

export const getAvgLoss = (trades: Trade[]): number => {
  const losses = trades.filter(t => t.result === 'loss');
  if (losses.length === 0) return 0;
  return Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0)) / losses.length;
};

export const getActiveDays = (trades: Trade[]): number => {
  const uniqueDays = new Set(trades.map(t => t.date.split('T')[0]));
  return uniqueDays.size;
};

export const groupBySession = (trades: Trade[]): Record<string, Trade[]> => {
  return trades.reduce((acc, trade) => {
    if (!acc[trade.session]) acc[trade.session] = [];
    acc[trade.session].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);
};

export const groupBySetup = (trades: Trade[]): Record<string, Trade[]> => {
  return trades.reduce((acc, trade) => {
    if (!acc[trade.setup]) acc[trade.setup] = [];
    acc[trade.setup].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);
};

export const groupByWeek = (trades: Trade[]): Record<string, { wins: number; losses: number; pnl: number }> => {
  const weeks: Record<string, { wins: number; losses: number; pnl: number }> = {};
  trades.forEach(trade => {
    const date = parseISO(trade.date);
    const weekStart = format(startOfWeek(date), 'MMM dd');
    if (!weeks[weekStart]) weeks[weekStart] = { wins: 0, losses: 0, pnl: 0 };
    
    if (trade.result === 'win') weeks[weekStart].wins++;
    else if (trade.result === 'loss') weeks[weekStart].losses++;
    
    weeks[weekStart].pnl += trade.pnl;
  });
  return weeks;
};

export const getEquityCurve = (trades: Trade[], initialBalance: number = 100000): { date: string; equity: number }[] => {
  let currentEquity = initialBalance;
  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return sorted.map(trade => {
    currentEquity += trade.pnl;
    return {
      date: trade.date,
      equity: currentEquity
    };
  });
};

export const filterByPeriod = (trades: Trade[], period: '1W' | '1M' | '3M' | 'YTD'): Trade[] => {
  const now = new Date();
  let cutoffDate: Date;
  
  switch (period) {
    case '1W': cutoffDate = subDays(now, 7); break;
    case '1M': cutoffDate = subMonths(now, 1); break;
    case '3M': cutoffDate = subMonths(now, 3); break;
    case 'YTD': cutoffDate = startOfYear(now); break;
    default: cutoffDate = subMonths(now, 1);
  }
  
  return trades.filter(t => new Date(t.date) >= cutoffDate);
};
