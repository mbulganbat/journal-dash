import type { ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { premiumHoverProps } from './Shared';
import { fadeUp } from '../../lib/animations';
import { ColorSpec } from '../../lib/accentColors';

interface Props {
  icon: ElementType;
  title: string;
  subtitle: string;
  accentSpec: ColorSpec;
  onEdit: () => void;
  onDelete: () => void;
  children: ReactNode;
}

// Shared card shell (accent icon badge, ambient corner glow, title/subtitle,
// hover edit/delete actions) used by Setups and Goals — each feature only
// supplies its own body content via `children`.
export const EntityCard = ({ icon: Icon, title, subtitle, accentSpec, onEdit, onDelete, children }: Props) => {
  return (
    <motion.div
      layout
      variants={fadeUp}
      {...premiumHoverProps}
      className="group relative bg-bg-2 border border-white/[0.06] rounded-card overflow-hidden"
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl pointer-events-none"
        style={{ background: accentSpec.glow }}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl ${accentSpec.bg} border ${accentSpec.border} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={accentSpec.text} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-text-1 truncate">{title}</h3>
              <p className="text-[11px] text-text-3 truncate">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="p-1.5 text-text-3 hover:text-text-1 transition-colors rounded-lg hover:bg-white/[0.06]">
              <IconEdit size={15} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-text-3 hover:text-danger transition-colors rounded-lg hover:bg-white/[0.06]">
              <IconTrash size={15} />
            </button>
          </div>
        </div>

        {children}
      </div>
    </motion.div>
  );
};
