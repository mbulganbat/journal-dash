import { Goal } from '../../types';
import { createRepo } from './repo';

interface GoalRow {
  id: string;
  title: string;
  metric: string;
  target: number;
  current_value: number;
  unit: string;
  deadline: string;
  color: string;
  icon: string;
  setup_id: string | null;
  created_at: string;
}

const fromRow = (r: GoalRow): Goal => ({
  id: r.id,
  title: r.title,
  metric: r.metric as Goal['metric'],
  target: r.target,
  current: r.current_value,
  unit: r.unit,
  deadline: r.deadline,
  createdAt: r.created_at,
  color: r.color as Goal['color'],
  icon: r.icon,
  setupId: r.setup_id ?? undefined,
});

const toRow = (g: Goal): GoalRow => ({
  id: g.id,
  title: g.title,
  metric: g.metric,
  target: g.target,
  current_value: g.current,
  unit: g.unit,
  deadline: g.deadline,
  color: g.color,
  icon: g.icon,
  setup_id: g.setupId ?? null,
  created_at: g.createdAt,
});

export const goalsRepo = createRepo('goals', fromRow, toRow);
