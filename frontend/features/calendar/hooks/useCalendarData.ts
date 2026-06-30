import { useMemo } from 'react';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { Account, Trade } from '../../../types';
import { AccountOption, AccountWithChallenge, CalendarDay, MicroStats, OutcomeFilter } from '../types';
import {
  buildMonthlyWeeks,
  buildWeekStats,
  calculateTradePnl,
  formatCurrency,
  isChallengeAccount
} from '../utils';

interface Params {
  trades: Trade[];
  accounts: Account[];
  currentMonth: Date;
  outcomeFilter: OutcomeFilter;
  accountRoute: string;
  hoveredWeekStart: Date | null;
}

export const useCalendarData = ({
  trades,
  accounts,
  currentMonth,
  outcomeFilter,
  accountRoute,
  hoveredWeekStart
}: Params) => {
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

  const microStats = useMemo<MicroStats>(() => {
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
      profitFactor: Number.isFinite(profitFactor) ? profitFactor : 0,
      totalTrades: visibleTrades.length
    };
  }, [visibleTrades]);

  const monthlyWeeks = useMemo(() => buildMonthlyWeeks(currentMonth, visibleTrades), [currentMonth, visibleTrades]);

  const weekTone = weekStats.netPnl >= 0 ? '#00FFB2' : '#FF5A5A';
  const selectedAccountName = accountRoute === 'all'
    ? 'All Standard Accounts'
    : typedAccounts.find((account) => account.id === accountRoute)?.name ?? 'Selected Account';
  const weeklyNetPnlValue = formatCurrency(weekStats.netPnl);
  const accountOptions: AccountOption[] = [
    { id: 'all', label: 'All Standard Accounts' },
    ...typedAccounts.map((account) => ({
      id: account.id,
      label: `${account.name}${isChallengeAccount(account) ? ' Challenge' : ''}`
    }))
  ];

  return {
    typedAccounts,
    visibleTrades,
    monthLabel,
    calendarDays,
    weekStats,
    microStats,
    monthlyWeeks,
    weekTone,
    selectedAccountName,
    weeklyNetPnlValue,
    accountOptions
  };
};
