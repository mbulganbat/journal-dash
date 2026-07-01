import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/AppContext';
import { Setup, AccentColor } from '../../../types';
import { DEFAULT_ACCENT_COLOR } from '../../../lib/accentColors';
import { DEFAULT_ICON } from '../constants';

export const useSetupForm = (onSuccess: () => void) => {
  const { setups, addSetup, updateSetup } = useAppContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<string[]>(['']);
  const [color, setColor] = useState<AccentColor>(DEFAULT_ACCENT_COLOR);
  const [icon, setIcon] = useState(DEFAULT_ICON);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setRules(['']);
    setColor(DEFAULT_ACCENT_COLOR);
    setIcon(DEFAULT_ICON);
  };

  const loadSetup = (setup: Setup) => {
    setEditingId(setup.id);
    setName(setup.name);
    setDescription(setup.description);
    setRules(setup.rules.length > 0 ? setup.rules : ['']);
    setColor(setup.color);
    setIcon(setup.icon);
  };

  const updateRule = (index: number, value: string) => {
    setRules(prev => prev.map((r, i) => i === index ? value : r));
  };

  const addRule = () => setRules(prev => [...prev, '']);

  const removeRule = (index: number) => {
    setRules(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Give the setup a name');
      return;
    }

    const isDuplicate = setups.some(s =>
      s.id !== editingId && s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error('A setup with that name already exists');
      return;
    }

    const cleanRules = rules.map(r => r.trim()).filter(Boolean);

    const setupData = {
      name: trimmedName,
      description: description.trim(),
      rules: cleanRules,
      color,
      icon
    };

    if (editingId) {
      updateSetup(editingId, setupData);
      toast.success('Setup updated');
    } else {
      addSetup(setupData);
      toast.success('Setup added to your playbook');
    }

    onSuccess();
    resetForm();
  };

  return {
    editingId,
    name, setName,
    description, setDescription,
    rules, updateRule, addRule, removeRule,
    color, setColor,
    icon, setIcon,
    resetForm,
    loadSetup,
    handleSave
  };
};

export type SetupFormState = ReturnType<typeof useSetupForm>;
