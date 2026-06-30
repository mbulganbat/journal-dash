import { useMemo } from 'react';
import { format, isSameDay, eachDayOfInterval, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { Trade } from '../../../types';
import { HeatmapCell } from '../types';

export const useHeatmapData = (trades: Trade[]) => {
  // 1. Dynamic Status Badges Calculations
  const { bestStreak, mostActiveDay, bestMonth, activeDays, netPnl } = useMemo(() => {
    let activeDaysCount = 0;
    let totalPnl = 0;

    const dailyPnL: Record<string, number> = {};
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const monthlyPnL: Record<string, number> = {};

    trades.forEach(t => {
      const d = t.date.split('T')[0];
      dailyPnL[d] = (dailyPnL[d] || 0) + t.pnl;
      dayOfWeekCounts[new Date(t.date).getDay()]++;

      const m = format(new Date(t.date), 'MMMM');
      monthlyPnL[m] = (monthlyPnL[m] || 0) + t.pnl;

      totalPnl += t.pnl;
    });

    activeDaysCount = Object.keys(dailyPnL).length;

    // Best Streak
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDays = Object.entries(dailyPnL).sort((a, b) => a[0].localeCompare(b[0]));
    sortedDays.forEach(([_, pnl]) => {
      if (pnl > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    // Most Active Day
    const days = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
    const maxIdx = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
    const activeDayStr = trades.length > 0 ? days[maxIdx] : "None";

    // Best Month
    let bestM = "None";
    let maxM = -Infinity;
    Object.entries(monthlyPnL).forEach(([m, pnl]) => {
      if (pnl > maxM) { maxM = pnl; bestM = m; }
    });

    return {
      bestStreak: maxStreak,
      mostActiveDay: activeDayStr,
      bestMonth: bestM,
      activeDays: activeDaysCount,
      netPnl: totalPnl
    };
  }, [trades]);

  // 2. Grid Math (365 Days / 53 Columns)
  const { columns, monthLabels, maxProfit, maxLoss } = useMemo(() => {
    const today = new Date();
    // Calendar year: Jan 1 to Dec 31 (snapped to full Mon-Sun weeks).
    const gridStart = startOfWeek(startOfYear(today), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfYear(today), { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const cols: HeatmapCell[][] = [];
    const mLabels: { colIndex: number, label: string }[] = [];
    let currentWeek: HeatmapCell[] = [];

    let maxP = 0;
    let maxL = 0;

    days.forEach((date) => {
      const dayTrades = trades.filter(t => isSameDay(new Date(t.date), date));
      const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
      const count = dayTrades.length;

      if (pnl > maxP) maxP = pnl;
      if (pnl < maxL) maxL = pnl;

      const emotions = dayTrades.map(t => t.emotion);
      const dominantEmotion = emotions.length > 0
        ? emotions.sort((a,b) => emotions.filter(v => v===a).length - emotions.filter(v => v===b).length).pop() || 'Neutral'
        : 'Neutral';

      currentWeek.push({
        date,
        pnl,
        count,
        isFuture: date > today,
        dominantEmotion
      });

      if (currentWeek.length === 7) {
        cols.push(currentWeek);

        // Check if this week contains the 1st of a month
        const firstDayOfMonth = currentWeek.find(d => d.date.getDate() === 1);
        if (firstDayOfMonth) {
          mLabels.push({ colIndex: cols.length - 1, label: format(firstDayOfMonth.date, 'MMM') });
        } else if (cols.length === 1) {
          // Always label the very first column
          mLabels.push({ colIndex: 0, label: format(currentWeek[0].date, 'MMM') });
        }

        currentWeek = [];
      }
    });

    return { columns: cols, monthLabels: mLabels, maxProfit: maxP || 1, maxLoss: Math.abs(maxL) || 1 };
  }, [trades]);

  return { bestStreak, mostActiveDay, bestMonth, activeDays, netPnl, columns, monthLabels, maxProfit, maxLoss };
};
