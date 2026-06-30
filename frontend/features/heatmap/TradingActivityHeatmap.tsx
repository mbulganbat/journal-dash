import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCalendarWeek } from '@tabler/icons-react';
import { Props, LegendFilter, HeatmapCell } from './types';
import { useHeatmapData } from './hooks/useHeatmapData';
import { StatusBadges } from './components/StatusBadges';
import { HeatmapGrid } from './components/HeatmapGrid';
import { HeatmapDetailPanel } from './components/HeatmapDetailPanel';
import { HeatmapLegend } from './components/HeatmapLegend';

export const TradingActivityHeatmap = ({ trades, activeAccountId }: Props) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [hoveredLegend, setHoveredLegend] = useState<LegendFilter | null>(null);

  const {
    bestStreak,
    mostActiveDay,
    bestMonth,
    activeDays,
    netPnl,
    columns,
    monthLabels,
    maxProfit,
    maxLoss
  } = useHeatmapData(trades);

  return (
    <div className="w-full">
      <motion.div
        key={activeAccountId ?? 'all'}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-bg-2 border border-white/[0.06] rounded-card p-6 relative w-full overflow-visible"
      >
        {/* Header & Status Pills */}
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <IconCalendarWeek size={20} className="text-text-3" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-text-1">Trading Activity Heatmap</h3>
              <p className="text-[12px] text-text-3">{new Date().getFullYear()} calendar year · Jan – Dec</p>
            </div>
          </div>

          <StatusBadges bestStreak={bestStreak} mostActiveDay={mostActiveDay} bestMonth={bestMonth} />
        </div>

        {/* Grid + Hover Detail Panel */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0">
            <HeatmapGrid
              columns={columns}
              monthLabels={monthLabels}
              maxProfit={maxProfit}
              maxLoss={maxLoss}
              setHoveredCell={setHoveredCell}
              hoveredLegend={hoveredLegend}
            />
          </div>

          <HeatmapDetailPanel cell={hoveredCell} />
        </div>

        <HeatmapLegend
          activeDays={activeDays}
          tradesLength={trades.length}
          netPnl={netPnl}
          setHoveredLegend={setHoveredLegend}
        />
      </motion.div>
    </div>
  );
};
