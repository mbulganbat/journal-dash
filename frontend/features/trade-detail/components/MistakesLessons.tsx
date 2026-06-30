import React from 'react';
import { motion } from 'framer-motion';
import { IconX, IconBulb } from '@tabler/icons-react';
import { fadeUp } from '../../../lib/animations';

interface Props {
  localMistakes: string[];
  setLocalMistakes: React.Dispatch<React.SetStateAction<string[]>>;
  localLessons: string[];
  setLocalLessons: React.Dispatch<React.SetStateAction<string[]>>;
  onUpdate: (type: 'mistakes'|'lessons', list: string[]) => void;
}

export const MistakesLessons = ({ localMistakes, setLocalMistakes, localLessons, setLocalLessons, onUpdate }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-3">
          <IconX size={16} className="text-[#FF5A5A]/80" />
          <h3 className="text-[14px] font-semibold text-[#FF5A5A]/80">Mistakes</h3>
        </div>
        <div className="bg-bg-3 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2 min-h-[120px]">
          {localMistakes.map((m, i) => (
            <input
              key={i} value={m}
              onChange={e => {
                const newM = [...localMistakes]; newM[i] = e.target.value; setLocalMistakes(newM);
              }}
              onBlur={() => onUpdate('mistakes', localMistakes)}
              className="bg-transparent text-sm text-text-2 focus:outline-none focus:text-text-1 border-b border-transparent focus:border-white/10"
            />
          ))}
          <button
            onClick={() => setLocalMistakes([...localMistakes, ''])}
            className="text-xs text-[#FF5A5A]/60 hover:text-[#FF5A5A] text-left mt-auto pt-2"
          >+ Add mistake</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-3">
          <IconBulb size={16} className="text-[#00FFB2]" />
          <h3 className="text-[14px] font-semibold text-[#00FFB2]">Lessons</h3>
        </div>
        <div className="bg-bg-3 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2 min-h-[120px]">
          {localLessons.map((l, i) => (
            <input
              key={i} value={l}
              onChange={e => {
                const newL = [...localLessons]; newL[i] = e.target.value; setLocalLessons(newL);
              }}
              onBlur={() => onUpdate('lessons', localLessons)}
              className="bg-transparent text-sm text-text-2 focus:outline-none focus:text-text-1 border-b border-transparent focus:border-white/10"
            />
          ))}
          <button
            onClick={() => setLocalLessons([...localLessons, ''])}
            className="text-xs text-[#00FFB2]/60 hover:text-[#00FFB2] text-left mt-auto pt-2"
          >+ Add lesson</button>
        </div>
      </motion.div>
    </div>
  );
};
