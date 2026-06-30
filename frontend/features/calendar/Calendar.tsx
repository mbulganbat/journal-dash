import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { fadeUp, stagger } from '../../lib/animations';
import { CalendarDay, OutcomeFilter } from './types';
import { useCalendarData } from './hooks/useCalendarData';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { CalendarLegend } from './components/CalendarLegend';
import { WeekSidebar } from './components/WeekSidebar';
import { DayDetailModal } from './components/DayDetailModal';

export const Calendar = () => {
  const { trades, accounts, selectedAccountId } = useAppContext();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [accountRoute, setAccountRoute] = useState<string>(() => selectedAccountId ?? 'all');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [hoveredWeekStart, setHoveredWeekStart] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const {
    monthLabel,
    calendarDays,
    weekStats,
    microStats,
    monthlyWeeks,
    weekTone,
    selectedAccountName,
    weeklyNetPnlValue,
    accountOptions
  } = useCalendarData({ trades, accounts, currentMonth, outcomeFilter, accountRoute, hoveredWeekStart });

  return (
    <motion.div
      key={`${accountRoute}-${format(currentMonth, 'yyyy-MM')}`}
      variants={stagger}
      initial="hidden"
      animate="show"
      className="p-6 md:p-9 pb-20 w-full min-w-0"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full min-w-0 items-start">
        <motion.section variants={fadeUp} className="xl:col-span-9 min-w-0">
          <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-[20px] p-5 md:p-6 overflow-hidden relative">
            <div className="absolute -top-24 right-12 h-48 w-48 rounded-full bg-[#00FFB2]/[0.05] blur-3xl pointer-events-none" />

            <CalendarHeader
              monthLabel={monthLabel}
              selectedAccountName={selectedAccountName}
              setCurrentMonth={setCurrentMonth}
              outcomeFilter={outcomeFilter}
              setOutcomeFilter={setOutcomeFilter}
              accountMenuOpen={accountMenuOpen}
              setAccountMenuOpen={setAccountMenuOpen}
              accountRoute={accountRoute}
              setAccountRoute={setAccountRoute}
              accountOptions={accountOptions}
              privacyMode={privacyMode}
              setPrivacyMode={setPrivacyMode}
            />

            <CalendarGrid
              calendarDays={calendarDays}
              onHoverWeek={setHoveredWeekStart}
              onSelectDay={setSelectedDay}
              privacyMode={privacyMode}
            />
          </div>

          <CalendarLegend microStats={microStats} />
        </motion.section>

        <WeekSidebar
          weekStats={weekStats}
          weekTone={weekTone}
          weeklyNetPnlValue={weeklyNetPnlValue}
          monthlyWeeks={monthlyWeeks}
          privacyMode={privacyMode}
        />
      </div>

      <DayDetailModal
        selectedDay={selectedDay}
        onClose={() => setSelectedDay(null)}
        onTradeClick={(tradeId) => { setSelectedDay(null); navigate(`/trade/${tradeId}`); }}
        privacyMode={privacyMode}
      />
    </motion.div>
  );
};
