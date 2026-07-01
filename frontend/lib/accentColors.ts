import { AccentColor } from '../types';

interface ColorSpec {
  label: string;
  hex: string;
  text: string;
  bg: string;
  border: string;
  glow: string;
}

// Shared accent-color palette for user-picked visual identity (Setups,
// Goals, ...). Static literal classes only (no `bg-${color}` interpolation)
// so the Tailwind CDN's runtime JIT scanner picks these up — see HANDOFF M2.
export const ACCENT_COLORS: Record<AccentColor, ColorSpec> = {
  em: {
    label: 'Mint',
    hex: '#00FFB2',
    text: 'text-[#00FFB2]',
    bg: 'bg-[#00FFB2]/10',
    border: 'border-[#00FFB2]/30',
    glow: 'rgba(0,255,178,0.18)'
  },
  warning: {
    label: 'Amber',
    hex: '#FFB800',
    text: 'text-[#FFB800]',
    bg: 'bg-[#FFB800]/10',
    border: 'border-[#FFB800]/30',
    glow: 'rgba(255,184,0,0.18)'
  },
  purple: {
    label: 'Purple',
    hex: '#B259FF',
    text: 'text-[#B259FF]',
    bg: 'bg-[#B259FF]/10',
    border: 'border-[#B259FF]/30',
    glow: 'rgba(178,89,255,0.18)'
  },
  blue: {
    label: 'Blue',
    hex: '#5B6BFF',
    text: 'text-[#5B6BFF]',
    bg: 'bg-[#5B6BFF]/10',
    border: 'border-[#5B6BFF]/30',
    glow: 'rgba(91,107,255,0.18)'
  }
};

export const ACCENT_COLOR_KEYS = Object.keys(ACCENT_COLORS) as AccentColor[];

export const DEFAULT_ACCENT_COLOR: AccentColor = 'em';
