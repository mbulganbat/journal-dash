import { ASSET_SPECS } from '../../lib/assetSpecs';

export const EMOTIONS = ['Focused', 'Patient', 'Neutral', 'Rushed', 'FOMO', 'Unsure'];
export const SETUPS = ['BMS+FVG', 'Order Block', 'CISD', 'Liquidity', 'Other'];
export const SESSIONS = ['London', 'NY AM', 'NY PM', 'Asian', 'Overlap'];
export const MISTAKES_LIST = ['No SL', 'Moved SL', 'Overleveraged', 'Revenge trade', 'Chased entry', 'Closed early', 'Held too long', 'Against trend'];
export const CHECKLIST_ITEMS = ['Trend aligned', 'Key level tested', 'Confirmation candle', 'R:R > 1.5', 'No major news'];

export const SYMBOL_OPTIONS = Object.keys(ASSET_SPECS).map(s => ({ value: s, label: s }));
