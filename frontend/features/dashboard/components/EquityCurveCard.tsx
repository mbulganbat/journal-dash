import React from 'react';
import { motion } from 'framer-motion';
import { IconChartLine } from '@tabler/icons-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fadeUp } from '../../../lib/animations';
import { TagPill, premiumHoverProps } from '../../../components/ui/Shared';
import { Period, TooltipProps } from '../types';

interface Props {
  chartData: { date: string; equity: number }[];
  activePeriod: Period;
  setActivePeriod: React.Dispatch<React.SetStateAction<Period>>;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-3 border border-em/20 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-text-3 text-xs mb-1">{label ? format(new Date(label), 'MMM dd, yyyy') : ''}</p>
        <p className="text-em font-bold">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export const EquityCurveCard = ({ chartData, activePeriod, setActivePeriod }: Props) => {
  return (
    <motion.div variants={fadeUp} {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 w-full mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <IconChartLine size={20} stroke={2.5} className="text-[#00FFB2]" />
          <h3 className="text-[15px] font-semibold text-text-1">Equity Curve</h3>
        </div>
        <div className="flex gap-1">
          {(['1W', '1M', '3M', 'YTD'] as const).map(p => (
            <TagPill key={p} active={activePeriod === p} onClick={() => setActivePeriod(p)}>{p}</TagPill>
          ))}
        </div>
      </div>

      <div className="h-[320px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(0,255,178,0.18)" />
                <stop offset="95%" stopColor="rgba(0,255,178,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={v => format(new Date(v), 'MMM dd')} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} dy={10} />
            <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} dx={-10} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="equity" stroke="#00FFB2" strokeWidth={2} fill="url(#equityGrad)" animationDuration={1800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
