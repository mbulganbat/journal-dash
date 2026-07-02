import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trade, AppContextValue } from '../types';
import { useAppData } from './hooks/useAppData';

// Exported so DemoProvider can supply the same context with canned data.
export const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const data = useAppData();

  // Which account the UI is scoped to — a device-local view preference, so it
  // stays in localStorage rather than the cloud.
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(() => {
    const saved = localStorage.getItem('lumex_selected_account');
    return saved && saved !== 'null' ? saved : null;
  });

  useEffect(() => {
    localStorage.setItem('lumex_selected_account', selectedAccountId || 'null');
  }, [selectedAccountId]);

  // Drop a stale selection (account deleted on another device / gone from the cloud).
  useEffect(() => {
    if (data.ready && selectedAccountId && !data.accounts.some(a => a.id === selectedAccountId)) {
      setSelectedAccountId(null);
    }
  }, [data.ready, data.accounts, selectedAccountId]);

  const [openManageAccounts, setOpenManageAccounts] = useState(false);
  const [openNewTrade, setOpenNewTrade] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const deleteAccount = (id: string) => {
    data.deleteAccount(id);
    if (selectedAccountId === id) setSelectedAccountId(null);
  };

  if (!data.ready) {
    return (
      <div className="min-h-screen bg-bg-0 flex items-center justify-center">
        <div className="text-text-2 text-sm animate-pulse">Loading your journal…</div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        trades: data.trades,
        addTrade: data.addTrade,
        updateTrade: data.updateTrade,
        deleteTrade: data.deleteTrade,
        settings: data.settings,
        updateSettings: data.updateSettings,
        accounts: data.accounts,
        selectedAccountId,
        setSelectedAccountId,
        addAccount: data.addAccount,
        updateAccount: data.updateAccount,
        deleteAccount,
        setups: data.setups,
        addSetup: data.addSetup,
        updateSetup: data.updateSetup,
        deleteSetup: data.deleteSetup,
        goals: data.goals,
        addGoal: data.addGoal,
        updateGoal: data.updateGoal,
        deleteGoal: data.deleteGoal,
        openManageAccounts,
        setOpenManageAccounts,
        openNewTrade,
        setOpenNewTrade,
        openImport,
        setOpenImport,
        editingTrade,
        setEditingTrade,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
