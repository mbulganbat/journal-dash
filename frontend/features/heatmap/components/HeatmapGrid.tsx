import { motion } from 'framer-motion';
import { HeatmapCell, LegendFilter } from '../types';

interface Props {
  columns: HeatmapCell[][];
  monthLabels: { colIndex: number, label: string }[];
  maxProfit: number;
  maxLoss: number;
  setHoveredCell: (cell: HeatmapCell | null) => void;
  hoveredLegend: LegendFilter | null;
}

export const HeatmapGrid = ({ columns, monthLabels, maxProfit, maxLoss, setHoveredCell, hoveredLegend }: Props) => {
  const getCellBg = (day: HeatmapCell) => {
    if (day.date.getTime() === 0) return 'transparent'; // Padding cells
    if (day.isFuture || day.count === 0) return 'rgba(255,255,255,0.02)';
    if (day.pnl > 0) {
      const intensity = Math.min(day.pnl / maxProfit, 1);
      return `rgba(0, 255, 178, ${0.2 + intensity * 0.8})`;
    } else if (day.pnl < 0) {
      const intensity = Math.min(Math.abs(day.pnl) / maxLoss, 1);
      return `rgba(255, 90, 90, ${0.2 + intensity * 0.8})`;
    }
    return 'rgba(255,255,255,0.04)'; // Break even
  };

  const getCellBorderColor = (day: HeatmapCell) => {
    if (day.date.getTime() === 0) return 'transparent'; // Padding cells
    if (day.isFuture || day.count === 0) return 'rgba(255,255,255,0.04)';
    if (day.pnl > 0) return 'rgba(0,255,178,0.3)';
    if (day.pnl < 0) return 'rgba(255,90,90,0.3)';
    return 'rgba(255,255,255,0.1)';
  };

  const isCellDimmed = (day: HeatmapCell) => {
    if (!hoveredLegend || day.isFuture || day.date.getTime() === 0) return false;
    if (hoveredLegend === 'profit' && day.pnl <= 0) return true;
    if (hoveredLegend === 'loss' && day.pnl >= 0) return true;
    if (hoveredLegend === 'neutral' && day.count > 0) return true;
    return false;
  };

  const isCellPulsing = (day: HeatmapCell) => {
    if (!hoveredLegend || day.isFuture || day.date.getTime() === 0) return false;
    if (hoveredLegend === 'profit' && day.pnl > 0) return true;
    if (hoveredLegend === 'loss' && day.pnl < 0) return true;
    return false;
  };

  return (
    /* Unified Horizontal Scroll Wrapper */
    <div className="w-full overflow-x-auto overflow-y-visible scrollbar-none pb-2 flex justify-start">

      {/* Locked Grid Container */}
      <div className="w-full flex flex-col">

        {/* Month Labels Row (CSS Grid matching the columns) */}
        <div className="grid grid-cols-[auto_1fr] gap-3 mb-2">
          {/* Empty space for weekday labels column */}
          <div className="w-8"></div>

          {/* Grid for Month Labels */}
          <div
            className="grid gap-[4px]"
            style={{ gridTemplateColumns: `repeat(${columns.length}, 12px)` }}
          >
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-[#505060] font-semibold tracking-wider"
                style={{ gridColumnStart: m.colIndex + 1 }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Main Heatmap Area (Weekday Labels + Day Cells) */}
        <div className="grid grid-cols-[auto_1fr] gap-3">

          {/* Weekday Labels */}
          <div className="flex flex-col gap-[4px] text-[10px] text-[#505060] font-semibold tracking-wider justify-between py-[2px]">
            <span className="h-[12px] leading-[12px]">MON</span>
            <span className="h-[12px]"></span>
            <span className="h-[12px] leading-[12px]">WED</span>
            <span className="h-[12px]"></span>
            <span className="h-[12px] leading-[12px]">FRI</span>
            <span className="h-[12px]"></span>
            <span className="h-[12px]"></span>
          </div>

          {/* Grid for Day Cells */}
          <div
            className="grid gap-[4px]"
            style={{ gridTemplateColumns: `repeat(${columns.length}, 12px)` }}
          >
            {columns.map((week, colIndex) => (
              <div key={`col-${colIndex}`} className="flex flex-col gap-[4px]">
                {week.map((day, rowIndex) => {
                  const isPadding = day.date.getTime() === 0;

                  return (
                    <motion.div
                      key={`cell-${colIndex}-${rowIndex}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isCellDimmed(day) ? 0.15 : 1,
                        scale: 1,
                        backgroundColor: getCellBg(day),
                        borderColor: getCellBorderColor(day)
                      }}
                      transition={{
                        duration: 0.4,
                        delay: (colIndex * 0.003) + (rowIndex * 0.001),
                        backgroundColor: { duration: 0.4 }
                      }}
                      whileHover={!day.isFuture && !isPadding ? { scale: 1.18, zIndex: 30 } : {}}
                      onMouseEnter={() => !day.isFuture && !isPadding && setHoveredCell(day)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[12px] h-[12px] rounded-[3px] border border-solid ${!day.isFuture && !isPadding ? 'cursor-pointer' : ''} relative ${isCellPulsing(day) ? 'animate-pulse' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
