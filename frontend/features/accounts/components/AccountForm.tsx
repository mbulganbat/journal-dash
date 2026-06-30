import { AccountFormState } from '../hooks/useAccountForm';

const inputClass = "w-full bg-bg-3 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-text-1 focus:outline-none focus:border-em/50 transition-colors";

interface Props {
  form: AccountFormState;
  onCancel: () => void;
}

export const AccountForm = ({ form, onCancel }: Props) => {
  const {
    name, setName,
    type, setType,
    broker, setBroker,
    platform, setPlatform,
    currency, setCurrency,
    initialBalance, setInitialBalance,
    isChallenge, setIsChallenge,
    profitTarget, setProfitTarget,
    maxDailyDrawdown, setMaxDailyDrawdown,
    maxTotalDrawdown, setMaxTotalDrawdown,
    handleAddAccount
  } = form;

  return (
    <div className="bg-bg-3 border border-white/[0.06] rounded-xl p-5">
      <h3 className="text-[14px] font-bold text-text-1 mb-4">Add New Account</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Account Name</label>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. FTMO 100k" className={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Type</label>
          <select value={type} onChange={e=>setType(e.target.value as any)} className={inputClass}>
            <option value="Funded">Funded</option>
            <option value="Personal">Personal</option>
            <option value="Demo">Demo</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Broker</label>
          <input type="text" value={broker} onChange={e=>setBroker(e.target.value)} placeholder="e.g. FTMO" className={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Platform</label>
          <select value={platform} onChange={e=>setPlatform(e.target.value as any)} className={inputClass}>
            <option value="MT4">MT4</option>
            <option value="MT5">MT5</option>
            <option value="cTrader">cTrader</option>
            <option value="TradingView">TradingView</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Currency</label>
          <select value={currency} onChange={e=>setCurrency(e.target.value as any)} className={inputClass}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Initial Balance</label>
          <input type="number" value={initialBalance} onChange={e=>setInitialBalance(e.target.value)} className={inputClass} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsChallenge(value => !value)}
        className={`mb-4 w-full rounded-xl border px-4 py-3 text-left transition-colors ${
          isChallenge
            ? 'bg-warning/10 border-warning/30 text-warning'
            : 'bg-bg-2 border-white/[0.06] text-text-2 hover:text-text-1'
        }`}
      >
        <span className="block text-[11px] uppercase tracking-wide font-bold">Challenge Account</span>
        <span className="block text-xs mt-1 text-text-3">Exclude from consolidated portfolio totals unless selected directly.</span>
      </button>

      {type === 'Funded' && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-bg-2 rounded-xl border border-white/[0.04]">
          <div>
            <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Profit Target (%)</label>
            <input type="number" value={profitTarget} onChange={e=>setProfitTarget(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Max Daily Drawdown (%)</label>
            <input type="number" value={maxDailyDrawdown} onChange={e=>setMaxDailyDrawdown(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Max Total Drawdown (%)</label>
            <input type="number" value={maxTotalDrawdown} onChange={e=>setMaxTotalDrawdown(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-text-2 hover:bg-white/[0.04]">Cancel</button>
        <button onClick={handleAddAccount} className="px-6 py-2 rounded-xl text-sm font-bold text-black bg-em hover:bg-em-2 transition-colors">Save Account</button>
      </div>
    </div>
  );
};
