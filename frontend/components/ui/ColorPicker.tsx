import { motion } from 'framer-motion';
import { IconCheck } from '@tabler/icons-react';
import { ACCENT_COLORS, ACCENT_COLOR_KEYS } from '../../lib/accentColors';
import { AccentColor } from '../../types';

interface Props {
  label?: string;
  value: AccentColor;
  onChange: (color: AccentColor) => void;
}

// Shared accent-color swatch row used by Setups and Goals.
export const ColorPicker = ({ label = 'Accent Color', value, onChange }: Props) => {
  return (
    <div>
      <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">{label}</label>
      <div className="flex gap-3">
        {ACCENT_COLOR_KEYS.map(key => {
          const spec = ACCENT_COLORS[key];
          const isSelected = value === key;
          return (
            <motion.button
              key={key}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(key)}
              title={spec.label}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                backgroundColor: spec.hex,
                boxShadow: isSelected ? `0 0 0 2px #0C0C0E, 0 0 0 4px ${spec.hex}` : 'none'
              }}
            >
              {isSelected && <IconCheck size={16} className="text-black" stroke={3} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
