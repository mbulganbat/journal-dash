import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { scaleIn } from '../../lib/animations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  saveLabel: string;
  onSave: () => void;
  children: ReactNode;
}

// Shared chrome (portal, overlay, header, scrollable body, footer) for the
// app's add/edit form modals — see SetupFormModal/GoalFormModal for usage.
// Portal to <body>: a routed page's root sits inside App.tsx's `relative
// z-10` content wrapper, which would otherwise trap a `fixed` modal behind
// the Sidebar.
export const FormModal = ({ isOpen, onClose, title, saveLabel, onSave, children }: Props) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            variants={scaleIn} initial="hidden" animate="show" exit="hidden"
            className="relative w-full max-w-lg max-h-[88vh] bg-bg-2 border border-white/[0.08] rounded-card shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/[0.06] flex justify-between items-center shrink-0">
              <h2 className="text-[18px] font-bold text-text-1">{title}</h2>
              <button onClick={onClose} className="p-2 text-text-3 hover:text-text-1 transition-colors rounded-xl hover:bg-white/[0.04]">
                <IconX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {children}
            </div>

            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3 shrink-0">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-text-2 hover:bg-white/[0.04] transition-colors">
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-6 py-2 rounded-xl text-sm font-bold text-black bg-em hover:bg-em-2 transition-colors"
              >
                {saveLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
