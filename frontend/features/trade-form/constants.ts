import { ASSET_SPECS } from '../../lib/assetSpecs';

export const EMOTIONS = ['Focused', 'Patient', 'Neutral', 'Rushed', 'FOMO', 'Unsure'];
export const SESSIONS = ['London', 'NY AM', 'NY PM', 'Asian', 'Overlap'];
export const MISTAKES_LIST = ['No SL', 'Moved SL', 'Overleveraged', 'Revenge trade', 'Chased entry', 'Closed early', 'Held too long', 'Against trend'];

export const SYMBOL_OPTIONS = Object.keys(ASSET_SPECS).map(s => ({ value: s, label: s }));
