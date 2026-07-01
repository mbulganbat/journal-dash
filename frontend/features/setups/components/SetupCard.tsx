import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconEdit, IconTrash, IconChevronDown, IconCheck, IconListCheck } from '@tabler/icons-react';
import { premiumHoverProps } from '../../../components/ui/Shared';
import { useCountUp } from '../../../hooks/useCountUp';
import { fadeUp } from '../../../lib/animations';
import { SETUP_ICONS } from '../constants';
import { ACCENT_COLORS } from '../../../lib/accentColors';
import { SetupStat } from '../hooks/useSetupsData';

const RING_SIZE = 72;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const WinRateRing = ({ winRate, hasTrades, hex }: { winRate: number; hasTrades: boolean; hex: string }) => {
  const animatedRate = useCountUp(hasTrades ? winRate : 0, 900);
  const offset = CIRCUMFERENCE * (1 - (hasTrades ? winRate : 0) / 100);

  return (
    <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE}
        />
        {hasTrades && (
          <motion.circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
            fill="none" stroke={hex} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            style={{ filter: `drop-shadow(0 0 4px ${hex}80)` }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {hasTrades ? (
          <span className="text-[15px] font-extrabold text-text-1">{Math.round(animatedRate)}%</span>
        ) : (
          <span className="text-[10px] font-semibold text-text-3">—</span>
        )}
      </div>
    </div>
  );
};

interface Props {
  setup: SetupStat;
  onEdit: () => void;
  onDelete: () => void;
}

export const SetupCard = ({ setup, onEdit, onDelete }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const spec = ACCENT_COLORS[setup.color];
  const Icon = SETUP_ICONS[setup.icon] || SETUP_ICONS.IconChartCandle;
  const hasTrades = setup.tradeCount > 0;
  const animatedPnl = useCountUp(Math.abs(setup.netPnl), 900);

  return (
    <motion.div
      layout
      variants={fadeUp}
      {...premiumHoverProps}
      className="group relative bg-bg-2 border border-white/[0.06] rounded-card overflow-hidden"
    >
      {/* Ambient corner glow in the setup's accent color */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl pointer-events-none"
        style={{ background: spec.glow }}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl ${spec.bg} border ${spec.border} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={spec.text} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-text-1 truncate">{setup.name}</h3>
              <p className="text-[11px] text-text-3">{setup.tradeCount} {setup.tradeCount === 1 ? 'trade' : 'trades'}</p>
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

        <div className="flex items-center gap-4">
          <WinRateRing winRate={setup.winRate} hasTrades={hasTrades} hex={spec.hex} />

          <div className="grid grid-cols-1 gap-2 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-3">Net P&L</span>
              <span className={`text-[13px] font-bold ${!hasTrades ? 'text-text-3' : setup.netPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                {hasTrades ? `${setup.netPnl >= 0 ? '+' : '-'}$${animatedPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-3">Avg R:R</span>
              <span className="text-[13px] font-bold text-text-2">{hasTrades ? `${setup.avgRR.toFixed(2)}R` : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-3">Profit Factor</span>
              <span className="text-[13px] font-bold text-text-2">{hasTrades ? setup.profitFactor.toFixed(2) : '—'}</span>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setExpanded(prev => !prev)}
          className="w-full flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-white/[0.04] text-[11px] font-semibold text-text-3 hover:text-text-1 transition-colors"
        >
          <IconListCheck size={13} />
          Playbook
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <IconChevronDown size={13} />
          </motion.div>
        </motion.button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                {setup.description && (
                  <p className="text-[12px] text-text-3 leading-relaxed mb-3">{setup.description}</p>
                )}
                {setup.rules.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {setup.rules.map((rule, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-4 h-4 rounded-full ${spec.bg} border ${spec.border} flex items-center justify-center shrink-0`}>
                          <IconCheck size={10} className={spec.text} stroke={3} />
                        </div>
                        <span className="text-[12px] text-text-2">{rule}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-text-3 italic">No entry criteria defined yet.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
