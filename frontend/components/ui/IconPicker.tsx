import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import { ACCENT_COLORS } from '../../lib/accentColors';
import { AccentColor } from '../../types';

interface Props {
  label?: string;
  icons: Record<string, ElementType>;
  iconKeys: string[];
  value: string;
  onChange: (key: string) => void;
  accentColor: AccentColor;
}

// Shared 5-col icon-grid picker used by Setups and Goals — selected state
// is tinted with whichever accent color the form currently has chosen.
export const IconPicker = ({ label = 'Icon', icons, iconKeys, value, onChange, accentColor }: Props) => {
  const spec = ACCENT_COLORS[accentColor];

  return (
    <div>
      <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">{label}</label>
      <div className="grid grid-cols-5 gap-2">
        {iconKeys.map(key => {
          const Icon = icons[key];
          const isSelected = value === key;
          return (
            <motion.button
              key={key}
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(key)}
              className={`aspect-square rounded-xl border flex items-center justify-center transition-colors ${
                isSelected ? `${spec.bg} ${spec.border}` : 'bg-bg-3 border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <Icon size={20} className={isSelected ? spec.text : 'text-text-3'} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
