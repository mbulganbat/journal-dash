import { motion } from 'framer-motion';
import { SECTIONS, SectionKey } from '../constants';

interface Props {
  activeSection: SectionKey;
  setActiveSection: (section: SectionKey) => void;
}

export const SettingsNav = ({ activeSection, setActiveSection }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      {SECTIONS.map(({ key, icon: Icon }) => {
        const isActive = activeSection === key;
        return (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`relative flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'text-em' : 'text-text-2 hover:text-text-1 hover:bg-white/[0.04]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="settings-nav-indicator"
                className="absolute inset-0 rounded-xl bg-em/[0.08] border border-em/20"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={16} className="relative" />
            <span className="relative">{key}</span>
          </button>
        );
      })}
    </div>
  );
};
