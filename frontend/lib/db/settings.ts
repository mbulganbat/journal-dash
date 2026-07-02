import { AppSettings } from '../../types';
import { supabase } from '../supabase';

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Trader',
  currency: 'USD',
  timezone: 'UTC',
  plan: 'free',
  notifications: {
    email: true,
    push: false,
    weeklyReport: true,
  },
  tradingPrefs: {
    defaultRisk: 1,
    maxDailyDrawdown: 3,
    maxOpenTrades: 3,
  },
  twoFactor: false,
};

interface SettingsRow {
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  currency: string;
  timezone: string;
  plan: string;
  notifications: AppSettings['notifications'];
  trading_prefs: AppSettings['tradingPrefs'];
  two_factor: boolean;
}

// Merge over defaults so fields added after a row was saved are never undefined.
const fromRow = (r: SettingsRow): AppSettings => ({
  userName: r.user_name,
  avatarUrl: r.avatar_url ?? undefined,
  currency: r.currency,
  timezone: r.timezone,
  plan: r.plan as AppSettings['plan'],
  notifications: { ...DEFAULT_SETTINGS.notifications, ...r.notifications },
  tradingPrefs: { ...DEFAULT_SETTINGS.tradingPrefs, ...r.trading_prefs },
  twoFactor: r.two_factor,
});

// Settings is a single row per user, so the repo shape differs from the
// collections: fetch-maybe-one + save. The Clerk user id must be supplied
// explicitly because upsert needs the PK value to detect conflicts.
export const settingsRepo = {
  async fetch(): Promise<AppSettings | null> {
    const { data, error } = await supabase.from('settings').select('*').maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as SettingsRow) : null;
  },

  async save(s: AppSettings, userId: string): Promise<void> {
    const row: SettingsRow = {
      user_id: userId,
      user_name: s.userName,
      avatar_url: s.avatarUrl ?? null,
      currency: s.currency,
      timezone: s.timezone,
      plan: s.plan,
      notifications: s.notifications,
      trading_prefs: s.tradingPrefs,
      two_factor: s.twoFactor,
    };
    const { error } = await supabase.from('settings').upsert(row);
    if (error) throw error;
  },
};
