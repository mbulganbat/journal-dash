import type { ElementType } from 'react';
import {
  IconChartCandle, IconTarget, IconWaveSquare, IconCrosshair, IconBolt,
  IconFlame, IconDiamond, IconShieldCheck, IconBrain, IconSparkles
} from '@tabler/icons-react';

// Icon choices offered in the setup picker. Stored on the Setup as a string
// key (localStorage-serializable) and resolved to a component via this map.
export const SETUP_ICONS: Record<string, ElementType> = {
  IconChartCandle, IconTarget, IconWaveSquare, IconCrosshair, IconBolt,
  IconFlame, IconDiamond, IconShieldCheck, IconBrain, IconSparkles
};

export const ICON_KEYS = Object.keys(SETUP_ICONS);

export const DEFAULT_ICON = 'IconChartCandle';
