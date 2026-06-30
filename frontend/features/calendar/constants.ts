import { OutcomeFilter } from './types';

export const outcomeFilters: { label: string; value: OutcomeFilter }[] = [
  { label: 'All Trades', value: 'all' },
  { label: 'Wins Only', value: 'win' },
  { label: 'Losses Only', value: 'loss' }
];

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
