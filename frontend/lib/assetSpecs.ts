import { Trade } from '../types';

export interface AssetSpec {
  multiplier: number;
  pipDecimal: number;
}

// Canonical contract specs. Single source of truth for P&L / pip math.
export const ASSET_SPECS: Record<string, AssetSpec> = {
  EURUSD: { multiplier: 100000, pipDecimal: 4 },
  GBPUSD: { multiplier: 100000, pipDecimal: 4 },
  AUDUSD: { multiplier: 100000, pipDecimal: 4 },
  USDCAD: { multiplier: 100000, pipDecimal: 4 },
  USDJPY: { multiplier: 1000, pipDecimal: 2 },
  XAUUSD: { multiplier: 100, pipDecimal: 1 }, // Gold: $1 move on 1 lot = $100
  XAGUSD: { multiplier: 5000, pipDecimal: 2 }, // Silver: $1 move on 1 lot = $5000
  USOIL: { multiplier: 1000, pipDecimal: 2 }, // Crude oil
  NAS100: { multiplier: 1, pipDecimal: 1 },
  SPX500: { multiplier: 1, pipDecimal: 1 },
  BTCUSD: { multiplier: 1, pipDecimal: 0 }, // Bitcoin: 1 lot = 1 BTC, $1 move on 1 lot = $1, 1 pip = $1
};

// Resolve a spec for any symbol, using sensible heuristics for unknown symbols
// so a 6-letter FX pair still gets the right multiplier instead of a generic 10.
export const getAssetSpec = (symbol: string | undefined): AssetSpec => {
  if (!symbol) return { multiplier: 10, pipDecimal: 4 };
  const normalized = symbol.toUpperCase();
  if (ASSET_SPECS[normalized]) return ASSET_SPECS[normalized];
  if (normalized.includes('XAU') || normalized.includes('GOLD')) return { multiplier: 100, pipDecimal: 1 };
  if (normalized.includes('BTC') || normalized.includes('ETH')) return { multiplier: 1, pipDecimal: 0 };
  if (normalized.includes('JPY')) return { multiplier: 1000, pipDecimal: 2 };
  if (/^[A-Z]{6}$/.test(normalized)) return { multiplier: 100000, pipDecimal: 4 };
  return { multiplier: 10, pipDecimal: 4 };
};

// Derive P&L from price levels + outcome. Used when creating/editing a trade or
// flipping its outcome. For *display*, prefer the stored `trade.pnl`.
export const derivePnl = (
  trade: Pick<Trade, 'pair' | 'lotSize' | 'entry' | 'sl' | 'tp' | 'result'>
): number => {
  const { multiplier } = getAssetSpec(trade.pair);
  const lot = Number.isFinite(trade.lotSize) ? trade.lotSize : 1;
  const entry = Number.isFinite(trade.entry) ? trade.entry : 0;
  const sl = Number.isFinite(trade.sl) ? trade.sl : entry;
  const tp = Number.isFinite(trade.tp) ? trade.tp : entry;

  if (trade.result === 'win') return Math.abs(tp - entry) * lot * multiplier;
  if (trade.result === 'loss') return -Math.abs(entry - sl) * lot * multiplier;
  return 0; // breakeven
};
