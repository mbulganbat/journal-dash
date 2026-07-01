import { motion } from 'framer-motion';
import { IconCheck, IconLock, IconCrown } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { premiumHoverProps, ProgressBar } from '../../../components/ui/Shared';
import { PLAN_COMPARISON, FREE_TRADE_LIMIT } from '../constants';
import { SettingsFormState } from '../hooks/useSettingsForm';

const FeatureRow = ({ value }: { value: string | boolean }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="flex items-center gap-2 text-[13px] text-text-1">
        <IconCheck size={15} className="text-em shrink-0" /> Included
      </span>
    ) : (
      <span className="flex items-center gap-2 text-[13px] text-text-3">
        <IconLock size={13} className="shrink-0" /> Locked
      </span>
    );
  }
  return <span className="text-[13px] text-text-1 font-semibold">{value}</span>;
};

export const SubscriptionSection = ({ form }: { form: SettingsFormState }) => {
  const { plan, tradeCount, handleUpgrade, handleDowngrade } = form;
  const isFree = plan === 'free';
  const tradeUsagePct = Math.min((tradeCount / FREE_TRADE_LIMIT) * 100, 100);
  const atLimit = tradeCount >= FREE_TRADE_LIMIT;

  return (
    <div className="flex flex-col gap-6">
      {/* Live usage against the Free plan's trade log cap */}
      <div className="p-4 rounded-xl bg-bg-3 border border-white/[0.06]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] uppercase text-text-3 tracking-wide font-semibold">Trade Log Usage</span>
          {isFree ? (
            <span className={`text-[12px] font-bold ${atLimit ? 'text-danger' : 'text-text-2'}`}>
              {tradeCount} / {FREE_TRADE_LIMIT}
            </span>
          ) : (
            <span className="text-[12px] font-bold text-em flex items-center gap-1">
              <IconCheck size={13} /> Unlimited
            </span>
          )}
        </div>
        {isFree ? (
          <>
            <ProgressBar percentage={tradeUsagePct} colorClass={atLimit ? 'bg-danger' : tradeUsagePct > 70 ? 'bg-warning' : 'bg-em'} />
            {atLimit && (
              <p className="text-[11px] text-danger mt-2">You've hit the Free plan limit — upgrade to keep logging trades.</p>
            )}
          </>
        ) : (
          <div className="h-1.5 rounded-full bg-em/20" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Free Plan */}
        <motion.div {...premiumHoverProps} className="p-6 rounded-2xl border border-white/[0.08] bg-bg-3 relative overflow-hidden flex flex-col">
          {isFree && (
            <div className="absolute top-0 right-0 bg-white/10 text-text-1 text-[10px] font-bold px-3 py-1 rounded-bl-xl">CURRENT</div>
          )}
          <h3 className="text-lg font-bold text-text-1 mb-1">Free</h3>
          <p className="text-text-3 text-sm mb-6">$0 / month</p>

          <div className="flex flex-col gap-3 mb-8 flex-1">
            {PLAN_COMPARISON.map(row => (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-text-2">{row.label}</span>
                <FeatureRow value={row.free} />
              </div>
            ))}
          </div>

          {!isFree && (
            <button
              onClick={handleDowngrade}
              className="py-2.5 rounded-xl bg-white/[0.06] text-sm font-medium text-text-2 hover:bg-white/[0.1] hover:text-text-1 transition-colors"
            >
              Downgrade to Free
            </button>
          )}
        </motion.div>

        {/* Pro Plan */}
        <motion.div
          {...premiumHoverProps}
          className="p-6 rounded-2xl border border-em/30 bg-em/[0.03] relative overflow-hidden flex flex-col"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-em/25 to-transparent blur-xl pointer-events-none" />

          {!isFree && (
            <div className="absolute top-0 right-0 bg-em text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl">ACTIVE</div>
          )}
          <h3 className="text-lg font-bold text-text-1 mb-1 flex items-center gap-2 relative">
            <IconCrown size={18} className="text-em" /> Lumex PRO
          </h3>
          <p className="text-text-3 text-sm mb-6 relative">$79 / month</p>

          <div className="flex flex-col gap-3 mb-8 flex-1 relative">
            {PLAN_COMPARISON.map(row => (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-text-2">{row.label}</span>
                <FeatureRow value={row.pro} />
              </div>
            ))}
          </div>

          <div className="relative flex gap-3">
            {isFree ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-br from-em to-em-3 shadow-[0_0_20px_rgba(0,255,178,0.25)] hover:brightness-110 transition-all"
              >
                Upgrade to Pro
              </motion.button>
            ) : (
              <button
                onClick={() => toast.success('Opening billing portal...')}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.08] text-sm font-medium text-text-1 hover:bg-white/[0.12] transition-colors"
              >
                Manage Billing
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
