import { useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { selectActiveTrades } from '../../../lib/selectActiveTrades';
import { getNetPnL } from '../../../data/mockTrades';

export const useSetupsData = () => {
  const { setups, trades, accounts, selectedAccountId } = useAppContext();

  const activeTrades = useMemo(
    () => selectActiveTrades(trades, accounts, selectedAccountId),
    [trades, accounts, selectedAccountId]
  );

  const setupStats = useMemo(() => {
    return setups.map(setup => {
      const setupTrades = activeTrades.filter(t => t.setup === setup.name);
      const resolved = setupTrades.filter(t => t.result !== 'breakeven');
      const wins = resolved.filter(t => t.result === 'win');

      const netPnl = getNetPnL(setupTrades);
      const winRate = resolved.length > 0 ? Math.round((wins.length / resolved.length) * 100) : 0;
      const avgRR = resolved.length > 0 ? resolved.reduce((sum, t) => sum + t.rr, 0) / resolved.length : 0;

      const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
      const grossLoss = Math.abs(resolved.filter(t => t.result === 'loss').reduce((sum, t) => sum + t.pnl, 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 0);

      return {
        ...setup,
        tradeCount: setupTrades.length,
        winRate,
        netPnl,
        avgRR,
        profitFactor
      };
    }).sort((a, b) => b.netPnl - a.netPnl);
  }, [setups, activeTrades]);

  const tradedSetups = setupStats.filter(s => s.tradeCount > 0);

  const bestSetup = tradedSetups.length > 0
    ? tradedSetups.reduce((best, s) => (s.netPnl > best.netPnl ? s : best), tradedSetups[0])
    : null;

  const mostTraded = tradedSetups.length > 0
    ? tradedSetups.reduce((most, s) => (s.tradeCount > most.tradeCount ? s : most), tradedSetups[0])
    : null;

  const avgWinRate = tradedSetups.length > 0
    ? Math.round(tradedSetups.reduce((sum, s) => sum + s.winRate, 0) / tradedSetups.length)
    : 0;

  return {
    setupStats,
    totalSetups: setups.length,
    bestSetup,
    mostTraded,
    avgWinRate
  };
};

export type SetupsData = ReturnType<typeof useSetupsData>;
export type SetupStat = SetupsData['setupStats'][number];
