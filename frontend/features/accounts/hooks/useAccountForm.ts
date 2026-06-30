import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/AppContext';

export const useAccountForm = (onSuccess: () => void) => {
  const { addAccount } = useAppContext();

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

  const handleAddAccount = () => {
    if (!name || !broker || !initialBalance) {
      toast.error("Please fill required fields");
      return;
    }
    addAccount({
      name, type, broker, platform, currency,
      initialBalance: Number(initialBalance),
      isChallenge,
      profitTarget: type === 'Funded' ? Number(profitTarget) : undefined,
      maxDailyDrawdown: type === 'Funded' ? Number(maxDailyDrawdown) : undefined,
      maxTotalDrawdown: type === 'Funded' ? Number(maxTotalDrawdown) : undefined,
    });
    toast.success("Account added successfully");
    onSuccess();
    // Reset form
    setName(''); setBroker(''); setInitialBalance('100000');
    setIsChallenge(false);
  };

  return {
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
