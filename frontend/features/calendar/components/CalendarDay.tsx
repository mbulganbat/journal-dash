import { motion } from 'framer-motion';
import { format, startOfWeek } from 'date-fns';
import { CalendarDay as CalendarDayType } from '../types';
import { formatCurrency, moneyClass, privacyStyle } from '../utils';

interface Props {
  day: CalendarDayType;
  maxDayProfit: number;
  maxDayLoss: number;
  onHoverWeek: (weekStart: Date) => void;
  onSelect: (day: CalendarDayType) => void;
  privacyMode: boolean;
}

export const CalendarDay = ({ day, maxDayProfit, maxDayLoss, onHoverWeek, onSelect, privacyMode }: Props) => {
  const hasTrades = day.trades.length > 0;
  const weekStart = startOfWeek(day.date, { weekStartsOn: 1 });
  const isPositive = day.pnl > 0;
  const isNegative = day.pnl < 0;

  // Glow intensity scales with how big this day's P&L was relative to the
  // month's most active day — same convention as the Trading Activity
  // Heatmap. At rest, a soft ambient corner glow (the same blurred-blob
  // technique used by MetricCard/SetupCard) tints the card; on hover, the
  // glow extends outward into a halo around the whole card.
  const intensity = isPositive
    ? Math.min(day.pnl / maxDayProfit, 1)
    : isNegative
      ? Math.min(Math.abs(day.pnl) / maxDayLoss, 1)
      : 0;
  const glowRgb = isPositive ? '0,255,178' : isNegative ? '255,90,90' : hasTrades ? '255,184,0' : null;
  const glowOpacity = isPositive || isNegative ? 0.32 + intensity * 0.38 : hasTrades ? 0.28 : 0;
  const hoverShadow = glowRgb
    ? `0 0 ${14 + intensity * 30}px rgba(${glowRgb}, ${(0.18 + intensity * 0.27).toFixed(2)})`
    : '0 0 16px rgba(255,255,255,0.06)';

  return (
    <motion.button
      type="button"
      disabled={!day.inMonth || !hasTrades}
      animate={{ boxShadow: '0 0 0px rgba(0,0,0,0)' }}
      whileHover={hasTrades && day.inMonth ? { scale: 1.03, y: -2, boxShadow: hoverShadow } : undefined}
      transition={{ boxShadow: { duration: 0.3 }, default: { duration: 0.2 } }}
      onMouseEnter={() => onHoverWeek(weekStart)}
      onFocus={() => onHoverWeek(weekStart)}
      onClick={() => hasTrades && day.inMonth && onSelect(day)}
      className={`min-h-[96px] md:min-h-[124px] rounded-[20px] border p-3 text-left transition-colors relative overflow-hidden ${
        day.inMonth
          ? 'bg-[#080808] border-white/[0.06] hover:border-white/[0.14]'
          : 'bg-white/[0.02] border-white/[0.04] opacity-20 cursor-not-allowed'
      } ${hasTrades && day.inMonth ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {hasTrades && glowRgb && (
        <div
          className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-xl pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(${glowRgb}, ${glowOpacity.toFixed(3)}) 0%, rgba(${glowRgb}, 0) 72%)` }}
        />
      )}

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

      {hasTrades && (
        <div
          className={`absolute left-3 right-3 bottom-3 text-xs font-extrabold ${moneyClass(day.pnl)}`}
          style={privacyStyle(privacyMode)}
        >
          {formatCurrency(day.pnl)}
        </div>
      )}
    </motion.button>
  );
};
