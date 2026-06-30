import { motion } from 'framer-motion';
import { IconChartHistogram, IconListDetails } from '@tabler/icons-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { CustomAssetTooltip } from './AnalyticsTooltips';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  sessionAnalytics: AnalyticsData['sessionAnalytics'];
  isPrivacyEnabled: boolean;
}

export const TimeSessionTab = ({ sessionAnalytics, isPrivacyEnabled }: Props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Session P&L Bar Chart */}
      <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6">
        <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
          <IconChartHistogram size={18} className="text-[#B259FF]" /> P&L by Session
        </h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sessionAnalytics} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00FFB2" stopOpacity={1} />
                  <stop offset="100%" stopColor="#14F195" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5A5A" stopOpacity={1} />
                  <stop offset="100%" stopColor="#FF1F1F" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
              <XAxis dataKey="name" stroke="none" tick={{ fill: '#A0A0B0', fontSize: 11, fontWeight: 'bold' }} dy={10} />
              <YAxis tickFormatter={v => `$${v}`} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} dx={-10} />
              <Tooltip content={<CustomAssetTooltip isPrivacyEnabled={isPrivacyEnabled} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} strokeDasharray="3 3" />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]} barSize={32}>
                {sessionAnalytics.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? 'url(#profitGrad)' : 'url(#lossGrad)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Session Detailed Table */}
      <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 overflow-hidden flex flex-col">
        <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
          <IconListDetails size={18} className="text-[#00FFB2]" /> Session Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold">Session</th>
                <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Trades</th>
                <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">W / L / BE</th>
                <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Win Rate</th>
                <th className="pb-3 text-[10px] uppercase text-[#505060] tracking-widest font-bold text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody>
              {sessionAnalytics.map((s, i) => {
                let wrColor = 'text-danger bg-danger/10 border-danger/20';
                if (s.wr >= 70) wrColor = 'text-[#00FFB2] bg-[#00FFB2]/10 border-[#00FFB2]/20';
                else if (s.wr >= 40) wrColor = 'text-warning bg-warning/10 border-warning/20';

                return (
                  <motion.tr
                    key={i}
                    whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.02)" }}
                    className="border-b border-white/[0.04] last:border-0 transition-colors cursor-pointer"
                  >
                    <td className="py-3 text-[13px] font-bold text-text-1">{s.name}</td>
                    <td className="py-3 text-[13px] text-text-2 text-right">{s.count}</td>
                    <td className="py-3 text-[12px] text-text-3 text-right">
                      <span className="text-[#00FFB2]">{s.wins}</span> / <span className="text-[#FF5A5A]">{s.losses}</span> / <span>{s.breakevens}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md border ${wrColor}`}>
                        {s.wr.toFixed(0)}%
                      </span>
                    </td>
                    <td className={`py-3 text-[13px] font-bold text-right transition-all duration-200 ${isPrivacyEnabled ? 'blur-[6px] select-none' : ''} ${s.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {s.pnl >= 0 ? '+' : '-'}${Math.abs(s.pnl).toLocaleString(undefined, {maximumFractionDigits:0})}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
