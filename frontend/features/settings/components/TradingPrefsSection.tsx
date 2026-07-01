import { motion } from 'framer-motion';
import { SettingsFormState } from '../hooks/useSettingsForm';

export const TradingPrefsSection = ({ form }: { form: SettingsFormState }) => {
  const { risk, setRisk, handleSavePrefs } = form;

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-[11px] uppercase text-text-3 tracking-wide">Default Risk per Trade</label>
          <span className="text-em font-bold text-sm">{risk}%</span>
        </div>
        <input
          type="range" min="0.5" max="5" step="0.5" value={risk} onChange={e => setRisk(Number(e.target.value))}
          className="w-full accent-em"
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSavePrefs}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-em hover:bg-em-2 transition-colors w-fit"
      >
        Save Preferences
      </motion.button>
    </div>
  );
};
