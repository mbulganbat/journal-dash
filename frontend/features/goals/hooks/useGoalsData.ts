import { useMemo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import { selectActiveTrades } from '../../../lib/selectActiveTrades';
import { getNetPnL, getWinRate, getProfitFactor, getAvgRR } from '../../../data/mockTrades';

export type GoalStatus = 'achieved' | 'onTrack' | 'atRisk' | 'overdue';

export const useGoalsData = () => {
  const { goals, trades, accounts, selectedAccountId, setups } = useAppContext();

  const activeTrades = useMemo(
    () => selectActiveTrades(trades, accounts, selectedAccountId),
    [trades, accounts, selectedAccountId]
  );

  // Same "specific account vs. all non-challenge accounts" rule used
  // everywhere else (Dashboard, Reports, etc.) — single source of truth.
  const scopedInitialBalance = useMemo(() => {
    if (!selectedAccountId) {
      return accounts.filter(a => !a.isChallenge).reduce((sum, a) => sum + a.initialBalance, 0);
    }
    return accounts.find(a => a.id === selectedAccountId)?.initialBalance || 0;
  }, [accounts, selectedAccountId]);

  const goalStats = useMemo(() => {
    const now = new Date();

    return goals.map(goal => {
      // If the goal is scoped to a Setup, only that setup's trades count
      // toward the metric — everything else stays scoped to the active account.
      const scopedSetup = goal.setupId ? setups.find(s => s.id === goal.setupId) : undefined;
      const metricTrades = scopedSetup ? activeTrades.filter(t => t.setup === scopedSetup.name) : activeTrades;

      let current: number;
      switch (goal.metric) {
        case 'netPnl':
          current = getNetPnL(metricTrades);
          break;
        case 'winRate':
          current = getWinRate(metricTrades);
          break;
        case 'totalTrades':
          current = metricTrades.length;
          break;
        case 'profitFactor':
          current = getProfitFactor(metricTrades);
          break;
        case 'avgRR':
          current = getAvgRR(metricTrades);
          break;
        case 'accountBalance':
          current = scopedInitialBalance + getNetPnL(activeTrades);
          break;
        default:
          current = goal.current;
      }

      const progressPct = goal.target > 0 ? Math.min((current / goal.target) * 100, 100) : 0;
      const isAchieved = current >= goal.target;
      const daysLeft = differenceInCalendarDays(new Date(goal.deadline), now);
      const isOverdue = !isAchieved && daysLeft < 0;

      // Pace check: how far through the goal's total window are we, vs. how
      // far through the progress are we? Falling too far behind pace = at risk.
      const totalDays = differenceInCalendarDays(new Date(goal.deadline), new Date(goal.createdAt));
      const elapsedDays = differenceInCalendarDays(now, new Date(goal.createdAt));
      const expectedPct = totalDays > 0 ? Math.min((elapsedDays / totalDays) * 100, 100) : 100;

      let status: GoalStatus;
      if (isAchieved) status = 'achieved';
      else if (isOverdue) status = 'overdue';
      else if (progressPct >= expectedPct - 10) status = 'onTrack';
      else status = 'atRisk';

      return { ...goal, current, progressPct, status, daysLeft, isAchieved, setupName: scopedSetup?.name };
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [goals, activeTrades, scopedInitialBalance, setups]);

  const totalGoals = goalStats.length;
  const achievedCount = goalStats.filter(g => g.status === 'achieved').length;
  const needsAttentionCount = goalStats.filter(g => g.status === 'atRisk' || g.status === 'overdue').length;
  const avgProgress = totalGoals > 0
    ? Math.round(goalStats.reduce((sum, g) => sum + g.progressPct, 0) / totalGoals)
    : 0;

  return { goalStats, totalGoals, achievedCount, needsAttentionCount, avgProgress };
};

export type GoalsData = ReturnType<typeof useGoalsData>;
export type GoalStat = GoalsData['goalStats'][number];
