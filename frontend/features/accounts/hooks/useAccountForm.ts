import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/AppContext';
import { Account } from '../../../types';

export const useAccountForm = (onSuccess: () => void) => {
  const { addAccount, updateAccount } = useAppContext();

  // Which account is being edited (null = creating a new one)
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'Funded' | 'Demo' | 'Personal'>('Funded');
  const [broker, setBroker] = useState('');
  const [platform, setPlatform] = useState<'MT4' | 'MT5' | 'cTrader' | 'TradingView' | 'Other'>('MT5');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [initialBalance, setInitialBalance] = useState('100000');
  const [isChallenge, setIsChallenge] = useState(false);
  const [profitTarget, setProfitTarget] = useState('10');
  const [maxDailyDrawdown, setMaxDailyDrawdown] = useState('5');
  const [maxTotalDrawdown, setMaxTotalDrawdown] = useState('10');

  const resetForm = () => {
    setEditingId(null);
    setName(''); setType('Funded'); setBroker(''); setPlatform('MT5');
    setCurrency('USD'); setInitialBalance('100000'); setIsChallenge(false);
    setProfitTarget('10'); setMaxDailyDrawdown('5'); setMaxTotalDrawdown('10');
  };

  // Pre-fill the form with an existing account for editing.
  const loadAccount = (acc: Account) => {
    setEditingId(acc.id);
    setName(acc.name);
    setType(acc.type);
    setBroker(acc.broker);
    setPlatform(acc.platform);
    setCurrency(acc.currency);
    setInitialBalance(String(acc.initialBalance));
    setIsChallenge(acc.isChallenge ?? false);
    setProfitTarget(String(acc.profitTarget ?? 10));
    setMaxDailyDrawdown(String(acc.maxDailyDrawdown ?? 5));
    setMaxTotalDrawdown(String(acc.maxTotalDrawdown ?? 10));
  };

  const handleAddAccount = () => {
    if (!name || !broker || !initialBalance) {
      toast.error("Please fill required fields");
      return;
    }
    const accData = {
      name, type, broker, platform, currency,
      initialBalance: Number(initialBalance),
      isChallenge,
      profitTarget: type === 'Funded' ? Number(profitTarget) : undefined,
      maxDailyDrawdown: type === 'Funded' ? Number(maxDailyDrawdown) : undefined,
      maxTotalDrawdown: type === 'Funded' ? Number(maxTotalDrawdown) : undefined,
    };

    if (editingId) {
      updateAccount(editingId, accData);
      toast.success("Account updated successfully");
    } else {
      addAccount(accData);
      toast.success("Account added successfully");
    }
    onSuccess();
    resetForm();
  };

  return {
    editingId,
    loadAccount,
    resetForm,
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
  };
};

export type AccountFormState = ReturnType<typeof useAccountForm>;
