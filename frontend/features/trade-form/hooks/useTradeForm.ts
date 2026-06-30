import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext';
import toast from 'react-hot-toast';
import { getNetPnL, filterByAccount } from '../../../data/mockTrades';
import { getAssetSpec } from '../../../lib/assetSpecs';
import { SESSIONS, SETUPS, EMOTIONS, CHECKLIST_ITEMS } from '../constants';

export const useTradeForm = () => {
  const { setOpenNewTrade, addTrade, updateTrade, editingTrade, accounts, selectedAccountId: activeAccountId, trades, openNewTrade } = useAppContext();

  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(activeAccountId ?? accounts[0]?.id);
  const [pair, setPair] = useState('EURUSD');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [outcome, setOutcome] = useState<'win' | 'loss' | 'breakeven'>('win');
  const [date, setDate] = useState<Date>(new Date());
  const [session, setSession] = useState('London');

  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [lotSize, setLotSize] = useState('1');

  const [setup, setSetup] = useState('BMS+FVG');
  const [emotion, setEmotion] = useState('Neutral');
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Screenshot Upload State
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (openNewTrade) {
      if (editingTrade) {
        setSelectedAccountId(editingTrade.accountId);
        setPair(editingTrade.pair);
        setDirection(editingTrade.direction);
        setOutcome(editingTrade.result);
        setDate(new Date(editingTrade.date));
        setSession(editingTrade.session);
        setEntry(editingTrade.entry.toString());
        setSl(editingTrade.sl.toString());
        setTp(editingTrade.tp.toString());
        setLotSize(editingTrade.lotSize?.toString() || '1');
        setSetup(editingTrade.setup);
        setEmotion(editingTrade.emotion);
        setMistakes(editingTrade.mistakes || []);
        setNotes(editingTrade.notes);
        setChecklist([]); // Reset checklist for edit mode unless saved
        setScreenshot(editingTrade.screenshotUrl || null);
      } else {
        // Reset
        setSelectedAccountId(activeAccountId ?? accounts[0]?.id);
        setPair('EURUSD');
        setDirection('long');
        setOutcome('win');
        setDate(new Date());
        setSession('London');
        setEntry('');
        setSl('');
        setTp('');
        setLotSize('1');
        setSetup('BMS+FVG');
        setEmotion('Neutral');
        setMistakes([]);
        setChecklist([]);
        setNotes('');
        setScreenshot(null);
      }
      setErrors({});
    }
  }, [openNewTrade, editingTrade, activeAccountId, accounts]);

  const toggleMistake = (m: string) => {
    setMistakes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const toggleChecklist = (item: string) => {
    setChecklist(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const checklistScore = Math.round((checklist.length / CHECKLIST_ITEMS.length) * 100);

  // Dynamic Setup Quality Score Engine
  const setupQualityScore = useMemo(() => {
    const checklistWeight = (checklist.length / CHECKLIST_ITEMS.length) * 60;

    let emotionWeight = 25; // Neutral
    if (['Focused', 'Patient'].includes(emotion)) emotionWeight = 40;
    if (['Rushed', 'FOMO', 'Unsure'].includes(emotion)) emotionWeight = 10;

    return Math.round(checklistWeight + emotionWeight);
  }, [checklist, emotion]);

  // Screenshot Handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setScreenshot(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload an image file (PNG, JPG)");
    }
  };

  // Real-time Calculations
  const calcData = useMemo(() => {
    const en = parseFloat(entry);
    const s = parseFloat(sl);
    const t = parseFloat(tp);
    const lot = parseFloat(lotSize) || 1;

    // Calculate dynamic account balance
    let balance = 100000;
    if (selectedAccountId) {
      const activeAcc = accounts.find(a => a.id === selectedAccountId);
      if (activeAcc) {
        const accTrades = filterByAccount(trades, selectedAccountId);
        balance = activeAcc.initialBalance + getNetPnL(accTrades);
      }
    } else {
      balance = accounts.reduce((sum, acc) => sum + acc.initialBalance, 0) + getNetPnL(trades);
    }

    // Symbol-Aware Multiplier Engine
    const spec = getAssetSpec(pair);
    const multiplier = spec.multiplier;
    const pipMultiplier = Math.pow(10, spec.pipDecimal);

    let slPips = 0;
    let tpPips = 0;
    let riskAmount = 0;
    let rewardAmount = 0;
    let rr = 0;

    if (!isNaN(en) && !isNaN(s) && en !== s) {
      const priceDifference = Math.abs(en - s);
      riskAmount = priceDifference * lot * multiplier;
      slPips = priceDifference * pipMultiplier; // Rough pip estimate for display
    }

    if (!isNaN(en) && !isNaN(t) && en !== t) {
      const priceDifference = Math.abs(en - t);
      rewardAmount = priceDifference * lot * multiplier;
      tpPips = priceDifference * pipMultiplier;
    }

    if (riskAmount > 0) {
      rr = rewardAmount / riskAmount;
    }

    const riskPercent = balance > 0 ? (riskAmount / balance) * 100 : 0;

    return { slPips, tpPips, riskAmount, rewardAmount, rr, riskPercent, balance };
  }, [entry, sl, tp, lotSize, selectedAccountId, accounts, direction, pair, trades]);

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!pair) newErrors.pair = true;
    if (!entry) newErrors.entry = true;
    if (!sl) newErrors.sl = true;
    if (!tp) newErrors.tp = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill required fields");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let finalPnl = 0;
      let finalExit = parseFloat(entry);

      if (outcome === 'win') {
        finalPnl = calcData.rewardAmount;
        finalExit = parseFloat(tp);
      } else if (outcome === 'loss') {
        finalPnl = -calcData.riskAmount;
        finalExit = parseFloat(sl);
      } else {
        finalPnl = 0;
        finalExit = parseFloat(entry);
      }

      const tradeData = {
        accountId: selectedAccountId || accounts[0].id,
        pair: pair.toUpperCase(),
        direction,
        date: date.toISOString(),
        session: session as any,
        entry: parseFloat(entry),
        exit: finalExit,
        sl: parseFloat(sl),
        tp: parseFloat(tp),
        lotSize: parseFloat(lotSize) || 1,
        setup,
        emotion: emotion as any,
        notes,
        pnl: finalPnl,
        rr: outcome === 'breakeven' ? 0 : Number(calcData.rr.toFixed(2)),
        result: outcome,
        mistakes,
        lessons: [],
        checklistScore,
        screenshotUrl: screenshot
      };

      if (editingTrade) {
        updateTrade(editingTrade.id, tradeData);
        toast.success("Trade updated successfully");
      } else {
        addTrade(tradeData);
        toast.success("Trade saved successfully");
      }

      setIsSubmitting(false);
      setOpenNewTrade(false);
    }, 600);
  };

  const inputClass = (field: string) => `w-full bg-[#16161A] border ${errors[field] ? 'border-[#FF5A5A]' : 'border-white/[0.08]'} rounded-xl h-11 px-4 text-sm text-text-1 focus:outline-none focus:border-[#00FFB2]/40 transition-colors`;

  const accountOptions = accounts.map(a => ({ value: a.id, label: a.name }));
  const sessionOptions = SESSIONS.map(s => ({ value: s, label: s }));
  const setupOptions = SETUPS.map(s => ({ value: s, label: s }));
  const emotionOptions = EMOTIONS.map(e => ({ value: e, label: e }));

  return {
    editingTrade,
    selectedAccountId, setSelectedAccountId,
    pair, setPair,
    direction, setDirection,
    outcome, setOutcome,
    date, setDate,
    session, setSession,
    entry, setEntry,
    sl, setSl,
    tp, setTp,
    lotSize, setLotSize,
    setup, setSetup,
    emotion, setEmotion,
    mistakes, toggleMistake,
    checklist, toggleChecklist,
    notes, setNotes,
    isSubmitting,
    screenshot, setScreenshot,
    isDragging, fileInputRef,
    checklistScore,
    setupQualityScore,
    handleDragOver, handleDragLeave, handleDrop, handleFileInput,
    calcData,
    handleSubmit,
    inputClass,
    accountOptions, sessionOptions, setupOptions, emotionOptions
  };
};

export type TradeFormState = ReturnType<typeof useTradeForm>;
