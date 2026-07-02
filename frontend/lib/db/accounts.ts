import { Account } from '../../types';
import { createRepo } from './repo';

interface AccountRow {
  id: string;
  name: string;
  type: string;
  broker: string;
  platform: string;
  currency: string;
  initial_balance: number;
  is_challenge: boolean;
  profit_target: number | null;
  max_daily_drawdown: number | null;
  max_total_drawdown: number | null;
}

const fromRow = (r: AccountRow): Account => ({
  id: r.id,
  name: r.name,
  type: r.type as Account['type'],
  broker: r.broker,
  platform: r.platform as Account['platform'],
  currency: r.currency as Account['currency'],
  initialBalance: r.initial_balance,
  isChallenge: r.is_challenge,
  profitTarget: r.profit_target ?? undefined,
  maxDailyDrawdown: r.max_daily_drawdown ?? undefined,
  maxTotalDrawdown: r.max_total_drawdown ?? undefined,
});

const toRow = (a: Account): AccountRow => ({
  id: a.id,
  name: a.name,
  type: a.type,
  broker: a.broker,
  platform: a.platform,
  currency: a.currency,
  initial_balance: a.initialBalance,
  is_challenge: a.isChallenge,
  profit_target: a.profitTarget ?? null,
  max_daily_drawdown: a.maxDailyDrawdown ?? null,
  max_total_drawdown: a.maxTotalDrawdown ?? null,
});

export const accountsRepo = createRepo('accounts', fromRow, toRow);
