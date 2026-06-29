import { Trade, Account } from '../types';

/**
 * Single source of truth for "which trades are currently in view".
 *
 * Rule:
 *  - A specific account selected  -> only that account's trades.
 *  - "All accounts" (null)        -> all NON-challenge accounts combined.
 *    Challenge accounts are excluded from consolidated totals unless selected
 *    directly (matches the ManageAccounts "Challenge Account" description).
 */
export const selectActiveTrades = (
  trades: Trade[],
  accounts: Account[],
  selectedAccountId: string | null
): Trade[] => {
  if (selectedAccountId) {
    return trades.filter(t => t.accountId === selectedAccountId);
  }
  const standardIds = new Set(
    accounts.filter(a => !a.isChallenge).map(a => a.id)
  );
  return trades.filter(t => standardIds.has(t.accountId));
};
