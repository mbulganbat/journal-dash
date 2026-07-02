import { Trade } from '../../types';
import { createRepo } from './repo';

interface TradeRow {
  id: string;
  account_id: string;
  pair: string;
  date: string;
  session: string;
  direction: string;
  entry: number;
  exit: number;
  sl: number;
  tp: number;
  lot_size: number;
  pnl: number;
  rr: number;
  setup: string;
  emotion: string;
  notes: string;
  result: string;
  mistakes: string[];
  lessons: string[];
  checklist_score: number | null;
  screenshot_url: string | null;
}

const fromRow = (r: TradeRow): Trade => ({
  id: r.id,
  accountId: r.account_id,
  pair: r.pair,
  date: r.date,
  session: r.session as Trade['session'],
  direction: r.direction as Trade['direction'],
  entry: r.entry,
  exit: r.exit,
  sl: r.sl,
  tp: r.tp,
  lotSize: r.lot_size,
  pnl: r.pnl,
  rr: r.rr,
  setup: r.setup,
  emotion: r.emotion as Trade['emotion'],
  notes: r.notes,
  result: r.result as Trade['result'],
  mistakes: r.mistakes,
  lessons: r.lessons,
  checklistScore: r.checklist_score ?? undefined,
  screenshotUrl: r.screenshot_url,
});

const toRow = (t: Trade): TradeRow => ({
  id: t.id,
  account_id: t.accountId,
  pair: t.pair,
  date: t.date,
  session: t.session,
  direction: t.direction,
  entry: t.entry,
  exit: t.exit,
  sl: t.sl,
  tp: t.tp,
  lot_size: t.lotSize,
  pnl: t.pnl,
  rr: t.rr,
  setup: t.setup,
  emotion: t.emotion,
  notes: t.notes,
  result: t.result,
  mistakes: t.mistakes,
  lessons: t.lessons,
  checklist_score: t.checklistScore ?? null,
  screenshot_url: t.screenshotUrl ?? null,
});

// Newest-first to match the app's prepend-on-add convention.
export const tradesRepo = createRepo('trades', fromRow, toRow, {
  orderBy: 'date',
  ascending: false,
});
