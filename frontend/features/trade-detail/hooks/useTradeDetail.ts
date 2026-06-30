import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/AppContext';
import { derivePnl } from '../../../lib/assetSpecs';
import { Trade } from '../../../types';

export const useTradeDetail = (trade: Trade | undefined) => {
  const { updateTrade } = useAppContext();

  const [localNotes, setLocalNotes] = useState('');
  const [localMistakes, setLocalMistakes] = useState<string[]>([]);
  const [localLessons, setLocalLessons] = useState<string[]>([]);

  useEffect(() => {
    if (trade) {
      setLocalNotes(trade.notes);
      setLocalMistakes(trade.mistakes || []);
      setLocalLessons(trade.lessons || []);
    }
  }, [trade]);

  const handleSaveNotes = () => {
    if (!trade) return;
    if (localNotes !== trade.notes) {
      updateTrade(trade.id, { notes: localNotes });
      toast.success("Notes saved");
    }
  };

  const handleUpdateList = (type: 'mistakes'|'lessons', list: string[]) => {
    if (!trade) return;
    const cleanList = list.filter(i => i.trim() !== '');
    updateTrade(trade.id, { [type]: cleanList });
  };

  const handleOutcomeChange = (newOutcome: 'win' | 'loss' | 'breakeven') => {
    if (!trade) return;
    if (newOutcome === trade.result) return;

    const newPnl = derivePnl({ ...trade, result: newOutcome });

    updateTrade(trade.id, { result: newOutcome, pnl: newPnl });
    toast.success(`Trade outcome updated to ${newOutcome.toUpperCase()}`);
  };

  const handleEmotionChange = (emotion: string) => {
    if (!trade) return;
    updateTrade(trade.id, { emotion: emotion as any });
    toast.success("Emotion updated");
  };

  return {
    localNotes, setLocalNotes,
    localMistakes, setLocalMistakes,
    localLessons, setLocalLessons,
    handleSaveNotes, handleUpdateList, handleOutcomeChange, handleEmotionChange
  };
};
