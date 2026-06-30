import { motion } from 'framer-motion';
import { IconBuildingBank, IconEdit, IconTrash, IconTrophy } from '@tabler/icons-react';
import { getFundedProgress, getNetPnL, filterByAccount, getWinRate } from '../../../data/mockTrades';
import { ProgressBar } from '../../../components/ui/Shared';
import { Account, Trade } from '../../../types';

interface Props {
  acc: Account;
  trades: Trade[];
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const AccountCard = ({ acc, trades, onSelect, onEdit, onDelete }: Props) => {
  const accTrades = filterByAccount(trades, acc.id);
  const netPnl = getNetPnL(accTrades);
  const balance = acc.initialBalance + netPnl;
  const winRate = getWinRate(accTrades);
  const progress = getFundedProgress(acc, trades);

  let statusColor = 'text-text-2 bg-white/[0.04] border-white/[0.08]';
  if (progress.status === 'Passed') statusColor = 'text-warning bg-warning/10 border-warning/30';
  if (progress.status === 'On Track') statusColor = 'text-em bg-em/10 border-em/30';
  if (progress.status === 'At Risk') statusColor = 'text-warning bg-warning/10 border-warning/30';
  if (progress.status === 'Blown') statusColor = 'text-danger bg-danger/10 border-danger/30';

  return (
    <div className="bg-bg-3 border border-white/[0.06] rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-em/10 flex items-center justify-center border border-em/20">
            <IconBuildingBank size={20} className="text-em" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-text-1">{acc.name}</h3>
            <p className="text-[11px] text-text-3">{acc.broker} · {acc.platform} · {acc.type}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onSelect} className="px-3 py-1.5 bg-white/[0.04] hover:bg-em/10 hover:text-em rounded-lg text-xs font-medium transition-colors mr-1">Select</button>
          <button onClick={onEdit} className="p-1.5 text-text-3 hover:text-text-1 transition-colors rounded-lg hover:bg-white/[0.04]"><IconEdit size={16} /></button>
          <button onClick={onDelete} className="p-1.5 text-text-3 hover:text-danger transition-colors rounded-lg hover:bg-white/[0.04]"><IconTrash size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-bg-2 rounded-lg p-3 border border-white/[0.04]">
          <p className="text-[10px] uppercase text-text-3 tracking-wide mb-1">Balance</p>
          <p className="text-[14px] font-bold text-text-1">${balance.toLocaleString()}</p>
        </div>
        <div className="bg-bg-2 rounded-lg p-3 border border-white/[0.04]">
          <p className="text-[10px] uppercase text-text-3 tracking-wide mb-1">Net P&L</p>
          <p className={`text-[14px] font-bold ${netPnl >= 0 ? 'text-success' : 'text-danger'}`}>
            {netPnl >= 0 ? '+' : '-'}${Math.abs(netPnl).toLocaleString()}
          </p>
        </div>
        <div className="bg-bg-2 rounded-lg p-3 border border-white/[0.04]">
          <p className="text-[10px] uppercase text-text-3 tracking-wide mb-1">Win Rate</p>
          <p className="text-[14px] font-bold text-text-1">{winRate}%</p>
        </div>
      </div>

      {acc.type === 'Funded' && (
        <div className="mt-auto pt-4 border-t border-white/[0.04]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Funded Objectives</span>
            <motion.span
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusColor}`}
            >
              {progress.status === 'Passed' && <IconTrophy size={12} />}
              {progress.status}
            </motion.span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-3">Profit Target ({acc.profitTarget}%)</span>
                <span className="text-em font-bold">{progress.profitPct.toFixed(1)}%</span>
              </div>
              <ProgressBar percentage={Math.min((progress.profitPct / (acc.profitTarget || 10)) * 100, 100)} colorClass="bg-em" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-3">Daily Drawdown (Max {acc.maxDailyDrawdown}%)</span>
                <span className="text-warning font-bold">{progress.dailyDrawdownPct.toFixed(1)}%</span>
              </div>
              <ProgressBar percentage={(progress.dailyDrawdownPct / (acc.maxDailyDrawdown || 5)) * 100} colorClass="bg-warning" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-3">Total Drawdown (Max {acc.maxTotalDrawdown}%)</span>
                <span className="text-danger font-bold">{progress.totalDrawdownPct.toFixed(1)}%</span>
              </div>
              <ProgressBar percentage={(progress.totalDrawdownPct / (acc.maxTotalDrawdown || 10)) * 100} colorClass="bg-danger" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
