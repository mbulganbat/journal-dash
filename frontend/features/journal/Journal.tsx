import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconInbox } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { stagger, fadeUp } from '../../lib/animations';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { useJournalFilters } from './hooks/useJournalFilters';
import { JournalFilterBar } from './components/JournalFilterBar';
import { TradeCard } from './components/TradeCard';

export const Journal = () => {
  const { setEditingTrade, setOpenNewTrade, deleteTrade } = useAppContext();
  const navigate = useNavigate();

  const filters = useJournalFilters();
  const {
    filteredTrades, resetFilters,
    filterResult, selectedSetup, selectedPair, selectedDateRange, searchQuery,
  } = filters;

  const [confirmDeleteId, setConfirmDeleteId] = useState<string|null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 9;

  // Reset to the first page whenever the filter criteria change.
  useEffect(() => {
    setCurrentPage(1);
  }, [filterResult, selectedSetup, selectedPair, selectedDateRange, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / PER_PAGE));
  // Clamp so deleting the last card on the last page can't strand the user.
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTrades = filteredTrades.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleDelete = () => {
    if (confirmDeleteId) {
      deleteTrade(confirmDeleteId);
      toast.success("Trade deleted successfully");
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 md:p-9 pb-20 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-1">Journal</h1>
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-3 text-xs font-bold">
            {filteredTrades.length} trades found
          </span>
        </div>
      </div>

      {/* Sticky Premium Filter Bar */}
      <JournalFilterBar filters={filters} />

      {/* Masonry Grid */}
      {filteredTrades.length > 0 ? (
        <>
          <motion.div key={safePage} variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {paginatedTrades.map(trade => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onView={() => navigate(`/trade/${trade.id}`)}
                  onEdit={() => { setEditingTrade(trade); setOpenNewTrade(true); }}
                  onDelete={() => setConfirmDeleteId(trade.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-2 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
              >Prev</button>
              <span className="px-3 py-1.5 text-sm text-text-3">Page {safePage} of {totalPages}</span>
              <button
                disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-2 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
              >Next</button>
            </div>
          )}
        </>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6">
            <IconInbox size={40} stroke={1.5} className="text-text-3" />
          </div>
          <h3 className="text-[18px] font-bold text-text-1 mb-2">No trades found</h3>
          <p className="text-sm text-text-3 mb-6 text-center max-w-md">
            We couldn't find any trades matching your current filters. Try adjusting your search or clearing the filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-br from-[#00FFB2] to-[#00E5A0] shadow-[0_0_15px_rgba(0,255,178,0.2)] hover:brightness-110 transition-all"
          >
            Reset Filters
          </button>
        </motion.div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Trade"
        message="Are you sure you want to delete this trade? This action cannot be undone."
      />
    </div>
  );
};
