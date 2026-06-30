import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { stagger, fadeUp } from '../../lib/animations';
import { TradingActivityHeatmap } from '../heatmap/TradingActivityHeatmap';
import { Period } from './types';
import { useDashboardData } from './hooks/useDashboardData';
import { MetricsGrid } from './components/MetricsGrid';
import { WeekStrip } from './components/WeekStrip';
import { EquityCurveCard } from './components/EquityCurveCard';
import { WinRateCard } from './components/WinRateCard';
import { EmotionsCard } from './components/EmotionsCard';
import { SessionPnlCard } from './components/SessionPnlCard';
import { TopSetupsCard } from './components/TopSetupsCard';
import { RecentTradesCard } from './components/RecentTradesCard';

export const Dashboard = () => {
  const { trades, accounts, selectedAccountId } = useAppContext();
  const [activePeriod, setActivePeriod] = useState<Period>('1M');

  const {
    activeTrades,
    netPnl,
    totalBalance,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    activeDays,
    chartData,
    sessionData,
    setupData,
    recentTrades,
    sparkPoints,
    currentWeekDays
  } = useDashboardData({ trades, accounts, selectedAccountId, activePeriod });

  return (
    <motion.div
      key={selectedAccountId ?? 'all'}
      variants={stagger}
      initial="hidden"
      animate="show"
      className="p-6 md:p-9 pb-20 w-full flex-1 max-w-full min-w-0 overflow-x-hidden flex flex-col"
    >
      {/* 1. 8 Metrics Grid (4x2 Layout) */}
      <MetricsGrid
        totalBalance={totalBalance}
        netPnl={netPnl}
        winRate={winRate}
        profitFactor={profitFactor}
        totalTrades={activeTrades.length}
        avgWin={avgWin}
        avgLoss={avgLoss}
        activeDays={activeDays}
        sparkPoints={sparkPoints}
      />

      {/* 2. 5-Day Calendar Strip */}
      <WeekStrip currentWeekDays={currentWeekDays} />

      {/* 3. Equity Curve (Full Width) */}
      <EquityCurveCard chartData={chartData} activePeriod={activePeriod} setActivePeriod={setActivePeriod} />

      {/* 4. Perfectly Aligned 3-Column Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0 mb-8">

        {/* Column 1: Win Rate & Emotions */}
        <div className="flex flex-col gap-6 w-full">
          <WinRateCard winRate={winRate} activeTrades={activeTrades} />
          <EmotionsCard activeTrades={activeTrades} />
        </div>

        {/* Column 2: By Session & Top Setups */}
        <div className="flex flex-col gap-6 w-full">
          <SessionPnlCard sessionData={sessionData} />
          <TopSetupsCard setupData={setupData} />
        </div>

        {/* Column 3: Recent Live Trades (Full Height) */}
        <div className="flex flex-col w-full h-full">
          <RecentTradesCard recentTrades={recentTrades} />
        </div>

      </div>

      {/* 5. Trading Activity Heatmap (Full Width Bottom) */}
      <motion.div variants={fadeUp} className="w-full">
        <TradingActivityHeatmap trades={activeTrades} activeAccountId={selectedAccountId} />
      </motion.div>

    </motion.div>
  );
};
