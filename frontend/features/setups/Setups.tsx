import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconLayoutGrid, IconTrophy, IconRepeat, IconPlus, IconTemplate } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { stagger, fadeUp } from '../../lib/animations';
import { MetricCard } from '../../components/ui/Shared';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { useSetupsData } from './hooks/useSetupsData';
import { useSetupForm } from './hooks/useSetupForm';
import { SetupCard } from './components/SetupCard';
import { SetupFormModal } from './components/SetupFormModal';

export const Setups = () => {
  const { deleteSetup } = useAppContext();
  const { setupStats, totalSetups, bestSetup, mostTraded, avgWinRate } = useSetupsData();

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const form = useSetupForm(() => setFormOpen(false));

  const handleAdd = () => {
    form.resetForm();
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    const target = setupStats.find(s => s.id === id);
    if (!target) return;
    form.loadSetup(target);
    setFormOpen(true);
  };

  const handleCloseModal = () => {
    setFormOpen(false);
    form.resetForm();
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteSetup(confirmDeleteId);
      toast.success('Setup removed from your playbook');
      setConfirmDeleteId(null);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="p-6 md:p-9 pb-20 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-1">Setups</h1>
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-3 text-xs font-bold">
            {totalSetups} in your playbook
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-em text-black text-sm font-bold shadow-[0_0_15px_rgba(0,255,178,0.2)] hover:brightness-110 transition-all"
        >
          <IconPlus size={16} /> New Setup
        </motion.button>
      </div>

      {/* KPI Row */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard
          title="Total Setups" value={totalSetups}
          icon={IconLayoutGrid} iconColor="text-text-2" iconBg="bg-white/[0.04]"
          hoverType="neutral"
        />
        <MetricCard
          title="Avg Win Rate" value={avgWinRate} suffix="%"
          icon={IconTrophy} iconColor="text-[#00FFB2]" iconBg="bg-[#00FFB2]/10"
          hoverType="positive"
        />
        <MetricCard
          title="Best Performer"
          value={bestSetup ? Math.abs(bestSetup.netPnl) : 0}
          prefix={bestSetup && bestSetup.netPnl < 0 ? '-$' : '$'}
          change={bestSetup ? bestSetup.name : 'No trades yet'}
          changeColor="text-text-2"
          icon={IconTrophy} iconColor="text-[#FFB800]" iconBg="bg-[#FFB800]/10"
          hoverType="warning"
        />
        <MetricCard
          title="Most Traded"
          value={mostTraded ? mostTraded.tradeCount : 0}
          change={mostTraded ? mostTraded.name : 'No trades yet'}
          changeColor="text-text-2"
          icon={IconRepeat} iconColor="text-[#5B6BFF]" iconBg="bg-[#5B6BFF]/10"
          hoverType="info"
        />
      </motion.div>

      {/* Setup Cards */}
      {setupStats.length > 0 ? (
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {setupStats.map(setup => (
              <SetupCard
                key={setup.id}
                setup={setup}
                onEdit={() => handleEdit(setup.id)}
                onDelete={() => setConfirmDeleteId(setup.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6">
            <IconTemplate size={40} stroke={1.5} className="text-text-3" />
          </div>
          <h3 className="text-[18px] font-bold text-text-1 mb-2">Your playbook is empty</h3>
          <p className="text-sm text-text-3 mb-6 text-center max-w-md">
            Define the setups you actually trade — entry criteria, rules, and a place to track how each one performs.
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-br from-[#00FFB2] to-[#00E5A0] shadow-[0_0_15px_rgba(0,255,178,0.2)] hover:brightness-110 transition-all"
          >
            Add Your First Setup
          </button>
        </motion.div>
      )}

      <SetupFormModal isOpen={formOpen} onClose={handleCloseModal} form={form} />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Setup"
        message="This removes the setup from your playbook. Trades already logged with this setup keep their historical label."
      />
    </motion.div>
  );
};
