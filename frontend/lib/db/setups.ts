import { Setup } from '../../types';
import { createRepo } from './repo';

interface SetupRow {
  id: string;
  name: string;
  description: string;
  rules: string[];
  color: string;
  icon: string;
}

const fromRow = (r: SetupRow): Setup => ({
  id: r.id,
  name: r.name,
  description: r.description,
  rules: r.rules,
  color: r.color as Setup['color'],
  icon: r.icon,
});

const toRow = (s: Setup): SetupRow => ({
  id: s.id,
  name: s.name,
  description: s.description,
  rules: s.rules,
  color: s.color,
  icon: s.icon,
});

export const setupsRepo = createRepo('setups', fromRow, toRow);
