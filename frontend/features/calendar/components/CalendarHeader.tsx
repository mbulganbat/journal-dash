import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconFilter
} from '@tabler/icons-react';
import { addMonths, subMonths } from 'date-fns';
import { outcomeFilters } from '../constants';
import { AccountOption, OutcomeFilter } from '../types';

interface Props {
  monthLabel: string;
  selectedAccountName: string;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  outcomeFilter: OutcomeFilter;
  setOutcomeFilter: React.Dispatch<React.SetStateAction<OutcomeFilter>>;
  accountMenuOpen: boolean;
  setAccountMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  accountRoute: string;
  setAccountRoute: React.Dispatch<React.SetStateAction<string>>;
  accountOptions: AccountOption[];
  privacyMode: boolean;
  setPrivacyMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CalendarHeader = ({
  monthLabel,
  selectedAccountName,
  setCurrentMonth,
  outcomeFilter,
  setOutcomeFilter,
  accountMenuOpen,
  setAccountMenuOpen,
  accountRoute,
  setAccountRoute,
  accountOptions,
  privacyMode,
  setPrivacyMode
}: Props) => {
  return (
    <>
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-[12px] bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex items-center justify-center">
              <IconCalendar size={22} stroke={2.4} className="text-[#00FFB2]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-text-3 font-bold">Performance Calendar</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-1">{monthLabel}</h1>
            </div>
          </div>
          <p className="text-sm text-text-2 max-w-xl">
            {selectedAccountName} routed through closed executions with challenge accounts isolated from consolidated totals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth((value) => subMonths(value, 1))}
            className="h-10 w-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] text-text-2 hover:text-text-1 hover:bg-white/[0.08] transition-colors flex items-center justify-center"
            aria-label="Previous month"
          >
            <IconChevronLeft size={19} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="h-10 px-4 rounded-[12px] bg-[#16161A] border border-white/[0.08] text-xs font-bold uppercase tracking-[0.18em] text-text-2 hover:text-[#00FFB2] transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
            className="h-10 w-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] text-text-2 hover:text-text-1 hover:bg-white/[0.08] transition-colors flex items-center justify-center"
            aria-label="Next month"
          >
            <IconChevronRight size={19} />
          </button>
        </div>
      </div>

      <div className="relative z-20 mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-3 font-bold mr-1">
            <IconFilter size={15} />
            Filter Hub
          </span>
          {outcomeFilters.map((filter) => {
            const active = outcomeFilter === filter.value;
            return (
              <button
                type="button"
                key={filter.value}
                onClick={() => setOutcomeFilter(filter.value)}
                className={`h-10 px-4 rounded-full border text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#00FFB2]/10 text-[#00FFB2] border-[#00FFB2]/30 shadow-[0_0_18px_rgba(0,255,178,0.08)]'
                    : 'bg-white/[0.03] text-text-2 border-white/[0.08] hover:bg-white/[0.06] hover:text-text-1'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative z-[100] min-w-[230px]">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((value) => !value)}
              className="h-11 w-full rounded-[12px] bg-[#16161A] border border-white/[0.08] px-4 text-sm text-text-1 outline-none hover:border-white/[0.14] focus:border-[#00FFB2]/40 transition-colors flex items-center justify-between gap-3"
              aria-haspopup="listbox"
              aria-expanded={accountMenuOpen}
            >
              <span className="truncate">{selectedAccountName}</span>
              <IconChevronDown
                size={17}
                className={`text-text-3 shrink-0 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {accountMenuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+8px)] z-[9999] bg-[#111318] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[220px] w-full"
                  role="listbox"
                >
                  {accountOptions.map((option) => {
                    const active = accountRoute === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => {
                          setAccountRoute(option.id);
                          setAccountMenuOpen(false);
                        }}
                        className={`w-full ${
                          active
                            ? 'px-4 py-3 text-sm text-[#00FFB2] bg-[#00FFB2]/10 font-medium flex items-center gap-2'
                            : 'px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors flex items-center gap-2'
                        }`}
                        role="option"
                        aria-selected={active}
                      >
                        <span className="truncate">{option.label}</span>
                        {active ? <IconCheck size={16} className="text-[#00FFB2] ml-auto shrink-0" /> : null}
                      </button>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => setPrivacyMode((value) => !value)}
            className={`h-11 px-4 rounded-[12px] border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
              privacyMode
                ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/25'
                : 'bg-white/[0.03] text-text-2 border-white/[0.08] hover:text-text-1'
            }`}
          >
            {privacyMode ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            Privacy
          </button>
        </div>
      </div>
    </>
  );
};
