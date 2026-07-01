import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/AppContext';

export const useSettingsForm = () => {
  const { settings, updateSettings, trades } = useAppContext();

  const [userName, setUserName] = useState(settings.userName || 'Alex');
  const [currency, setCurrency] = useState(settings.currency || 'USD');
  const [timezone, setTimezone] = useState(settings.timezone || 'UTC');
  const [risk, setRisk] = useState(settings.tradingPrefs?.defaultRisk || 1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(settings.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAvatarPreview(dataUrl);
      updateSettings({ avatarUrl: dataUrl });
      toast.success('Profile photo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleAvatarFile(e.target.files[0]);
  };

  const handleSaveAccount = () => {
    updateSettings({ userName, currency, timezone });
    toast.success('Account settings saved');
  };

  const handleSavePrefs = () => {
    updateSettings({ tradingPrefs: { ...settings.tradingPrefs, defaultRisk: risk } });
    toast.success('Trading preferences saved');
  };

  const handleUpgrade = () => {
    updateSettings({ plan: 'pro' });
    toast.success('Welcome to Lumex PRO!');
  };

  const handleDowngrade = () => {
    updateSettings({ plan: 'free' });
    toast('Switched back to the Free plan');
  };

  return {
    settings,
    plan: settings.plan,
    tradeCount: trades.length,
    userName, setUserName,
    currency, setCurrency,
    timezone, setTimezone,
    risk, setRisk,
    avatarPreview,
    fileInputRef,
    handleAvatarInputChange,
    handleSaveAccount,
    handleSavePrefs,
    handleUpgrade,
    handleDowngrade
  };
};

export type SettingsFormState = ReturnType<typeof useSettingsForm>;
