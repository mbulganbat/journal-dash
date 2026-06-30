import { motion } from 'framer-motion';
import { format, startOfWeek } from 'date-fns';
import { CalendarDay as CalendarDayType } from '../types';
import { formatCurrency, moneyClass, privacyStyle } from '../utils';

interface Props {
  day: CalendarDayType;
  onHoverWeek: (weekStart: Date) => void;
  onSelect: (day: CalendarDayType) => void;
  privacyMode: boolean;
}

export const CalendarDay = ({ day, onHoverWeek, onSelect, privacyMode }: Props) => {
  const hasTrades = day.trades.length > 0;
  const weekStart = startOfWeek(day.date, { weekStartsOn: 1 });
  const isPositive = day.pnl > 0;
  const isNegative = day.pnl < 0;

  return (
    <motion.button
      type="button"
      disabled={!day.inMonth || !hasTrades}
      whileHover={hasTrades && day.inMonth ? { scale: 1.03, y: -2 } : undefined}
      onMouseEnter={() => onHoverWeek(weekStart)}
      onFocus={() => onHoverWeek(weekStart)}
      onClick={() => hasTrades && day.inMonth && onSelect(day)}
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
};
