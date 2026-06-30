import React from 'react';
import { Account, Trade } from '../../types';

export type OutcomeFilter = 'all' | 'win' | 'loss';
export type AccountWithChallenge = Account & { isChallenge?: boolean };
export type StatBadge = { label: string; value: string; icon: React.ElementType; privateValue?: boolean };
export type LegendItem = { label: string; description: string; dotClass: string };
export type TradeWithExitDate = Trade & { exitDate?: string };
export type MonthlyWeek = { label: string; range: string; pnl: number };
export type MicroStats = { activeDays: number; winRate: number; profitFactor: number; totalTrades: number };
export type AccountOption = { id: string; label: string };

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
  trades: Trade[];
  pnl: number;
}

export interface WeekStats {
  start: Date;
  end: Date;
  trades: Trade[];
  netPnl: number;
  wins: number;
  losses: number;
  winLossRatio: string;
  bestAsset: string;
  bestSession: string;
}
