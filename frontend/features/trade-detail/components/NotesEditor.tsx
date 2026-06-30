import React from 'react';
import { motion } from 'framer-motion';
import { IconNotes } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';

interface Props {
  localNotes: string;
  setLocalNotes: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => void;
}

export const NotesEditor = ({ localNotes, setLocalNotes, onSave }: Props) => {
  return (
    <motion.div variants={fadeUp}>
      <div className="flex items-center gap-2 mb-3">
        <IconNotes size={16} className="text-text-3" />
        <h3 className="text-[14px] font-semibold text-text-1">Notes</h3>
      </div>
      <textarea
        value={localNotes}
        onChange={e => setLocalNotes(e.target.value)}
        onBlur={onSave}
        rows={4}
        className="w-full bg-bg-3 border border-white/[0.06] rounded-xl p-4 text-sm text-text-1 resize-none focus:outline-none focus:border-[#00FFB2]/40 transition-colors"
        placeholder="Add your trade notes here..."
      />
    </motion.div>
  );
};
