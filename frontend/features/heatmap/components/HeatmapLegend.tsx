import { LegendFilter } from '../types';

interface Props {
  activeDays: number;
  tradesLength: number;
  netPnl: number;
  setHoveredLegend: (value: LegendFilter | null) => void;
}

export const HeatmapLegend = ({ activeDays, tradesLength, netPnl, setHoveredLegend }: Props) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 pt-5 border-t border-white/[0.04] gap-4">
      <div className="text-[12px] text-text-2 font-medium">
        <span className="text-text-1 font-bold">{activeDays}</span> active days · <span className="text-text-1 font-bold">{tradesLength}</span> trades · <span className={`font-bold ${netPnl >= 0 ? 'text-success' : 'text-danger'}`}>{netPnl >= 0 ? '+' : '-'}${Math.abs(netPnl).toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[11px] text-text-3 uppercase tracking-wider font-semibold">Filter:</span>
        <div
          onMouseEnter={() => setHoveredLegend('loss')} onMouseLeave={() => setHoveredLegend(null)}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          <div className="w-3 h-3 rounded-[3px] bg-danger/60 group-hover:bg-danger transition-colors shadow-[0_0_8px_rgba(255,90,90,0.3)]" />
          <span className="text-[11px] text-text-2 group-hover:text-text-1 transition-colors font-medium">Loss</span>
        </div>
        <div
          onMouseEnter={() => setHoveredLegend('neutral')} onMouseLeave={() => setHoveredLegend(null)}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          <div className="w-3 h-3 rounded-[3px] bg-white/[0.08] border border-white/[0.04] group-hover:bg-white/[0.2] transition-colors" />
          <span className="text-[11px] text-text-2 group-hover:text-text-1 transition-colors font-medium">Break Even / No Trades</span>
        </div>
        <div
          onMouseEnter={() => setHoveredLegend('profit')} onMouseLeave={() => setHoveredLegend(null)}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          <div className="w-3 h-3 rounded-[3px] bg-em/60 group-hover:bg-em transition-colors shadow-[0_0_8px_rgba(0,255,178,0.3)]" />
          <span className="text-[11px] text-text-2 group-hover:text-text-1 transition-colors font-medium">Profit</span>
        </div>
      </div>
    </div>
  );
};
