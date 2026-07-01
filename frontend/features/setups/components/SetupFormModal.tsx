import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconPlus, IconGripVertical } from '@tabler/icons-react';
import { FormModal } from '../../../components/ui/FormModal';
import { IconPicker } from '../../../components/ui/IconPicker';
import { ColorPicker } from '../../../components/ui/ColorPicker';
import { SETUP_ICONS, ICON_KEYS } from '../constants';
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? 'Edit Setup' : 'New Setup'}
      saveLabel={editingId ? 'Update Setup' : 'Save Setup'}
      onSave={handleSave}
    >
      <div>
        <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Setup Name</label>
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Breaker Block Reversal" className={inputClass}
          autoFocus
        />
      </div>

      <IconPicker icons={SETUP_ICONS} iconKeys={ICON_KEYS} value={icon} onChange={setIcon} accentColor={color} />
      <ColorPicker value={color} onChange={setColor} />

      <div>
        <label className="block text-[10px] uppercase text-text-3 tracking-wide mb-1.5">Description</label>
        <textarea
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What is this setup, in one or two sentences?"
          className={`${inputClass} min-h-[70px] resize-none`}
        />
      </div>

      <div>
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
      </div>
    </FormModal>
  );
};
