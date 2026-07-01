import { useState } from 'react';
import { addMonths } from 'date-fns';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/AppContext';
import { Goal, GoalMetric, AccentColor } from '../../../types';
import { DEFAULT_ACCENT_COLOR } from '../../../lib/accentColors';
import { METRIC_META, DEFAULT_METRIC, DEFAULT_ICON } from '../constants';

const defaultDeadline = () => addMonths(new Date(), 1);

export const useGoalForm = (onSuccess: () => void) => {
  const { addGoal, updateGoal } = useAppContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [metric, setMetricState] = useState<GoalMetric>(DEFAULT_METRIC);
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState(METRIC_META[DEFAULT_METRIC].unit);
  const [current, setCurrent] = useState('0');
  const [deadline, setDeadline] = useState<Date>(defaultDeadline());
  const [color, setColor] = useState<AccentColor>(DEFAULT_ACCENT_COLOR);
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [setupId, setSetupId] = useState('');

  // Switching metric resets the unit to that metric's fixed unit (manual stays
  // editable) and clears the setup filter for metrics that can't be scoped.
  const setMetric = (m: GoalMetric) => {
    setMetricState(m);
    setUnit(METRIC_META[m].unit);
    if (!METRIC_META[m].scopable) setSetupId('');
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setMetric(DEFAULT_METRIC);
    setTarget('');
    setCurrent('0');
    setDeadline(defaultDeadline());
    setColor(DEFAULT_ACCENT_COLOR);
    setIcon(DEFAULT_ICON);
    setSetupId('');
  };

  const loadGoal = (goal: Goal) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setMetricState(goal.metric);
    setTarget(String(goal.target));
    setUnit(goal.unit);
    setCurrent(String(goal.current));
    setDeadline(new Date(goal.deadline));
    setColor(goal.color || DEFAULT_ACCENT_COLOR);
    setIcon(goal.icon);
    setSetupId(goal.setupId || '');
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const numericTarget = Number(target);

    if (!trimmedTitle) {
      toast.error('Give the goal a title');
      return;
    }
    if (!target || isNaN(numericTarget) || numericTarget <= 0) {
      toast.error('Set a target greater than zero');
      return;
    }

    const goalData = {
      title: trimmedTitle,
      metric,
      target: numericTarget,
      current: metric === 'manual' ? Number(current) || 0 : 0,
      unit: metric === 'manual' ? (unit.trim() || 'units') : METRIC_META[metric].unit,
      deadline: deadline.toISOString(),
      color,
      icon,
      setupId: METRIC_META[metric].scopable && setupId ? setupId : undefined
    };

    if (editingId) {
      updateGoal(editingId, goalData);
      toast.success('Goal updated');
    } else {
      addGoal(goalData);
      toast.success('Goal added');
    }

    onSuccess();
    resetForm();
  };

  return {
    editingId,
    title, setTitle,
    metric, setMetric,
    target, setTarget,
    unit, setUnit,
    current, setCurrent,
    deadline, setDeadline,
    color, setColor,
    icon, setIcon,
    setupId, setSetupId,
    resetForm,
    loadGoal,
    handleSave
  };
};

export type GoalFormState = ReturnType<typeof useGoalForm>;
