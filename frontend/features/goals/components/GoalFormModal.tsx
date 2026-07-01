import { motion } from 'framer-motion';
import { useAppContext } from '../../../context/AppContext';
import { FormModal } from '../../../components/ui/FormModal';
import { IconPicker } from '../../../components/ui/IconPicker';
import { ColorPicker } from '../../../components/ui/ColorPicker';
import { CustomDatePicker } from '../../../components/ui/DatePicker';
import { CustomDropdown } from '../../../components/ui/Dropdown';
import { GoalMetric } from '../../../types';
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? 'Edit Goal' : 'New Goal'}
      saveLabel={editingId ? 'Update Goal' : 'Save Goal'}
      onSave={handleSave}
    >
      <div>
        <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Goal Title</label>
        <input
          type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Reach $50,000 Net Profit" className={inputClass}
          autoFocus
        />
      </div>

      <div>
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
      </div>

      {metricSpec.scopable && (
        <div>
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
        </div>
      )}

      <div className={`grid ${metric === 'manual' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
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
      </div>

      {metric === 'manual' && (
        <div>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Current Progress</label>
          <input
            type="number" step="any" value={current} onChange={e => setCurrent(e.target.value)}
            placeholder="0" className={inputClass}
          />
        </div>
      )}

      <CustomDatePicker date={deadline} setDate={setDeadline} label="Deadline" />
      <ColorPicker value={color} onChange={setColor} />
      <IconPicker icons={GOAL_ICONS} iconKeys={ICON_KEYS} value={icon} onChange={setIcon} accentColor={color} />
    </FormModal>
  );
};
