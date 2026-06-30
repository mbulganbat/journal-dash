import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconCalendar, IconLayoutGrid, IconArrowsExchange } from '@tabler/icons-react';
import { FilterDropdown } from './FilterDropdown';
import { dateRangeOptions } from '../constants';
import { JournalFiltersState } from '../hooks/useJournalFilters';

export const JournalFilterBar = ({ filters }: { filters: JournalFiltersState }) => {
  const {
    searchQuery, setSearchQuery,
    filterResult, setFilterResult,
    selectedDateRange, setSelectedDateRange,
    selectedSetup, setSelectedSetup,
    selectedPair, setSelectedPair,
    uniqueSetups, uniquePairs,
    hasActiveFilters, resetFilters
  } = filters;

  return (
    <div className="sticky top-16 z-30 bg-[#050505]/80 backdrop-blur-xl py-4 mb-8 flex items-center gap-4 flex-wrap border-b border-white/[0.05]">

      {/* Search */}
      <div className="relative">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
        <input
          type="text"
          placeholder="Search trades..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-64 bg-bg-3 border border-white/[0.08] rounded-xl h-11 px-3 pl-9 text-sm text-text-1 focus:outline-none focus:border-[#00FFB2]/50 transition-colors"
        />
      </div>

      {/* Result Pills */}
      <div className="flex gap-1 bg-bg-3 p-1 rounded-xl border border-white/[0.04] h-11 items-center">
        <button
          onClick={() => setFilterResult('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors h-full ${filterResult === 'all' ? 'bg-white/[0.08] text-text-1' : 'text-text-3 hover:text-text-2'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilterResult('wins')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors h-full ${filterResult === 'wins' ? 'bg-[#00FFB2]/10 text-[#00FFB2]' : 'text-text-3 hover:text-text-2'}`}
        >
          Wins
        </button>
        <button
          onClick={() => setFilterResult('losses')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors h-full ${filterResult === 'losses' ? 'bg-[#FF5A5A]/10 text-[#FF5A5A]' : 'text-text-3 hover:text-text-2'}`}
        >
          Losses
        </button>
      </div>

      {/* Custom Dropdowns */}
      <FilterDropdown
        value={selectedDateRange}
        options={dateRangeOptions}
        onChange={setSelectedDateRange}
        icon={IconCalendar}
        placeholder="All Time"
      />

      <FilterDropdown
        value={selectedSetup}
        options={uniqueSetups}
        onChange={setSelectedSetup}
        icon={IconLayoutGrid}
        placeholder="All Setups"
      />

      <FilterDropdown
        value={selectedPair}
        options={uniquePairs}
        onChange={setSelectedPair}
        icon={IconArrowsExchange}
        placeholder="All Pairs"
      />

      {/* Clear Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={resetFilters}
            className="text-xs font-medium text-[#00FFB2] hover:text-[#00E5A0] transition-colors ml-auto px-4 py-2 rounded-xl hover:bg-[#00FFB2]/10 h-11 flex items-center"
          >
            Clear Filters
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
