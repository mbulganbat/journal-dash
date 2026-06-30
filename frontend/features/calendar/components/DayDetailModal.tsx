import { AnimatePresence, motion } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { format } from 'date-fns';
import { CalendarDay } from '../types';
import { calculateTradePnl, formatCurrency, moneyClass, privacyStyle } from '../utils';

interface Props {
  selectedDay: CalendarDay | null;
  onClose: () => void;
  onTradeClick: (tradeId: string) => void;
  privacyMode: boolean;
}

export const DayDetailModal = ({ selectedDay, onClose, onTradeClick, privacyMode }: Props) => {
  return (
    <AnimatePresence>
      {selectedDay ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl max-h-[82vh] overflow-hidden rounded-[20px] backdrop-blur-md bg-[#16161A]/95 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="p-5 border-b border-white/[0.08] flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-text-3 font-bold">Execution Detail</p>
                <h2 className="text-xl font-extrabold text-text-1 mt-1">{format(selectedDay.date, 'EEEE, MMMM d')}</h2>
                <p className={`text-sm font-bold mt-2 ${moneyClass(selectedDay.pnl)}`} style={privacyStyle(privacyMode)}>
                  {formatCurrency(selectedDay.pnl)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] text-text-2 hover:text-text-1 hover:bg-white/[0.08] transition-colors flex items-center justify-center"
                aria-label="Close day executions"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[62vh] space-y-3">
              {selectedDay.trades.map((trade) => {
                const pnl = calculateTradePnl(trade);
                return (
                  <div
                    key={trade.id}
                    onClick={() => onTradeClick(trade.id)}
                    className="rounded-[16px] bg-[#0C0C0E] border border-white/[0.06] p-4 cursor-pointer transition-colors hover:border-white/[0.14] hover:bg-[#111114]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-extrabold text-text-1">{trade.pair}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em] ${
                            trade.direction === 'long' ? 'bg-[#00FFB2]/10 text-[#00FFB2]' : 'bg-[#FF5A5A]/10 text-[#FF5A5A]'
                          }`}>
                            {trade.direction === 'long' ? 'Buy' : 'Sell'}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/[0.04] border border-white/[0.08] text-text-2">
                            {trade.session}
                          </span>
                        </div>
                        <p className="text-xs text-text-3 mt-2">
                          Entry {trade.entry ?? 0} / SL {trade.sl ?? 0} / TP {trade.tp ?? 0}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className={`text-lg font-black ${moneyClass(pnl)}`} style={privacyStyle(privacyMode)}>
                          {formatCurrency(pnl)}
                        </p>
                        <p className="text-xs text-text-3 mt-1">{trade.result.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
