import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconFlag, IconTrophy, IconAlertTriangle, IconTrendingUp, IconPlus, IconTarget } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { stagger, fadeUp } from '../../lib/animations';
import { MetricCard } from '../../components/ui/Shared';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { useGoalsData } from './hooks/useGoalsData';
import { useGoalForm } from './hooks/useGoalForm';
import { GoalCard } from './components/GoalCard';
import { GoalFormModal } from './components/GoalFormModal';

export const Goals = () => {
  const { deleteGoal, updateGoal } = useAppContext();
  const { goalStats, totalGoals, achievedCount, needsAttentionCount, avgProgress } = useGoalsData();

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const form = useGoalForm(() => setFormOpen(false));

  const handleAdd = () => {
    form.resetForm();
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    const target = goalStats.find(g => g.id === id);
    if (!target) return;
    form.loadGoal(target);
    setFormOpen(true);
  };

  const handleCloseModal = () => {
    setFormOpen(false);
    form.resetForm();
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteGoal(confirmDeleteId);
      toast.success('Goal removed');
      setConfirmDeleteId(null);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="p-6 md:p-9 pb-20 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-1">Goals</h1>
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-3 text-xs font-bold">
            {totalGoals} active
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-em text-black text-sm font-bold shadow-[0_0_15px_rgba(0,255,178,0.2)] hover:brightness-110 transition-all"
        >
          <IconPlus size={16} /> New Goal
        </motion.button>
      </div>

      {/* KPI Row */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard
          title="Total Goals" value={totalGoals}
          icon={IconFlag} iconColor="text-text-2" iconBg="bg-white/[0.04]"
          hoverType="neutral"
        />
        <MetricCard
          title="Achieved" value={achievedCount}
          icon={IconTrophy} iconColor="text-[#00FFB2]" iconBg="bg-[#00FFB2]/10"
          hoverType="positive"
        />
        <MetricCard
          title="Needs Attention" value={needsAttentionCount}
          icon={IconAlertTriangle} iconColor="text-[#FF5A5A]" iconBg="bg-[#FF5A5A]/10"
          hoverType="negative"
        />
        <MetricCard
          title="Avg Progress" value={avgProgress} suffix="%"
          icon={IconTrendingUp} iconColor="text-[#5B6BFF]" iconBg="bg-[#5B6BFF]/10"
          hoverType="info"
        />
      </motion.div>

      {/* Goal Cards */}
      {goalStats.length > 0 ? (
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {goalStats.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => handleEdit(goal.id)}
                onDelete={() => setConfirmDeleteId(goal.id)}
                onLogProgress={(newCurrent) => updateGoal(goal.id, { current: newCurrent })}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6">
            <IconTarget size={40} stroke={1.5} className="text-text-3" />
          </div>
          <h3 className="text-[18px] font-bold text-text-1 mb-2">No goals yet</h3>
          <p className="text-sm text-text-3 mb-6 text-center max-w-md">
            Set a target — profit, win rate, trade count, whatever moves the needle — and track it against a deadline.
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-br from-[#00FFB2] to-[#00E5A0] shadow-[0_0_15px_rgba(0,255,178,0.2)] hover:brightness-110 transition-all"
          >
            Set Your First Goal
          </button>
        </motion.div>
      )}

      <GoalFormModal isOpen={formOpen} onClose={handleCloseModal} form={form} />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        message="This removes the goal and its progress. This action cannot be undone."
      />
    </motion.div>
  );
};
