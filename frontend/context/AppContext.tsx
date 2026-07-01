import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trade, AppSettings, AppContextValue, Account, Setup, Goal } from '../types';
import { mockTrades, mockAccounts, mockSetups, mockGoals } from '../data/mockTrades';

const defaultSettings: AppSettings = {
  userName: "Alex",
  currency: "USD",
  timezone: "UTC",
  plan: "free",
  notifications: {
    email: true,
    push: false,
    weeklyReport: true
  },
  tradingPrefs: {
    defaultRisk: 1,
    maxDailyDrawdown: 3,
    maxOpenTrades: 3
  },
  twoFactor: false
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Safely read + parse a JSON value from localStorage. Returns `fallback` if the
// key is missing, the JSON is corrupt, or it fails the optional validator.
function loadFromStorage<T>(key: string, fallback: T, validate?: (v: unknown) => boolean): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    const parsed = JSON.parse(saved);
    if (validate && !validate(parsed)) {
      console.warn(`[Storage] '${key}' failed validation, using fallback.`);
      return fallback;
    }
    return parsed as T;
  } catch (e) {
    console.error(`[Storage] Failed to parse '${key}', using fallback.`, e);
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const loaded = loadFromStorage<Account[]>('lumex_accounts', mockAccounts, Array.isArray);
    return loaded.map(account => ({
      ...account,
      isChallenge: account.isChallenge ?? false
    }));
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(() => {
    const saved = localStorage.getItem('lumex_selected_account');
    return saved && saved !== 'null' ? saved : null;
  });

  const [trades, setTrades] = useState<Trade[]>(() =>
    loadFromStorage<Trade[]>('lumex_trades', mockTrades, Array.isArray)
  );

  const [setups, setSetups] = useState<Setup[]>(() =>
    loadFromStorage<Setup[]>('lumex_setups', mockSetups, Array.isArray)
  );

  const [goals, setGoals] = useState<Goal[]>(() =>
    loadFromStorage<Goal[]>('lumex_goals', mockGoals, Array.isArray)
  );

  const [settings, setSettings] = useState<AppSettings>(() => {
    // Merge stored settings over defaults so newly-added fields are never undefined.
    const stored = loadFromStorage<Partial<AppSettings>>(
      'lumex_settings',
      {},
      v => typeof v === 'object' && v !== null
    );
    return {
      ...defaultSettings,
      ...stored,
      notifications: { ...defaultSettings.notifications, ...stored.notifications },
      tradingPrefs: { ...defaultSettings.tradingPrefs, ...stored.tradingPrefs },
    };
  });

  const [openManageAccounts, setOpenManageAccounts] = useState(false);
  const [openNewTrade, setOpenNewTrade] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('lumex_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('lumex_selected_account', selectedAccountId || 'null');
  }, [selectedAccountId]);

  useEffect(() => {
    localStorage.setItem('lumex_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('lumex_setups', JSON.stringify(setups));
  }, [setups]);

  useEffect(() => {
    localStorage.setItem('lumex_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('lumex_settings', JSON.stringify(settings));
  }, [settings]);

  const addAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      isChallenge: accData.isChallenge ?? false,
      id: crypto.randomUUID()
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setTrades(prev => prev.filter(t => t.accountId !== id));
    if (selectedAccountId === id) setSelectedAccountId(null);
  };

  const addSetup = (setupData: Omit<Setup, 'id'>) => {
    const newSetup: Setup = { ...setupData, id: crypto.randomUUID() };
    setSetups(prev => [...prev, newSetup]);
  };

  const updateSetup = (id: string, updates: Partial<Setup>) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSetup = (id: string) => {
    setSetups(prev => prev.filter(s => s.id !== id));
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = { ...goalData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addTrade = (tradeData: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...tradeData,
      id: crypto.randomUUID()
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  const updateTrade = (id: string, updates: Partial<Trade>) => {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{
      trades,
      addTrade,
      updateTrade,
      deleteTrade,
      settings,
      updateSettings,
      accounts,
      selectedAccountId,
      setSelectedAccountId,
      addAccount,
      updateAccount,
      deleteAccount,
      setups,
      addSetup,
      updateSetup,
      deleteSetup,
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      openManageAccounts,
      setOpenManageAccounts,
      openNewTrade,
      setOpenNewTrade,
      openImport,
      setOpenImport,
      editingTrade,
      setEditingTrade
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
