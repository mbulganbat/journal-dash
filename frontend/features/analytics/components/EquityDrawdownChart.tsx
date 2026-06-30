import { motion } from 'framer-motion';
import { IconChartLine } from '@tabler/icons-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { CustomEquityTooltip } from './AnalyticsTooltips';
import { AnalyticsData } from '../hooks/useAnalyticsData';

interface Props {
  metrics: AnalyticsData['metrics'];
  isPrivacyEnabled: boolean;
}

export const EquityDrawdownChart = ({ metrics, isPrivacyEnabled }: Props) => {
  return (
    <motion.div {...premiumHoverProps} className="bg-bg-2 border border-white/[0.06] rounded-card p-6 w-full">
      <h3 className="text-[15px] font-semibold text-text-1 mb-6 flex items-center gap-2">
        <IconChartLine size={18} className="text-[#00FFB2]" /> Equity Growth & Drawdown
      </h3>
      <div className="h-[400px] w-full flex flex-col">
        {/* Top 70%: Equity Curve */}
        <ResponsiveContainer width="100%" height="70%">
          <AreaChart data={metrics.equityCurve} syncId="equity-drawdown" margin={{ top: 10, right: 60, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FFB2" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis domain={['auto', 'auto']} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} width={60} />
            <Tooltip content={<CustomEquityTooltip isPrivacyEnabled={isPrivacyEnabled} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="equity" stroke="#00FFB2" strokeWidth={1.5} fill="url(#colorEq)" activeDot={{ r: 4, fill: '#00FFB2', stroke: '#0C0C0E', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Bottom 30%: Drawdown Curve */}
        <ResponsiveContainer width="100%" height="30%">
          <AreaChart data={metrics.equityCurve} syncId="equity-drawdown" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF5A5A" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} horizontal={false} />
            <XAxis dataKey="date" tickFormatter={v => format(new Date(v), 'MMM dd')} stroke="none" tick={{ fill: '#505060', fontSize: 11 }} dy={10} />
            <YAxis domain={['auto', 0]} orientation="right" tickFormatter={v => `${v}%`} stroke="none" tick={{ fill: '#FF5A5A', fontSize: 11 }} width={60} />
            <Tooltip content={() => null} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="drawdown" stroke="#FF5A5A" strokeWidth={1.5} fill="url(#colorDd)" activeDot={{ r: 4, fill: '#FF5A5A', stroke: '#0C0C0E', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
