import { useState, useMemo } from 'react';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import { selectActiveTrades } from '../../../lib/selectActiveTrades';

export const useJournalFilters = () => {
  const { trades, accounts, selectedAccountId } = useAppContext();

  const [filterResult, setFilterResult] = useState<'all'|'wins'|'losses'>('all');
  const [selectedSetup, setSelectedSetup] = useState<string>('');
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueSetups = Array.from(new Set(trades.map(t => t.setup))).map(s => ({ value: s, label: s }));
  const uniquePairs = Array.from(new Set(trades.map(t => t.pair))).map(p => ({ value: p, label: p }));

  const filteredTrades = useMemo(() => {
    let r = selectActiveTrades(trades, accounts, selectedAccountId);

    if (filterResult === 'wins') r = r.filter(t => t.result === 'win');
    if (filterResult === 'losses') r = r.filter(t => t.result === 'loss');
    if (selectedSetup) r = r.filter(t => t.setup === selectedSetup);
    if (selectedPair) r = r.filter(t => t.pair === selectedPair);

    if (selectedDateRange) {
      r = r.filter(t => {
        const tradeDate = new Date(t.date);
        if (selectedDateRange === 'today') return isToday(tradeDate);
        if (selectedDateRange === 'week') return isThisWeek(tradeDate, { weekStartsOn: 1 });
        if (selectedDateRange === 'month') return isThisMonth(tradeDate);
        return true;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(t =>
        t.pair.toLowerCase().includes(q) ||
        t.setup.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      );
    }

    return [...r].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, accounts, selectedAccountId, filterResult, selectedSetup, selectedPair, selectedDateRange, searchQuery]);

  const resetFilters = () => {
    setFilterResult('all');
    setSelectedSetup('');
    setSelectedPair('');
    setSelectedDateRange('');
    setSearchQuery('');
  };

  const hasActiveFilters = filterResult !== 'all' || selectedSetup !== '' || selectedPair !== '' || selectedDateRange !== '' || searchQuery !== '';

  return {
    filterResult, setFilterResult,
    selectedSetup, setSelectedSetup,
    selectedPair, setSelectedPair,
    selectedDateRange, setSelectedDateRange,
    searchQuery, setSearchQuery,
    uniqueSetups, uniquePairs,
    filteredTrades,
    resetFilters,
    hasActiveFilters
  };
};

export type JournalFiltersState = ReturnType<typeof useJournalFilters>;
