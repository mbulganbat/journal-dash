import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useAppContext } from '../../../context/AppContext';
import { scaleIn } from '../../../lib/animations';
import { CustomDatePicker } from '../../../components/ui/DatePicker';
import { CustomDropdown } from '../../../components/ui/Dropdown';
import { GoalMetric } from '../../../types';
import { ACCENT_COLORS, ACCENT_COLOR_KEYS } from '../../../lib/accentColors';
import { GOAL_ICONS, ICON_KEYS, METRIC_META, METRIC_KEYS } from '../constants';
import { GoalFormState } from '../hooks/useGoalForm';

const inputClass = "w-full bg-bg-3 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-text-1 focus:outline-none focus:border-em/50 transition-colors";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  form: GoalFormState;
}

export const GoalFormModal = ({ isOpen, onClose, form }: Props) => {
  const { setups } = useAppContext();
  const {
    editingId, title, setTitle, metric, setMetric,
    target, setTarget, unit, setUnit, current, setCurrent,
    deadline, setDeadline, color, setColor, icon, setIcon,
    setupId, setSetupId, handleSave
  } = form;

  const metricSpec = METRIC_META[metric];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            variants={scaleIn} initial="hidden" animate="show" exit="hidden"
            className="relative w-full max-w-lg max-h-[88vh] bg-bg-2 border border-white/[0.08] rounded-card shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/[0.06] flex justify-between items-center shrink-0">
              <h2 className="text-[18px] font-bold text-text-1">{editingId ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={onClose} className="p-2 text-text-3 hover:text-text-1 transition-colors rounded-xl hover:bg-white/[0.04]">
                <IconX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
                <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Goal Title</label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Reach $50,000 Net Profit" className={inputClass}
                  autoFocus
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">Track Progress From</label>
                <div className="grid grid-cols-2 gap-2">
                  {METRIC_KEYS.map(key => {
                    const isSelected = metric === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMetric(key as GoalMetric)}
                        className={`px-3 py-2.5 rounded-xl border text-[12px] font-semibold transition-colors text-left ${
                          isSelected ? 'bg-em/10 border-em/30 text-em' : 'bg-bg-3 border-white/[0.06] text-text-2 hover:border-white/[0.15]'
                        }`}
                      >
                        {METRIC_META[key].label}
                      </motion.button>
                    );
                  })}
                </div>
                {metric !== 'manual' && (
                  <p className="text-[11px] text-text-3 mt-2">Progress updates automatically from your logged trades.</p>
                )}
              </motion.div>

              {metricSpec.scopable && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                  <CustomDropdown
                    label="Filter by Setup"
                    value={setupId}
                    options={[{ value: '', label: 'All Trades' }, ...setups.map(s => ({ value: s.id, label: s.name }))]}
                    onChange={setSetupId}
                  />
                  {setupId && (
                    <p className="text-[11px] text-text-3 mt-2">
                      Only trades logged with the "{setups.find(s => s.id === setupId)?.name}" setup count toward this goal.
                    </p>
                  )}
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }} className={`grid ${metric === 'manual' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                <div>
                  <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">
                    Target {metricSpec.unit && `(${metricSpec.unit})`}
                  </label>
                  <input
                    type="number" step="any" value={target} onChange={e => setTarget(e.target.value)}
                    placeholder="0" className={inputClass}
                  />
                </div>
                {metric === 'manual' && (
                  <div>
                    <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Unit</label>
                    <input
                      type="text" value={unit} onChange={e => setUnit(e.target.value)}
                      placeholder="e.g. hrs, books" className={inputClass}
                    />
                  </div>
                )}
              </motion.div>

              {metric === 'manual' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
                  <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Current Progress</label>
                  <input
                    type="number" step="any" value={current} onChange={e => setCurrent(e.target.value)}
                    placeholder="0" className={inputClass}
                  />
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
                <CustomDatePicker date={deadline} setDate={setDeadline} label="Deadline" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">Accent Color</label>
                <div className="flex gap-3">
                  {ACCENT_COLOR_KEYS.map(key => {
                    const spec = ACCENT_COLORS[key];
                    const isSelected = color === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setColor(key)}
                        title={spec.label}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: spec.hex,
                          boxShadow: isSelected ? `0 0 0 2px #0C0C0E, 0 0 0 4px ${spec.hex}` : 'none'
                        }}
                      >
                        {isSelected && <IconCheck size={16} className="text-black" stroke={3} />}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_KEYS.map(key => {
                    const IconComp = GOAL_ICONS[key];
                    const isSelected = icon === key;
                    const spec = ACCENT_COLORS[color];
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setIcon(key)}
                        className={`aspect-square rounded-xl border flex items-center justify-center transition-colors ${
                          isSelected ? `${spec.bg} ${spec.border}` : 'bg-bg-3 border-white/[0.06] hover:border-white/[0.15]'
                        }`}
                      >
                        <IconComp size={20} className={isSelected ? spec.text : 'text-text-3'} />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3 shrink-0">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-text-2 hover:bg-white/[0.04] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-xl text-sm font-bold text-black bg-em hover:bg-em-2 transition-colors"
              >
                {editingId ? 'Update Goal' : 'Save Goal'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
