import { motion } from 'framer-motion';
import {
  IconWallet, IconTrendingUp, IconTrendingDown, IconCheck, IconUpload, IconLoader2
} from '@tabler/icons-react';
import { CustomDropdown } from './CustomDropdown';
import { CustomDatePicker } from './CustomDatePicker';
import { CHECKLIST_ITEMS, MISTAKES_LIST, SYMBOL_OPTIONS } from '../constants';
import { TradeFormState } from '../hooks/useTradeForm';

export const TradeFormFields = ({ form }: { form: TradeFormState }) => {
  const {
    editingTrade,
    selectedAccountId, setSelectedAccountId, accountOptions,
    pair, setPair,
    direction, setDirection,
    outcome, setOutcome,
    entry, setEntry, sl, setSl, tp, setTp, inputClass,
    date, setDate,
    session, setSession, sessionOptions,
    lotSize, setLotSize,
    setup, setSetup, setupOptions,
    emotion, setEmotion, emotionOptions,
    checklist, toggleChecklist, checklistScore,
    mistakes, toggleMistake,
    screenshot, setScreenshot, isDragging, fileInputRef,
    handleDragOver, handleDragLeave, handleDrop, handleFileInput,
    notes, setNotes,
    isSubmitting, handleSubmit
  } = form;

  return (
    <div className="w-full md:w-[55%] h-[calc(90vh-100px)] overflow-y-auto overflow-x-visible pr-4 pb-12 custom-scrollbar space-y-6 flex-1 p-6 md:p-8">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-[20px] font-bold text-text-1 mb-1">{editingTrade ? "Edit Trade Entry" : "New Trade Entry"}</h2>
          <p className="text-[13px] text-text-3">Log your execution details and psychology.</p>
        </motion.div>

        {/* Account & Symbol */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4">
          <CustomDropdown
            label="Account"
            value={selectedAccountId || ''}
            options={accountOptions}
            onChange={setSelectedAccountId}
            icon={IconWallet}
          />
          <CustomDropdown
            label="Symbol"
            value={pair}
            options={SYMBOL_OPTIONS}
            onChange={setPair}
          />
        </motion.div>

        {/* Direction Toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Direction</label>
          <div className="flex gap-3">
            <motion.button
              layout
              onClick={() => setDirection('long')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                direction === 'long'
                  ? 'bg-[#00FFB2]/15 border border-[#00FFB2]/40 text-[#00FFB2] shadow-[0_0_20px_rgba(0,255,178,0.15)]'
                  : 'bg-white/[0.03] border border-white/[0.06] text-[#8888A0] hover:bg-white/[0.06]'
              }`}
            >
              <IconTrendingUp size={18} /> BUY
            </motion.button>
            <motion.button
              layout
              onClick={() => setDirection('short')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                direction === 'short'
                  ? 'bg-[#FF5A5A]/15 border border-[#FF5A5A]/40 text-[#FF5A5A] shadow-[0_0_20px_rgba(255,90,90,0.15)]'
                  : 'bg-white/[0.03] border border-white/[0.06] text-[#8888A0] hover:bg-white/[0.06]'
              }`}
            >
              <IconTrendingDown size={18} /> SELL
            </motion.button>
          </div>
        </motion.div>

        {/* Outcome Selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Outcome</label>
          <div className="flex gap-3">
            <motion.button
              layout
              onClick={() => setOutcome('win')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                outcome === 'win'
                  ? 'bg-[#00FFB2]/15 border border-[#00FFB2]/40 text-[#00FFB2] shadow-[0_0_20px_rgba(0,255,178,0.15)]'
                  : 'bg-white/[0.03] border border-white/[0.06] text-[#8888A0] hover:bg-white/[0.06]'
              }`}
            >
              TP
            </motion.button>
            <motion.button
              layout
              onClick={() => setOutcome('loss')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                outcome === 'loss'
                  ? 'bg-[#FF5A5A]/15 border border-[#FF5A5A]/40 text-[#FF5A5A] shadow-[0_0_20px_rgba(255,90,90,0.15)]'
                  : 'bg-white/[0.03] border border-white/[0.06] text-[#8888A0] hover:bg-white/[0.06]'
              }`}
            >
              SL
            </motion.button>
            <motion.button
              layout
              onClick={() => setOutcome('breakeven')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                outcome === 'breakeven'
                  ? 'bg-[#FFB800]/15 border border-[#FFB800]/40 text-[#FFB800] shadow-[0_0_15px_rgba(255,184,0,0.15)]'
                  : 'bg-white/[0.03] border border-white/[0.06] text-[#8888A0] hover:bg-white/[0.06]'
              }`}
            >
              BE
            </motion.button>
          </div>
        </motion.div>

        {/* Price Inputs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Entry Price</label>
            <input type="number" step="any" value={entry} onChange={e => setEntry(e.target.value)} className={inputClass('entry')} />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Stop Loss</label>
            <input type="number" step="any" value={sl} onChange={e => setSl(e.target.value)} className={inputClass('sl')} />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Take Profit</label>
            <input type="number" step="any" value={tp} onChange={e => setTp(e.target.value)} className={inputClass('tp')} />
          </div>
        </motion.div>

        {/* Date, Session, Lot Size */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-3 gap-4">
          <CustomDatePicker date={date} setDate={setDate} />
          <CustomDropdown label="Session" value={session} options={sessionOptions} onChange={setSession} />
          <div>
            <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Lot Size</label>
            <input type="number" step="any" value={lotSize} onChange={e => setLotSize(e.target.value)} className={inputClass('lotSize')} />
          </div>
        </motion.div>

        {/* Strategy & Emotion */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4">
          <CustomDropdown label="Strategy" value={setup} options={setupOptions} onChange={setSetup} />
          <CustomDropdown label="Emotion" value={emotion} options={emotionOptions} onChange={setEmotion} />
        </motion.div>

        {/* Checklist */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">Setup Checklist</label>
          <div className="flex flex-col gap-2 bg-[#16161A] border border-white/[0.06] rounded-xl p-4">
            {CHECKLIST_ITEMS.map(item => {
              const isChecked = checklist.includes(item);
              return (
                <div
                  key={item}
                  onClick={() => toggleChecklist(item)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-[#00FFB2] border-[#00FFB2] scale-100' : 'border-white/[0.15] group-hover:border-white/[0.3] scale-95'}`}>
                    {isChecked && <IconCheck size={12} className="text-black" stroke={3} />}
                  </div>
                  <span className={`text-[13px] transition-all ${isChecked ? 'text-[#F0F0F5] line-through opacity-70' : 'text-[#8888A0] group-hover:text-text-2'}`}>
                    {item}
                  </span>
                </div>
              );
            })}

            {/* Checklist Score Indicator */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between items-center">
              <span className="text-[11px] text-text-3 uppercase tracking-wide font-semibold">Checklist Score</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                checklistScore >= 80 ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
              }`}>
                {checklistScore}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Mistakes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">Mistakes Made</label>
          <div className="flex flex-wrap gap-2">
            {MISTAKES_LIST.map(m => {
              const isSelected = mistakes.includes(m);
              return (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleMistake(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    isSelected
                      ? 'bg-[#FF5A5A]/10 border-[#FF5A5A]/30 text-[#FF5A5A] font-semibold'
                      : 'bg-white/[0.04] border-white/[0.08] text-[#8888A0] hover:bg-white/[0.08]'
                  }`}
                >
                  {m}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Screenshot Upload */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">Chart Screenshot</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group relative overflow-hidden ${
              isDragging ? 'border-[#00FFB2]/40 bg-[#00FFB2]/[0.04]' : 'border-white/[0.08] hover:border-[#00FFB2]/20 bg-white/[0.01] hover:bg-[#00FFB2]/[0.02]'
            }`}
          >
            <input type="file" accept="image/png, image/jpeg" hidden ref={fileInputRef} onChange={handleFileInput} />

            {screenshot ? (
              <>
                <img src={screenshot} alt="Screenshot preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#00FFB2]/20 flex items-center justify-center mb-2 backdrop-blur-md">
                    <IconCheck size={20} className="text-[#00FFB2]" />
                  </div>
                  <p className="text-[13px] text-text-1 font-medium">Image attached</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setScreenshot(null); }}
                    className="mt-2 text-[11px] text-[#FF5A5A] hover:underline relative z-20"
                  >
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <>
                <IconUpload size={24} className="text-[#00FFB2] mb-2" />
                <p className="text-[13px] text-text-2 group-hover:text-text-1 transition-colors">Drag chart image here or click to browse</p>
                <p className="text-[11px] text-text-3 mt-1">Supports PNG, JPG (Max 5MB)</p>
              </>
            )}
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="bg-[#16161A] border border-white/[0.08] rounded-xl p-4 min-h-[100px] w-full resize-none text-sm text-text-1 focus:border-[#00FFB2]/40 focus:outline-none transition-colors"
            placeholder="What went well? What could be improved?"
          />
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#00FFB2] text-[#0C0C0E] font-bold rounded-xl h-12 text-[14px] hover:brightness-110 shadow-[0_8px_24px_rgba(0,255,178,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 mb-6"
        >
          {isSubmitting ? <IconLoader2 size={18} className="animate-spin" /> : null}
          {isSubmitting ? 'Saving Trade...' : 'Save Trade Entry'}
        </motion.button>

    </div>
  );
};
