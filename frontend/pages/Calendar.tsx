import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconActivity,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconEye,
  IconEyeOff,
  IconFilter,
  IconTrendingDown,
  IconTrendingUp,
  IconX
} from '@tabler/icons-react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { fadeUp, stagger } from '../lib/animations';
import { derivePnl } from '../lib/assetSpecs';
import { Account, Trade } from '../types';

type OutcomeFilter = 'all' | 'win' | 'loss';
type AccountWithChallenge = Account & { isChallenge?: boolean };
type StatBadge = { label: string; value: string; icon: React.ElementType; privateValue?: boolean };
type LegendItem = { label: string; description: string; dotClass: string };
type TradeWithExitDate = Trade & { exitDate?: string };
type MonthlyWeek = { label: string; pnl: number };

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  trades: Trade[];
  pnl: number;
}

interface WeekStats {
  start: Date;
  end: Date;
  trades: Trade[];
  netPnl: number;
  wins: number;
  losses: number;
  winLossRatio: string;
  bestAsset: string;
  bestSession: string;
}

const outcomeFilters: { label: string; value: OutcomeFilter }[] = [
  { label: 'All Trades', value: 'all' },
  { label: 'Wins Only', value: 'win' },
  { label: 'Losses Only', value: 'loss' }
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Use the authoritative stored P&L (written on save / outcome change) so the
// calendar agrees with every other screen. Fall back to deriving from prices
// only if the stored value is missing/corrupt.
const calculateTradePnl = (trade: Trade): number => {
  if (Number.isFinite(trade.pnl)) return trade.pnl;
  return derivePnl(trade);
};

const formatCurrency = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue > 0 ? '+' : safeValue < 0 ? '-' : '';
  return `${sign}$${Math.abs(safeValue).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const moneyClass = (value: number): string => {
  if (value > 0) return 'text-[#00FFB2]';
  if (value < 0) return 'text-[#FF5A5A]';
  return 'text-[#FFB800]';
};

const privacyStyle = (privacyMode: boolean): React.CSSProperties =>
  privacyMode ? { filter: 'blur(6px)', userSelect: 'none' } : {};

const isChallengeAccount = (account?: AccountWithChallenge): boolean => account?.isChallenge === true;

const getCurrencyFontSize = (value: string): string => {
  if (value.length > 10) return 'text-xl';
  if (value.length > 7) return 'text-2xl';
  return 'text-4xl xl:text-[42px]';
};

const getTradeExitDate = (trade: Trade): Date => {
  const extendedTrade = trade as TradeWithExitDate;
  return new Date(extendedTrade.exitDate ?? trade.date);
};

const buildMonthlyWeeks = (month: Date, trades: Trade[]): MonthlyWeek[] => {
  const viewedMonthStart = startOfMonth(month);
  const viewedMonthEnd = endOfMonth(month);
  const firstWeekStart = startOfWeek(viewedMonthStart, { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(viewedMonthEnd, { weekStartsOn: 1 });
  const totalWeeks = Math.round((lastWeekEnd.getTime() - firstWeekStart.getTime()) / 604800000) + 1;

  return Array.from({ length: totalWeeks }, (_, index) => {
    const weekStart = addDays(firstWeekStart, index * 7);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const pnl = trades
      .filter((trade) => isWithinInterval(getTradeExitDate(trade), { start: weekStart, end: weekEnd }))
      .reduce((sum, trade) => sum + calculateTradePnl(trade), 0);

    return {
      label: `${format(weekStart, 'MMM d')}-${format(weekEnd, 'd')}`,
      pnl
    };
  });
};

const summarizeBest = (trades: Trade[], selector: (trade: Trade) => string): string => {
  const grouped = trades.reduce<Record<string, number>>((acc, trade) => {
    const key = selector(trade) || 'N/A';
    acc[key] = (acc[key] ?? 0) + calculateTradePnl(trade);
    return acc;
  }, {});

  const entries = Object.entries(grouped);
  if (entries.length === 0) return 'N/A';

  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
};

const buildWeekStats = (weekStart: Date, trades: Trade[]): WeekStats => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekTrades = trades.filter((trade) => {
    const tradeDate = new Date(trade.date);
    return isWithinInterval(tradeDate, { start: weekStart, end: weekEnd });
  });
  const wins = weekTrades.filter((trade) => trade.result === 'win').length;
  const losses = weekTrades.filter((trade) => trade.result === 'loss').length;
  const netPnl = weekTrades.reduce((sum, trade) => sum + calculateTradePnl(trade), 0);

  return {
    start: weekStart,
    end: weekEnd,
    trades: weekTrades,
    netPnl,
    wins,
    losses,
    winLossRatio: `${wins}:${losses}`,
    bestAsset: summarizeBest(weekTrades, (trade) => trade.pair),
    bestSession: summarizeBest(weekTrades, (trade) => trade.session),
  };
};

export const Calendar = () => {
  const { trades, accounts, selectedAccountId } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [accountRoute, setAccountRoute] = useState<string>(() => selectedAccountId ?? 'all');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [hoveredWeekStart, setHoveredWeekStart] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const typedAccounts = accounts as AccountWithChallenge[];

  const visibleTrades = useMemo(() => {
    const standardAccountIds = new Set(
      typedAccounts.filter((account) => !isChallengeAccount(account)).map((account) => account.id)
    );

    const routedTrades = accountRoute === 'all'
      ? trades.filter((trade) => standardAccountIds.has(trade.accountId))
      : trades.filter((trade) => trade.accountId === accountRoute);

    if (outcomeFilter === 'all') return routedTrades;
    return routedTrades.filter((trade) => trade.result === outcomeFilter);
  }, [accountRoute, outcomeFilter, trades, typedAccounts]);

  const monthLabel = format(currentMonth, 'MMMM yyyy');
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const matrixStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const matrixEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const totalDays = Math.round((matrixEnd.getTime() - matrixStart.getTime()) / 86400000) + 1;

    return Array.from({ length: totalDays }, (_, index) => {
      const date = addDays(matrixStart, index);
      const dayTrades = visibleTrades.filter((trade) => isSameDay(new Date(trade.date), date));
      return {
        date,
        inMonth: isSameMonth(date, currentMonth),
        trades: dayTrades,
        pnl: dayTrades.reduce((sum, trade) => sum + calculateTradePnl(trade), 0)
      };
    });
  }, [currentMonth, matrixEnd, matrixStart, visibleTrades]);

  const selectedWeekStart = hoveredWeekStart ?? startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStats = useMemo(() => buildWeekStats(selectedWeekStart, visibleTrades), [selectedWeekStart, visibleTrades]);

  const microStats = useMemo(() => {
    const activeDays = new Set(visibleTrades.map((trade) => format(new Date(trade.date), 'yyyy-MM-dd'))).size;
    const resolvedTrades = visibleTrades.filter((trade) => trade.result !== 'breakeven');
    const wins = resolvedTrades.filter((trade) => trade.result === 'win').length;
    const winRate = resolvedTrades.length > 0 ? Math.round((wins / (resolvedTrades.length || 1)) * 100) : 0;
    const grossProfit = visibleTrades
      .map(calculateTradePnl)
      .filter((value) => value > 0)
      .reduce((sum, value) => sum + value, 0);
    const grossLoss = Math.abs(
      visibleTrades
        .map(calculateTradePnl)
        .filter((value) => value < 0)
        .reduce((sum, value) => sum + value, 0)
    );
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;

    return {
      activeDays,
      winRate,
      profitFactor: Number.isFinite(profitFactor) ? profitFactor : 0
    };
  }, [visibleTrades]);

  const monthlyWeeks = useMemo(() => buildMonthlyWeeks(currentMonth, visibleTrades), [currentMonth, visibleTrades]);

  const weekTone = weekStats.netPnl >= 0 ? '#00FFB2' : '#FF5A5A';
  const selectedAccountName = accountRoute === 'all'
    ? 'All Standard Accounts'
    : typedAccounts.find((account) => account.id === accountRoute)?.name ?? 'Selected Account';
  const weeklyNetPnlValue = formatCurrency(weekStats.netPnl);
  const weeklyNetPnlFontSize = getCurrencyFontSize(weeklyNetPnlValue);
  const accountOptions = [
    { id: 'all', label: 'All Standard Accounts' },
    ...typedAccounts.map((account) => ({
      id: account.id,
      label: `${account.name}${isChallengeAccount(account) ? ' Challenge' : ''}`
    }))
  ];

  return (
    <motion.div
      key={`${accountRoute}-${format(currentMonth, 'yyyy-MM')}`}
      variants={stagger}
      initial="hidden"
      animate="show"
      className="p-6 md:p-9 pb-20 w-full min-w-0"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full min-w-0 items-start">
        <motion.section variants={fadeUp} className="xl:col-span-9 min-w-0">
          <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-[20px] p-5 md:p-6 overflow-hidden relative">
            <div className="absolute -top-24 right-12 h-48 w-48 rounded-full bg-[#00FFB2]/[0.05] blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-11 w-11 rounded-[12px] bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex items-center justify-center">
                    <IconCalendar size={22} stroke={2.4} className="text-[#00FFB2]" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-text-3 font-bold">Performance Calendar</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-1">{monthLabel}</h1>
                  </div>
                </div>
                <p className="text-sm text-text-2 max-w-xl">
                  {selectedAccountName} routed through closed executions with challenge accounts isolated from consolidated totals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonth((value) => subMonths(value, 1))}
                  className="h-10 w-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] text-text-2 hover:text-text-1 hover:bg-white/[0.08] transition-colors flex items-center justify-center"
                  aria-label="Previous month"
                >
                  <IconChevronLeft size={19} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date())}
                  className="h-10 px-4 rounded-[12px] bg-[#16161A] border border-white/[0.08] text-xs font-bold uppercase tracking-[0.18em] text-text-2 hover:text-[#00FFB2] transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
                  className="h-10 w-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] text-text-2 hover:text-text-1 hover:bg-white/[0.08] transition-colors flex items-center justify-center"
                  aria-label="Next month"
                >
                  <IconChevronRight size={19} />
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-3 font-bold mr-1">
                  <IconFilter size={15} />
                  Filter Hub
                </span>
                {outcomeFilters.map((filter) => {
                  const active = outcomeFilter === filter.value;
                  return (
                    <button
                      type="button"
                      key={filter.value}
                      onClick={() => setOutcomeFilter(filter.value)}
                      className={`h-10 px-4 rounded-full border text-xs font-bold transition-all ${
                        active
                          ? 'bg-[#00FFB2]/10 text-[#00FFB2] border-[#00FFB2]/30 shadow-[0_0_18px_rgba(0,255,178,0.08)]'
                          : 'bg-white/[0.03] text-text-2 border-white/[0.08] hover:bg-white/[0.06] hover:text-text-1'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative z-[100] min-w-[230px]">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((value) => !value)}
                    className="h-11 w-full rounded-[12px] bg-[#16161A] border border-white/[0.08] px-4 text-sm text-text-1 outline-none hover:border-white/[0.14] focus:border-[#00FFB2]/40 transition-colors flex items-center justify-between gap-3"
                    aria-haspopup="listbox"
                    aria-expanded={accountMenuOpen}
                  >
                    <span className="truncate">{selectedAccountName}</span>
                    <IconChevronDown
                      size={17}
                      className={`text-text-3 shrink-0 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {accountMenuOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-[9999] bg-[#111318] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[220px] w-full"
                        role="listbox"
                      >
                        {accountOptions.map((option) => {
                          const active = accountRoute === option.id;
                          return (
                            <button
                              type="button"
                              key={option.id}
                              onClick={() => {
                                setAccountRoute(option.id);
                                setAccountMenuOpen(false);
                              }}
                              className={`w-full ${
                                active
                                  ? 'px-4 py-3 text-sm text-[#00FFB2] bg-[#00FFB2]/10 font-medium flex items-center gap-2'
                                  : 'px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors flex items-center gap-2'
                              }`}
                              role="option"
                              aria-selected={active}
                            >
                              <span className="truncate">{option.label}</span>
                              {active ? <IconCheck size={16} className="text-[#00FFB2] ml-auto shrink-0" /> : null}
                            </button>
                          );
                        })}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacyMode((value) => !value)}
                  className={`h-11 px-4 rounded-[12px] border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                    privacyMode
                      ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/25'
                      : 'bg-white/[0.03] text-text-2 border-white/[0.08] hover:text-text-1'
                  }`}
                >
                  {privacyMode ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  Privacy
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-[10px] uppercase tracking-[0.2em] text-text-3 font-bold py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const hasTrades = day.trades.length > 0;
                  const weekStart = startOfWeek(day.date, { weekStartsOn: 1 });
                  const isPositive = day.pnl > 0;
                  const isNegative = day.pnl < 0;

                  return (
                    <motion.button
                      type="button"
                      key={day.date.toISOString()}
                      disabled={!day.inMonth || !hasTrades}
                      whileHover={hasTrades && day.inMonth ? { scale: 1.03, y: -2 } : undefined}
                      onMouseEnter={() => setHoveredWeekStart(weekStart)}
                      onFocus={() => setHoveredWeekStart(weekStart)}
                      onClick={() => hasTrades && day.inMonth && setSelectedDay(day)}
                      className={`min-h-[96px] md:min-h-[124px] rounded-[20px] border p-3 text-left transition-all relative overflow-hidden ${
                        day.inMonth
                          ? 'bg-[#080808] border-white/[0.06] hover:border-white/[0.14]'
                          : 'bg-white/[0.02] border-white/[0.04] opacity-20 cursor-not-allowed'
                      } ${hasTrades && day.inMonth ? 'cursor-pointer' : 'cursor-default'} ${
                        isPositive ? 'hover:shadow-[0_0_24px_rgba(0,255,178,0.10)]' : ''
                      } ${isNegative ? 'hover:shadow-[0_0_24px_rgba(255,90,90,0.10)]' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-bold ${day.inMonth ? 'text-text-1' : 'text-text-3'}`}>
                          {format(day.date, 'd')}
                        </span>
                        {hasTrades ? (
                          <span className="text-[10px] font-bold text-text-3 bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-0.5">
                            {day.trades.length}
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute left-3 right-3 bottom-3">
                        {hasTrades ? (
                          <>
                            <div className="flex items-center gap-1.5 mb-3 overflow-hidden">
                              {day.trades.slice(0, 8).map((trade) => (
                                <span
                                  key={trade.id}
                                  className={`h-1.5 flex-1 rounded-full min-w-[8px] ${
                                    trade.result === 'win'
                                      ? 'bg-[#00FFB2] shadow-[0_0_8px_rgba(0,255,178,0.45)]'
                                      : trade.result === 'loss'
                                        ? 'bg-[#FF5A5A]'
                                        : 'bg-[#FFB800]'
                                  }`}
                                />
                              ))}
                            </div>
                            <div
                              className={`text-xs font-extrabold ${moneyClass(day.pnl)}`}
                              style={privacyStyle(privacyMode)}
                            >
                              {formatCurrency(day.pnl)}
                            </div>
                          </>
                        ) : (
                          <div className="h-1.5 rounded-full bg-white/[0.04]" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.footer variants={fadeUp} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#0C0C0E] border border-white/[0.06] rounded-[20px] p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-3 font-bold mb-4">Status Legend</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { label: 'Profit', description: 'Glowing Emerald', dotClass: 'bg-[#00FFB2] shadow-[0_0_12px_rgba(0,255,178,0.5)]' },
                  { label: 'Loss', description: 'Crimson Red', dotClass: 'bg-[#FF5A5A]' },
                  { label: 'Break Even', description: 'Amber', dotClass: 'bg-[#FFB800]' },
                  { label: 'No Executions', description: 'Locked', dotClass: 'bg-white/[0.04] border border-white/[0.08]' }
                ] satisfies LegendItem[]).map(({ label, description, dotClass }) => (
                  <div key={label} className="flex items-center gap-3 rounded-[12px] bg-white/[0.025] border border-white/[0.05] p-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                    <div>
                      <p className="text-sm font-bold text-text-1">{label}</p>
                      <p className="text-xs text-text-3">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              {([
                { label: 'Active Trading Days', value: microStats.activeDays.toLocaleString(), icon: IconCalendar },
                { label: 'Win Rate', value: `${microStats.winRate}%`, icon: IconTrendingUp },
                { label: 'Profit Factor', value: microStats.profitFactor.toFixed(2), icon: IconActivity }
              ] satisfies StatBadge[]).map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-[#0C0C0E] border border-white/[0.06] rounded-[20px] p-4 min-w-0">
                  <Icon size={18} className="text-text-3 mb-3" />
                  <p className="text-[10px] uppercase tracking-[0.16em] text-text-3 font-bold truncate">{label}</p>
                  <p className="text-lg font-extrabold text-text-1 mt-1 truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </motion.footer>
        </motion.section>

        <motion.aside variants={fadeUp} className="xl:col-span-3 min-w-0 xl:sticky xl:top-24">
          <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-[20px] p-5 overflow-hidden relative">
            <div
              className="absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: `${weekTone}18` }}
            />

            <div className="relative z-10 flex flex-col gap-2 overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-3 font-bold">Week Window</p>
                  <p className="text-sm text-text-2 mt-1">
                    {format(weekStats.start, 'MMM d')} to {format(weekStats.end, 'MMM d')}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  {weekStats.netPnl >= 0 ? (
                    <IconTrendingUp size={20} className="text-[#00FFB2]" />
                  ) : (
                    <IconTrendingDown size={20} className="text-[#FF5A5A]" />
                  )}
                </div>
              </div>

              <div
                className="w-full h-[90px] flex flex-col justify-between p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/[0.06] overflow-hidden flex-shrink-0 min-w-0"
                style={{
                  borderColor: `${weekTone}33`,
                  background: `linear-gradient(145deg, ${weekTone}12, rgba(255,255,255,0.02))`,
                  boxShadow: `0 0 32px ${weekTone}12`
                }}
              >
                <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase truncate">Weekly Net P&L</p>
                <p
                  className={`${weeklyNetPnlFontSize} font-bold font-['JetBrains_Mono'] leading-tight truncate overflow-hidden transition-all min-w-0`}
                  style={{ color: weekTone, ...privacyStyle(privacyMode) }}
                  title={weeklyNetPnlValue}
                >
                  {weeklyNetPnlValue}
                </p>
              </div>

              <div className="flex flex-col gap-2 overflow-hidden">
                {([
                  { label: 'Total Executed Trades', value: weekStats.trades.length.toLocaleString(), icon: IconActivity },
                  { label: 'Win/Loss Ratio', value: weekStats.winLossRatio, icon: IconTrendingUp },
                  { label: 'Best-Performing Asset', value: weekStats.bestAsset, icon: IconCalendar },
                  { label: 'Best Trading Session', value: weekStats.bestSession, icon: IconClock }
                ] satisfies StatBadge[]).map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    title={`${label}: ${value}`}
                    className="w-full h-[90px] flex flex-col justify-between p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/[0.06] overflow-hidden flex-shrink-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={16} className="text-white/40 shrink-0" />
                      <p
                        title={label}
                        className="text-[10px] font-semibold tracking-widest text-white/40 uppercase truncate"
                      >
                        {label}
                      </p>
                    </div>
                    <p title={value} className="text-xl font-bold font-['JetBrains_Mono'] text-text-1 truncate">{value}</p>
                  </div>
                ))}
              </div>

              <div className="w-full rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/[0.06] p-4 flex-shrink-0 overflow-hidden">
                <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-3">
                  Monthly Overview
                </p>
                <div className="flex flex-col gap-2">
                  {monthlyWeeks.map((week, index) => (
                    <div key={`${week.label}-${index}`} className="flex items-center justify-between gap-3 min-w-0">
                      <span className="text-[11px] text-white/50 font-['JetBrains_Mono'] truncate">
                        {week.label}
                      </span>
                      <span
                        className={`text-[12px] font-bold font-['JetBrains_Mono'] truncate ${
                          week.pnl > 0
                            ? 'text-[#00FFB2]'
                            : week.pnl < 0
                              ? 'text-[#FF5A5A]'
                              : 'text-white/30'
                        }`}
                        style={privacyStyle(privacyMode)}
                        title={week.pnl === 0 ? 'No executions' : formatCurrency(week.pnl)}
                      >
                        {week.pnl === 0 ? '-' : formatCurrency(week.pnl)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>

      <AnimatePresence>
        {selectedDay ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-2xl max-h-[82vh] overflow-hidden rounded-[20px] backdrop-blur-md bg-[#16161A]/95 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="p-5 border-b border-white/[0.08] flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-3 font-bold">Execution Detail</p>
                  <h2 className="text-xl font-extrabold text-text-1 mt-1">{format(selectedDay.date, 'EEEE, MMMM d')}</h2>
                  <p className={`text-sm font-bold mt-2 ${moneyClass(selectedDay.pnl)}`} style={privacyStyle(privacyMode)}>
                    {formatCurrency(selectedDay.pnl)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="h-10 w-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] text-text-2 hover:text-text-1 hover:bg-white/[0.08] transition-colors flex items-center justify-center"
                  aria-label="Close day executions"
                >
                  <IconX size={20} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[62vh] space-y-3">
                {selectedDay.trades.map((trade) => {
                  const pnl = calculateTradePnl(trade);
                  return (
                    <div key={trade.id} className="rounded-[16px] bg-[#0C0C0E] border border-white/[0.06] p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-extrabold text-text-1">{trade.pair}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em] ${
                              trade.direction === 'long' ? 'bg-[#00FFB2]/10 text-[#00FFB2]' : 'bg-[#FF5A5A]/10 text-[#FF5A5A]'
                            }`}>
                              {trade.direction === 'long' ? 'Buy' : 'Sell'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/[0.04] border border-white/[0.08] text-text-2">
                              {trade.session}
                            </span>
                          </div>
                          <p className="text-xs text-text-3 mt-2">
                            Entry {trade.entry ?? 0} / SL {trade.sl ?? 0} / TP {trade.tp ?? 0}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className={`text-lg font-black ${moneyClass(pnl)}`} style={privacyStyle(privacyMode)}>
                            {formatCurrency(pnl)}
                          </p>
                          <p className="text-xs text-text-3 mt-1">{trade.result.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};
