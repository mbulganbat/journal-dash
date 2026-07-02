import { Account, Trade, Setup, Goal, AppSettings } from '../../types';
import { accountsRepo } from './accounts';
import { tradesRepo } from './trades';
import { setupsRepo } from './setups';
import { goalsRepo } from './goals';
import { settingsRepo, DEFAULT_SETTINGS } from './settings';

function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// One-time lift of the pre-Supabase localStorage data into the database.
// The caller only invokes this when the DB is completely empty for this user,
// so it can never merge a stale local copy into an existing cloud journal.
// Returns true if anything was uploaded.
export async function importLocalData(userId: string): Promise<boolean> {
  const accounts = readLocal<Account[]>('lumex_accounts') ?? [];
  const allTrades = readLocal<Trade[]>('lumex_trades') ?? [];
  const setups = readLocal<Setup[]>('lumex_setups') ?? [];
  const goals = readLocal<Goal[]>('lumex_goals') ?? [];
  const settings = readLocal<Partial<AppSettings>>('lumex_settings');

  // FK safety: drop trades whose account is gone, unlink goals whose setup is gone.
  const accountIds = new Set(accounts.map(a => a.id));
  const trades = allTrades.filter(t => accountIds.has(t.accountId));
  const setupIds = new Set(setups.map(s => s.id));
  const safeGoals = goals.map(g =>
    g.setupId && !setupIds.has(g.setupId) ? { ...g, setupId: undefined } : g
  );

  const hasData =
    accounts.length > 0 || trades.length > 0 || setups.length > 0 || safeGoals.length > 0;
  if (!hasData) return false;

  // Parents before children (trades → accounts, goals → setups).
  await accountsRepo.upsertMany(accounts);
  await tradesRepo.upsertMany(trades);
  await setupsRepo.upsertMany(setups);
  await goalsRepo.upsertMany(safeGoals);

  if (settings) {
    await settingsRepo.save(
      {
        ...DEFAULT_SETTINGS,
        ...settings,
        notifications: { ...DEFAULT_SETTINGS.notifications, ...settings.notifications },
        tradingPrefs: { ...DEFAULT_SETTINGS.tradingPrefs, ...settings.tradingPrefs },
      },
      userId
    );
  }

  return true;
}
