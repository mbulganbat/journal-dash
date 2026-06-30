import {
  IconCurrencyDollar, IconRosette, IconTrendingUp,
  IconChartCandle, IconCalendarEvent,
  IconArrowUpRight, IconArrowDownRight, IconWallet
} from '@tabler/icons-react';
import { MetricCard } from '../../../components/ui/Shared';

interface Props {
  totalBalance: number;
  netPnl: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  activeDays: number;
  sparkPoints: string;
}

export const MetricsGrid = ({ totalBalance, netPnl, winRate, profitFactor, totalTrades, avgWin, avgLoss, activeDays, sparkPoints }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
      <MetricCard
        title="Total Balance"
        value={totalBalance}
        prefix="$"
        icon={IconWallet}
        iconColor="text-[#00FFB2]"
        iconBg="bg-[#00FFB2]/10"
        hoverType="positive"
      />
      <MetricCard
        title="Net P&L"
        value={netPnl}
        prefix="$"
        icon={IconCurrencyDollar}
        changeColor={netPnl >= 0 ? "text-success" : "text-danger"}
        iconColor="text-[#00FFB2]"
        iconBg="bg-[#00FFB2]/10"
        hoverType={netPnl >= 0 ? "positive" : "negative"}
        sparkline={
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <polyline points={sparkPoints} fill="none" stroke={netPnl >= 0 ? "#00FFB2" : "#FF5A5A"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
      <MetricCard
        title="Win Rate"
        value={winRate}
        suffix="%"
        icon={IconRosette}
        iconColor="text-[#00E5A0]"
        iconBg="bg-[#00E5A0]/10"
        hoverType="info"
      />
      <MetricCard
        title="Profit Factor"
        value={profitFactor}
        icon={IconTrendingUp}
        iconColor="text-[#FFB800]"
        iconBg="bg-[#FFB800]/10"
        hoverType="warning"
      />
      <MetricCard
        title="Total Trades"
        value={totalTrades}
        icon={IconChartCandle}
        iconColor="text-[#00E5A0]"
        iconBg="bg-[#00E5A0]/10"
        hoverType="info"
      />
      <MetricCard
        title="Avg Win"
        value={avgWin}
        prefix="$"
        icon={IconArrowUpRight}
        changeColor="text-success"
        iconColor="text-[#00FFB2]"
        iconBg="bg-[#00FFB2]/10"
        hoverType="positive"
      />
      <MetricCard
        title="Avg Loss"
        value={avgLoss}
        prefix="$"
        icon={IconArrowDownRight}
        changeColor="text-danger"
        iconColor="text-[#FF5A5A]"
        iconBg="bg-[#FF5A5A]/10"
        hoverType="negative"
      />
      <MetricCard
        title="Active Days"
        value={activeDays}
        icon={IconCalendarEvent}
        iconColor="text-[#B259FF]"
        iconBg="bg-[#B259FF]/10"
        hoverType="neutral"
      />
    </div>
  );
};
