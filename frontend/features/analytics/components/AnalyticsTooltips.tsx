import { format } from 'date-fns';

// Custom Tooltips
export const CustomTooltip = ({ active, payload, label, prefix='', suffix='' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-3 border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl z-50">
        <p className="text-text-3 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-bold text-[13px]" style={{ color: p.color || p.fill }}>
            {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString(undefined, {maximumFractionDigits:2}) : p.value}{suffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const CustomAssetTooltip = ({ active, payload, label, isPrivacyEnabled }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isWin = data.pnl >= 0;
    return (
      <div className="bg-[#16161A]/90 backdrop-blur-md rounded-card-sm border border-white/10 p-3 shadow-2xl min-w-[160px]">
        <p className="text-text-1 font-bold text-[14px] mb-2 border-b border-white/[0.06] pb-2">{label}</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-text-3 uppercase tracking-wide">Trades</span>
          <span className="text-[13px] font-bold text-text-1">{data.count}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-text-3 uppercase tracking-wide">Win Rate</span>
          <span className={`text-[13px] font-bold ${data.wr >= 50 ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>{data.wr.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-text-3 uppercase tracking-wide">Net P&L</span>
          <span className={`text-[13px] font-extrabold transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${isWin ? 'text-[#00FFB2]' : 'text-[#FF5A5A]'}`}>
            {isWin ? '+' : '-'}${Math.abs(data.pnl).toLocaleString(undefined, {maximumFractionDigits:2})}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const CustomEquityTooltip = ({ active, payload, label, isPrivacyEnabled }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#16161A]/95 backdrop-blur-md border border-white/[0.06] rounded-card-sm px-4 py-3 shadow-2xl z-50 min-w-[200px]">
        <p className="text-text-3 text-xs mb-3 font-semibold uppercase tracking-wider">{format(new Date(label), 'MMM dd, yyyy')}</p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-6">
            <span className="text-[12px] text-text-2">Account Balance</span>
            <span className={`text-[13px] font-bold text-[#00FFB2] transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''}`}>
              ${data.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-[12px] text-text-2">Drawdown</span>
            <span className="text-[13px] font-bold text-[#FF5A5A]">
              {data.drawdown.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
