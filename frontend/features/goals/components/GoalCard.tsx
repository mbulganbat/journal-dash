import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { premiumHoverProps, ProgressBar } from '../../../components/ui/Shared';
import { useCountUp } from '../../../hooks/useCountUp';
import { fadeUp } from '../../../lib/animations';
import { ACCENT_COLORS, DEFAULT_ACCENT_COLOR } from '../../../lib/accentColors';
import { GOAL_ICONS, METRIC_META, STATUS_META } from '../constants';
import { GoalStat } from '../hooks/useGoalsData';

interface Props {
  goal: GoalStat;
  onEdit: () => void;
  onDelete: () => void;
  onLogProgress: (newCurrent: number) => void;
}

export const GoalCard = ({ goal, onEdit, onDelete, onLogProgress }: Props) => {
  const [logAmount, setLogAmount] = useState('');
  const statusSpec = STATUS_META[goal.status];
  const accentSpec = ACCENT_COLORS[goal.color] || ACCENT_COLORS[DEFAULT_ACCENT_COLOR];
  const StatusIcon = statusSpec.icon;
  const Icon = GOAL_ICONS[goal.icon] || GOAL_ICONS.IconTarget;
  const metricSpec = METRIC_META[goal.metric];
  const animatedProgress = useCountUp(goal.progressPct, 900);

  const daysText = goal.status === 'achieved'
    ? 'Achieved'
    : goal.status === 'overdue'
      ? `${Math.abs(goal.daysLeft)} ${Math.abs(goal.daysLeft) === 1 ? 'day' : 'days'} overdue`
      : goal.daysLeft === 0
        ? 'Due today'
        : `${goal.daysLeft} ${goal.daysLeft === 1 ? 'day' : 'days'} left`;

  const handleLog = () => {
    const amount = Number(logAmount);
    if (!logAmount || isNaN(amount) || amount === 0) return;
    onLogProgress(goal.current + amount);
    setLogAmount('');
  };

  return (
    <motion.div
      layout
      variants={fadeUp}
      {...premiumHoverProps}
      className="group relative bg-bg-2 border border-white/[0.06] rounded-card overflow-hidden"
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl pointer-events-none"
        style={{ background: accentSpec.glow }}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl ${accentSpec.bg} border ${accentSpec.border} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={accentSpec.text} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-text-1 truncate">{goal.title}</h3>
              <p className="text-[11px] text-text-3 truncate">{metricSpec.label}{goal.setupName ? ` · ${goal.setupName}` : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="p-1.5 text-text-3 hover:text-text-1 transition-colors rounded-lg hover:bg-white/[0.06]">
              <IconEdit size={15} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-text-3 hover:text-danger transition-colors rounded-lg hover:bg-white/[0.06]">
              <IconTrash size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <motion.span
            animate={statusSpec.pulse ? { scale: [1, 1.03, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${statusSpec.bg} ${statusSpec.border} ${statusSpec.text}`}
          >
            <StatusIcon size={12} />
            {statusSpec.label}
          </motion.span>
          <span className={`text-[11px] font-medium ${goal.status === 'overdue' ? 'text-danger' : 'text-text-3'}`}>
            {daysText}
          </span>
        </div>

        <div className="mb-1.5 flex items-end justify-between">
          <span className="text-[13px] text-text-2">
            <span className="font-bold text-text-1">{metricSpec.format(goal.current, goal.unit)}</span>
            {' '}/ {metricSpec.format(goal.target, goal.unit)}
          </span>
          <span className={`text-[13px] font-bold ${statusSpec.text}`}>{Math.round(animatedProgress)}%</span>
        </div>
        <ProgressBar percentage={goal.progressPct} colorClass={
          goal.status === 'overdue' ? 'bg-danger' : goal.status === 'atRisk' ? 'bg-warning' : 'bg-em'
        } />

        <AnimatePresence initial={false}>
          {goal.metric === 'manual' && goal.status !== 'achieved' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                <input
                  type="number" value={logAmount} onChange={e => setLogAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLog()}
                  placeholder={`+ Log ${goal.unit}`}
                  className="flex-1 min-w-0 bg-bg-3 border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-text-1 focus:outline-none focus:border-em/50 transition-colors"
                />
                <button
                  onClick={handleLog}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-em/10 border border-em/30 text-em text-[11px] font-bold hover:bg-em/20 transition-colors shrink-0"
                >
                  <IconPlus size={12} /> Log
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
          <span className="text-[10px] uppercase text-text-3 tracking-wide">Deadline</span>
          <span className="text-[11px] text-text-2 font-medium">{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </motion.div>
  );
};
