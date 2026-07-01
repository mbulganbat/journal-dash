export interface Account {
  id: string;
  name: string;
  type: 'Funded' | 'Demo' | 'Personal';
  broker: string;
  platform: 'MT4' | 'MT5' | 'cTrader' | 'TradingView' | 'Other';
  currency: 'USD' | 'EUR' | 'GBP';
  initialBalance: number;
  isChallenge: boolean;
  profitTarget?: number; // %
  maxDailyDrawdown?: number; // %
  maxTotalDrawdown?: number; // %
}

export interface Trade {
  id: string;
  accountId: string;
  pair: string;
  date: string; // ISO string
  session: 'London' | 'NY AM' | 'NY PM' | 'Asian' | 'Overlap';
  direction: 'long' | 'short';
  entry: number;
  exit: number;
  sl: number;
  tp: number;
  lotSize: number;
  pnl: number;
  rr: number;
  setup: string;
  emotion: 'Focused' | 'Patient' | 'Neutral' | 'Rushed' | 'FOMO' | 'Unsure';
  notes: string;
  result: 'win' | 'loss' | 'breakeven';
  mistakes: string[];
  lessons: string[];
  checklistScore?: number; // Representing checklist completion percentage (0 - 100)
  screenshotUrl?: string | null;
}

export type PlanTier = 'free' | 'pro';

export interface AppSettings {
  userName: string;
  avatarUrl?: string; // base64 data URL, uploaded from Settings > Account
  currency: string;
  timezone: string;
  plan: PlanTier;
  notifications: {
    email: boolean;
    push: boolean;
    weeklyReport: boolean;
  };
  tradingPrefs: {
    defaultRisk: number;
    maxDailyDrawdown: number;
    maxOpenTrades: number;
  };
  twoFactor: boolean;
}

export interface AppContextValue {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  accounts: Account[];
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  setups: Setup[];
  addSetup: (setup: Omit<Setup, 'id'>) => void;
  updateSetup: (id: string, updates: Partial<Setup>) => void;
  deleteSetup: (id: string) => void;

  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  openManageAccounts: boolean;
  setOpenManageAccounts: (v: boolean) => void;

  openNewTrade: boolean;
  setOpenNewTrade: (v: boolean) => void;
  openImport: boolean;
  setOpenImport: (v: boolean) => void;
  editingTrade: Trade | null;
  setEditingTrade: (t: Trade | null) => void;
}

// Shared user-pickable accent color for visual identity (Setups, Goals, ...).
export type AccentColor = 'em' | 'warning' | 'purple' | 'blue';

// A goal's progress is either tracked automatically from real trade/account
// data (every metric except 'manual'), or logged by hand on the card.
export type GoalMetric = 'manual' | 'netPnl' | 'winRate' | 'totalTrades' | 'profitFactor' | 'accountBalance' | 'avgRR';

export interface Goal {
  id: string;
  title: string;
  metric: GoalMetric;
  target: number;
  current: number; // manual progress; ignored (recomputed live) for non-manual metrics
  unit: string;
  deadline: string; // ISO date
  createdAt: string; // ISO date, auto-set on creation — used to gauge pace vs deadline
  color: AccentColor;
  icon: string;
  setupId?: string; // optional: scope the metric to trades tagged with this Setup only
}

export interface Setup {
  id: string;
  name: string;
  description: string;
  rules: string[]; // entry criteria checklist for the playbook
  color: AccentColor;
  icon: string; // key into SETUP_ICONS
}

export interface HeatmapDay {
  date: Date;
  pnl: number;
  count: number;
}
