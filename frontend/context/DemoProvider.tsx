import React, { useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { AppContext } from './AppContext';
import { Trade } from '../types';
import { mockTrades, mockAccounts, mockSetups, mockGoals } from '../data/mockTrades';
import { DEFAULT_SETTINGS } from '../lib/db/settings';

// Read-only tour of the app: the real UI over canned sample data, no cloud.
// Every data mutator funnels into the same blocker, so nothing a visitor
// does in the demo is saved anywhere. UI-only state (panels, modals, the
// account filter) stays fully interactive.
// Note: forms also fire their own short-lived optimistic success toasts;
// this notice outlives them (3.5s, deduped by id) so the demo message
// always has the last word.
const blockWrite = () => {
  toast('Demo mode — sign in to make it yours', { icon: '🔒', id: 'demo-block', duration: 3500 });
};

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [openManageAccounts, setOpenManageAccounts] = useState(false);
  const [openNewTrade, setOpenNewTrade] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  return (
    <AppContext.Provider
      value={{
        trades: mockTrades,
        addTrade: blockWrite,
        updateTrade: blockWrite,
        deleteTrade: blockWrite,
        settings: { ...DEFAULT_SETTINGS, userName: 'Demo Trader', plan: 'pro' },
        updateSettings: blockWrite,
        accounts: mockAccounts,
        selectedAccountId,
        setSelectedAccountId,
        addAccount: blockWrite,
        updateAccount: blockWrite,
        deleteAccount: blockWrite,
        setups: mockSetups,
        addSetup: blockWrite,
        updateSetup: blockWrite,
        deleteSetup: blockWrite,
        goals: mockGoals,
        addGoal: blockWrite,
        updateGoal: blockWrite,
        deleteGoal: blockWrite,
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
