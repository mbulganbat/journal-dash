import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { useAppContext } from '../../context/AppContext';
import { useTradeForm } from './hooks/useTradeForm';
import { TradeFormFields } from './components/TradeFormFields';
import { LivePreview } from './components/LivePreview';

export const NewTradePanel = () => {
  const { openNewTrade, setOpenNewTrade } = useAppContext();
  const form = useTradeForm();
  const { isSubmitting } = form;

  const close = () => !isSubmitting && setOpenNewTrade(false);

  return (
    <AnimatePresence>
      {openNewTrade && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            onClick={close}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-[900px] max-h-[90vh] bg-[#111114] border border-white/[0.07] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.85)] flex flex-col md:flex-row relative z-50 overflow-hidden"
          >
            {/* Close Button (Mobile Absolute) */}
            <button
              onClick={close}
              className="md:hidden absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white"
            >
              <IconX size={20} />
            </button>

            {/* LEFT COLUMN - FORM (55%) */}
            <TradeFormFields form={form} />

            {/* RIGHT COLUMN - LIVE PREVIEW (45%) */}
            <LivePreview form={form} onClose={close} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
