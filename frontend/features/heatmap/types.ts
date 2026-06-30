import { Trade } from '../../types';

export interface Props {
  trades: Trade[];
  activeAccountId: string | null;
}

export interface HeatmapCell {
  date: Date;
  pnl: number;
  count: number;
  isFuture: boolean;
  dominantEmotion: string;
}

export type LegendFilter = 'profit' | 'loss' | 'neutral';
