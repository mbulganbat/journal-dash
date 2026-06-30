import { IconCalendar, IconFlame, IconTrendingUp } from '@tabler/icons-react';

interface Props {
  bestStreak: number;
  mostActiveDay: string;
  bestMonth: string;
}

export const StatusBadges = ({ bestStreak, mostActiveDay, bestMonth }: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800]">
        <IconFlame size={14} />
        <span className="text-[11px] font-bold">Best streak: {bestStreak} days</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0]">
        <IconCalendar size={14} />
        <span className="text-[11px] font-bold">Most active: {mostActiveDay}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 text-[#00FFB2]">
        <IconTrendingUp size={14} />
        <span className="text-[11px] font-bold">Best month: {bestMonth}</span>
      </div>
    </div>
  );
};
