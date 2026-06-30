import { IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';
import { HeatmapCell } from '../types';

export const HeatmapDetailPanel = ({ cell }: { cell: HeatmapCell | null }) => {
  return (
    <div className="w-full xl:w-[220px] shrink-0 bg-[#0C0C0E] border border-white/[0.06] rounded-xl p-4 min-h-[150px] flex flex-col">
      {cell ? (
        <>
          <div className="flex items-center gap-2 mb-3 border-b border-white/[0.06] pb-2">
            <IconCalendar size={12} className="text-text-3" />
            <span className="text-[11px] font-semibold text-text-1">{format(cell.date, 'EEEE, MMM d, yyyy')}</span>
          </div>

          {cell.count > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] text-text-3 uppercase tracking-wide">Trades</span>
                <span className="text-[12px] font-bold text-text-1">{cell.count}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] text-text-3 uppercase tracking-wide">Net P&L</span>
                <span className={`text-[13px] font-extrabold ${cell.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {cell.pnl >= 0 ? '+' : '-'}${Math.abs(cell.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px] text-text-2">
                  {cell.dominantEmotion}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-text-3 italic">No trading activity</div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-[11px] text-text-3">
          Hover a day to see its details
        </div>
      )}
    </div>
  );
};
