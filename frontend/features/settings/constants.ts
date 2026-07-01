import { IconUser, IconBell, IconAdjustmentsHorizontal, IconCrown } from '@tabler/icons-react';

export const SECTIONS = [
  { key: 'Account', icon: IconUser },
  { key: 'Notifications', icon: IconBell },
  { key: 'Trading Prefs', icon: IconAdjustmentsHorizontal },
  { key: 'Subscription', icon: IconCrown }
] as const;

export type SectionKey = typeof SECTIONS[number]['key'];

export const FREE_TRADE_LIMIT = 15;

interface ComparisonRow {
  label: string;
  free: string | boolean;
  pro: string | boolean;
}

// Feature comparison shown on the Subscription tab. Grounded in real gated
// features already present elsewhere in the app (AI insights, compliance
// export, multi-account/setup/goal support) rather than invented ones.
export const PLAN_COMPARISON: ComparisonRow[] = [
  { label: 'Trade Log', free: `${FREE_TRADE_LIMIT} trades`, pro: 'Unlimited' },
  { label: 'Trading Accounts', free: '1 account', pro: 'Unlimited' },
  { label: 'Setups Playbook', free: '2 setups', pro: 'Unlimited' },
  { label: 'Active Goals', free: '1 goal', pro: 'Unlimited' },
  { label: 'AI Trade Insights', free: false, pro: true },
  { label: 'Compliance Export', free: false, pro: true },
  { label: 'Priority Support', free: false, pro: true }
];
