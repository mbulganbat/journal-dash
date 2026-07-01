import type { ElementType } from 'react';
import {
  IconCoin, IconTarget, IconChartLine, IconTrophy, IconRocket,
  IconFlag, IconShieldCheck, IconBolt, IconCalendarStats, IconStar,
  IconCircleCheck, IconClock, IconAlertTriangle, IconHourglass
} from '@tabler/icons-react';
import { GoalMetric } from '../../types';
import type { GoalStatus } from './hooks/useGoalsData';

export const GOAL_ICONS: Record<string, ElementType> = {
  IconCoin, IconTarget, IconChartLine, IconTrophy, IconRocket,
  IconFlag, IconShieldCheck, IconBolt, IconCalendarStats, IconStar
};

export const ICON_KEYS = Object.keys(GOAL_ICONS);

export const DEFAULT_ICON = 'IconTarget';

interface MetricSpec {
  label: string;
  unit: string;
  editableUnit: boolean;
  format: (value: number, unit: string) => string;
  // Whether this metric can be scoped to a single Setup's trades via the
  // "Filter by Setup" picker. False for metrics that aren't trade-attributed.
  scopable: boolean;
}

export const METRIC_META: Record<GoalMetric, MetricSpec> = {
  manual: {
    label: 'Manual / Custom',
    unit: '',
    editableUnit: true,
    format: (v, unit) => `${Math.round(v).toLocaleString()}${unit ? ` ${unit}` : ''}`,
    scopable: false
  },
  netPnl: {
    label: 'Net P&L',
    unit: '$',
    editableUnit: false,
    format: v => `${v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    scopable: true
  },
  winRate: {
    label: 'Win Rate',
    unit: '%',
    editableUnit: false,
    format: v => `${v.toFixed(0)}%`,
    scopable: true
  },
  totalTrades: {
    label: 'Total Trades',
    unit: 'trades',
    editableUnit: false,
    format: v => `${Math.round(v).toLocaleString()}`,
    scopable: true
  },
  profitFactor: {
    label: 'Profit Factor',
    unit: '×',
    editableUnit: false,
    format: v => `${v.toFixed(2)}×`,
    scopable: true
  },
  avgRR: {
    label: 'Average R:R',
    unit: 'R',
    editableUnit: false,
    format: v => `${v.toFixed(2)}R`,
    scopable: true
  },
  accountBalance: {
    label: 'Account Balance',
    unit: '$',
    editableUnit: false,
    format: v => `$${Math.round(v).toLocaleString()}`,
    scopable: false
  }
};

export const METRIC_KEYS = Object.keys(METRIC_META) as GoalMetric[];

export const DEFAULT_METRIC: GoalMetric = 'netPnl';

interface StatusSpec {
  label: string;
  hex: string;
  text: string;
  bg: string;
  border: string;
  glow: string;
  icon: ElementType;
  pulse: boolean;
}

// Static literal classes only (no `bg-${x}` interpolation) — see HANDOFF M2.
export const STATUS_META: Record<GoalStatus, StatusSpec> = {
  achieved: {
    label: 'Achieved',
    hex: '#00FFB2',
    text: 'text-[#00FFB2]',
    bg: 'bg-[#00FFB2]/10',
    border: 'border-[#00FFB2]/30',
    glow: 'rgba(0,255,178,0.18)',
    icon: IconCircleCheck,
    pulse: false
  },
  onTrack: {
    label: 'On Track',
    hex: '#00FFB2',
    text: 'text-[#00FFB2]',
    bg: 'bg-[#00FFB2]/10',
    border: 'border-[#00FFB2]/30',
    glow: 'rgba(0,255,178,0.12)',
    icon: IconClock,
    pulse: true
  },
  atRisk: {
    label: 'At Risk',
    hex: '#FFB800',
    text: 'text-[#FFB800]',
    bg: 'bg-[#FFB800]/10',
    border: 'border-[#FFB800]/30',
    glow: 'rgba(255,184,0,0.15)',
    icon: IconHourglass,
    pulse: true
  },
  overdue: {
    label: 'Overdue',
    hex: '#FF5A5A',
    text: 'text-[#FF5A5A]',
    bg: 'bg-[#FF5A5A]/10',
    border: 'border-[#FF5A5A]/30',
    glow: 'rgba(255,90,90,0.15)',
    icon: IconAlertTriangle,
    pulse: true
  }
};
