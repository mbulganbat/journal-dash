import {
  IconBrain, IconClock, IconLayoutGrid, IconMoodSmile
} from '@tabler/icons-react';

export const TABS = [
  { id: 'overview', label: 'Overview & Coach', icon: IconBrain },
  { id: 'time', label: 'Time & Session', icon: IconClock },
  { id: 'setups', label: 'Setups & Pairs', icon: IconLayoutGrid },
  { id: 'behavior', label: 'Risk & Behavior', icon: IconMoodSmile }
];

export const PERIODS = [
  { id: 'today', label: 'Today', days: 0 },
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
  { id: '6m', label: 'Last 6 Months', days: 180 },
  { id: '1y', label: 'Last Year', days: 365 },
  { id: 'all', label: 'All Time', days: 9999 }
];
