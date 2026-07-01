import { weekDays } from '../constants';
import { CalendarDay as CalendarDayType } from '../types';
import { CalendarDay } from './CalendarDay';

interface Props {
  calendarDays: CalendarDayType[];
  maxDayProfit: number;
  maxDayLoss: number;
  onHoverWeek: (weekStart: Date) => void;
  onSelectDay: (day: CalendarDayType) => void;
  privacyMode: boolean;
}

export const CalendarGrid = ({ calendarDays, maxDayProfit, maxDayLoss, onHoverWeek, onSelectDay, privacyMode }: Props) => {
  return (
    <div className="relative z-10 mt-6">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] uppercase tracking-[0.2em] text-text-3 font-bold py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          // Only render current-month days; keep grid alignment with a blank cell for adjacent months.
          if (!day.inMonth) {
            return <div key={day.date.toISOString()} aria-hidden />;
          }
          return (
            <CalendarDay
              key={day.date.toISOString()}
              day={day}
              maxDayProfit={maxDayProfit}
              maxDayLoss={maxDayLoss}
              onHoverWeek={onHoverWeek}
              onSelect={onSelectDay}
              privacyMode={privacyMode}
            />
          );
        })}
      </div>
    </div>
  );
};
