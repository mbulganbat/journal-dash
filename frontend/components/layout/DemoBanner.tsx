import { motion } from 'framer-motion';
import { IconLock } from '@tabler/icons-react';

// Floating pill shown only in demo mode. Sits above the sidebar (z-50).
export const DemoBanner = ({ onExit }: { onExit: () => void }) => (
  <motion.div
    initial={{ y: 80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.6, duration: 0.35, ease: 'easeOut' }}
    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-bg-2 border border-white/10 shadow-2xl"
  >
    <IconLock size={15} className="text-warning shrink-0" />
    <span className="text-[13px] text-text-2 whitespace-nowrap">
      Demo mode — sample data, nothing is saved
    </span>
    <button
      onClick={onExit}
      className="px-3.5 py-1.5 rounded-full bg-em hover:bg-em-2 text-black text-[13px] font-bold transition-colors whitespace-nowrap"
    >
      Sign in to start
    </button>
  </motion.div>
);
