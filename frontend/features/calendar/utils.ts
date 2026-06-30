import React from 'react';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { derivePnl } from '../../lib/assetSpecs';
import { Trade } from '../../types';
import { AccountWithChallenge, MonthlyWeek, TradeWithExitDate, WeekStats } from './types';

// Use the authoritative stored P&L (written on save / outcome change) so the
// calendar agrees with every other screen. Fall back to deriving from prices
// only if the stored value is missing/corrupt.
export const calculateTradePnl = (trade: Trade): number => {
  if (Number.isFinite(trade.pnl)) return trade.pnl;
  return derivePnl(trade);
};

export const formatCurrency = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue > 0 ? '+' : safeValue < 0 ? '-' : '';
  return `${sign}$${Math.abs(safeValue).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const moneyClass = (value: number): string => {
  if (value > 0) return 'text-[#00FFB2]';
  if (value < 0) return 'text-[#FF5A5A]';
  return 'text-[#FFB800]';
};

export const privacyStyle = (privacyMode: boolean): React.CSSProperties =>
  privacyMode ? { filter: 'blur(6px)', userSelect: 'none' } : {};

export const isChallengeAccount = (account?: AccountWithChallenge): boolean => account?.isChallenge === true;

export const getTradeExitDate = (trade: Trade): Date => {
  const extendedTrade = trade as TradeWithExitDate;
  return new Date(extendedTrade.exitDate ?? trade.date);
};

export const buildMonthlyWeeks = (month: Date, trades: Trade[]): MonthlyWeek[] => {
  const viewedMonthStart = startOfMonth(month);
  const viewedMonthEnd = endOfMonth(month);
  const firstWeekStart = startOfWeek(viewedMonthStart, { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(viewedMonthEnd, { weekStartsOn: 1 });
  const totalWeeks = Math.round((lastWeekEnd.getTime() - firstWeekStart.getTime()) / 604800000);

  return Array.from({ length: totalWeeks }, (_, index) => {
    const weekStart = addDays(firstWeekStart, index * 7);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const pnl = trades
      .filter((trade) => isWithinInterval(getTradeExitDate(trade), { start: weekStart, end: weekEnd }))
      .reduce((sum, trade) => sum + calculateTradePnl(trade), 0);

    return {
      label: `Week ${index + 1}`,
      range: `${format(weekStart, 'MMM d')}-${format(weekEnd, 'd')}`,
      pnl
    };
  });
};

export const summarizeBest = (trades: Trade[], selector: (trade: Trade) => string): string => {
  const grouped = trades.reduce<Record<string, number>>((acc, trade) => {
    const key = selector(trade) || 'N/A';
    acc[key] = (acc[key] ?? 0) + calculateTradePnl(trade);
    return acc;
  }, {});

  const entries = Object.entries(grouped);
  if (entries.length === 0) return 'N/A';

  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
};

export const buildWeekStats = (weekStart: Date, trades: Trade[]): WeekStats => {
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
