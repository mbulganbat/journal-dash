import { useState, useRef, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { Account, Trade, Setup, Goal, AppSettings } from '../../types';
import { accountsRepo } from '../../lib/db/accounts';
import { tradesRepo } from '../../lib/db/trades';
import { setupsRepo } from '../../lib/db/setups';
import { goalsRepo } from '../../lib/db/goals';
import { settingsRepo, DEFAULT_SETTINGS } from '../../lib/db/settings';
import { importLocalData } from '../../lib/db/importLocal';
import { useSyncedCollection } from './useSyncedCollection';

// Owns every piece of cloud-persisted state and its CRUD surface. The provider
// consumes this as one object; view code never talks to Supabase directly.
export function useAppData() {
  const { user } = useUser();
  const userId = user?.id;

  const accounts = useSyncedCollection<Account>(accountsRepo, 'account');
  const trades = useSyncedCollection<Trade>(tradesRepo, 'trade', { prepend: true });
  const setups = useSyncedCollection<Setup>(setupsRepo, 'setup');
  const goals = useSyncedCollection<Goal>(goalsRepo, 'goal');

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const settingsRef = useRef<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const listAll = () =>
      Promise.all([
        accountsRepo.list(),
        tradesRepo.list(),
        setupsRepo.list(),
        goalsRepo.list(),
        settingsRepo.fetch(),
      ] as const);

    (async () => {
      let [accs, trds, stps, gls, stg] = await listAll();

      // First login after the localStorage era: lift the local data up once.
      const dbEmpty = !accs.length && !trds.length && !stps.length && !gls.length && !stg;
      if (dbEmpty && (await importLocalData(userId))) {
        [accs, trds, stps, gls, stg] = await listAll();
      }
      if (cancelled) return;

      accounts.load(accs);
      trades.load(trds);
      setups.load(stps);
      goals.load(gls);
      const initial =
        stg ?? { ...DEFAULT_SETTINGS, userName: user?.fullName || DEFAULT_SETTINGS.userName };
      settingsRef.current = initial;
      setSettings(initial);
      setReady(true);
    })().catch(err => {
      if (cancelled) return;
      console.error('[db] initial load failed', err);
      toast.error('Could not load your journal from the cloud.');
      setReady(true); // fail open: an empty state beats a dead app
    });

    return () => {
      cancelled = true;
    };
    // Collection load fns are stable; refetch only when the signed-in user changes.
  }, [userId]);

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      const next = { ...settingsRef.current, ...updates };
      settingsRef.current = next;
      setSettings(next);
      if (userId) {
        settingsRepo.save(next, userId).catch(err => {
          console.error('[db] settings write failed', err);
          toast.error('Could not sync settings to the cloud.');
        });
      }
    },
    [userId]
  );

  const addAccount = useCallback(
    (data: Omit<Account, 'id'>) =>
      accounts.add({ ...data, isChallenge: data.isChallenge ?? false, id: crypto.randomUUID() }),
    [accounts.add]
  );

  // The DB cascades account→trades on delete; mirror it locally.
  const deleteAccount = useCallback(
    (id: string) => {
      accounts.remove(id);
      trades.mutateLocal(ts => ts.filter(t => t.accountId !== id));
    },
    [accounts.remove, trades.mutateLocal]
  );

  const addTrade = useCallback(
    (data: Omit<Trade, 'id'>) => trades.add({ ...data, id: crypto.randomUUID() }),
    [trades.add]
  );

  const addSetup = useCallback(
    (data: Omit<Setup, 'id'>) => setups.add({ ...data, id: crypto.randomUUID() }),
    [setups.add]
  );

  // The DB nulls goals.setup_id when their setup is deleted; mirror it locally.
  const deleteSetup = useCallback(
    (id: string) => {
      setups.remove(id);
      goals.mutateLocal(gs => gs.map(g => (g.setupId === id ? { ...g, setupId: undefined } : g)));
    },
    [setups.remove, goals.mutateLocal]
  );

  const addGoal = useCallback(
    (data: Omit<Goal, 'id' | 'createdAt'>) =>
      goals.add({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }),
    [goals.add]
  );

  return {
    ready,
    settings,
    updateSettings,
    accounts: accounts.items,
    addAccount,
    updateAccount: accounts.update,
    deleteAccount,
    trades: trades.items,
    addTrade,
    updateTrade: trades.update,
    deleteTrade: trades.remove,
    setups: setups.items,
    addSetup,
    updateSetup: setups.update,
    deleteSetup,
    goals: goals.items,
    addGoal,
    updateGoal: goals.update,
    deleteGoal: goals.remove,
  };
}
