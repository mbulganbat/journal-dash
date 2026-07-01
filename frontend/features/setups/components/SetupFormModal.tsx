import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconPlus, IconCheck, IconGripVertical } from '@tabler/icons-react';
import { scaleIn } from '../../../lib/animations';
import { SETUP_ICONS, ICON_KEYS } from '../constants';
import { ACCENT_COLORS, ACCENT_COLOR_KEYS } from '../../../lib/accentColors';
import { SetupFormState } from '../hooks/useSetupForm';

const inputClass = "w-full bg-bg-3 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-text-1 focus:outline-none focus:border-em/50 transition-colors";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  form: SetupFormState;
}

export const SetupFormModal = ({ isOpen, onClose, form }: Props) => {
  const {
    editingId, name, setName, description, setDescription,
    rules, updateRule, addRule, removeRule,
    color, setColor, icon, setIcon, handleSave
  } = form;

  // Portal to <body>: this page's root sits inside App.tsx's `relative z-10`
  // content wrapper, which would otherwise trap a `fixed` modal behind the Sidebar.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            variants={scaleIn} initial="hidden" animate="show" exit="hidden"
            className="relative w-full max-w-lg max-h-[88vh] bg-bg-2 border border-white/[0.08] rounded-card shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/[0.06] flex justify-between items-center shrink-0">
              <h2 className="text-[18px] font-bold text-text-1">{editingId ? 'Edit Setup' : 'New Setup'}</h2>
              <button onClick={onClose} className="p-2 text-text-3 hover:text-text-1 transition-colors rounded-xl hover:bg-white/[0.04]">
                <IconX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
                <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Setup Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Breaker Block Reversal" className={inputClass}
                  autoFocus
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_KEYS.map(key => {
                    const Icon = SETUP_ICONS[key];
                    const isSelected = icon === key;
                    const spec = ACCENT_COLORS[color];
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setIcon(key)}
                        className={`aspect-square rounded-xl border flex items-center justify-center transition-colors ${
                          isSelected ? `${spec.bg} ${spec.border}` : 'bg-bg-3 border-white/[0.06] hover:border-white/[0.15]'
                        }`}
                      >
                        <Icon size={20} className={isSelected ? spec.text : 'text-text-3'} />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
                <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-2">Accent Color</label>
                <div className="flex gap-3">
                  {ACCENT_COLOR_KEYS.map(key => {
                    const spec = ACCENT_COLORS[key];
                    const isSelected = color === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setColor(key)}
                        title={spec.label}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: spec.hex,
                          boxShadow: isSelected ? `0 0 0 2px #0C0C0E, 0 0 0 4px ${spec.hex}` : 'none'
                        }}
                      >
                        {isSelected && <IconCheck size={16} className="text-black" stroke={3} />}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Description</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What is this setup, in one or two sentences?"
                  className={`${inputClass} min-h-[70px] resize-none`}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] uppercase text-text-3 tracking-wide">Entry Criteria</label>
                  <button
                    type="button" onClick={addRule}
                    className="flex items-center gap-1 text-[11px] font-semibold text-em hover:text-em-2 transition-colors"
                  >
                    <IconPlus size={13} /> Add Rule
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {rules.map((rule, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                      >
                        <IconGripVertical size={14} className="text-text-3 shrink-0" />
                        <input
                          type="text" value={rule} onChange={e => updateRule(i, e.target.value)}
                          placeholder={`Rule ${i + 1}`}
                          className="flex-1 bg-bg-3 border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-text-1 focus:outline-none focus:border-em/50 transition-colors"
                        />
                        <button
                          type="button" onClick={() => removeRule(i)}
                          disabled={rules.length === 1}
                          className="p-1.5 text-text-3 hover:text-danger transition-colors rounded-lg hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:text-text-3"
                        >
                          <IconX size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3 shrink-0">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-text-2 hover:bg-white/[0.04] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-xl text-sm font-bold text-black bg-em hover:bg-em-2 transition-colors"
              >
                {editingId ? 'Update Setup' : 'Save Setup'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
