import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stagger, fadeUp } from '../../lib/animations';
import { useSettingsForm } from './hooks/useSettingsForm';
import { SECTIONS, SectionKey } from './constants';
import { SettingsNav } from './components/SettingsNav';
import { AccountSection } from './components/AccountSection';
import { NotificationsSection } from './components/NotificationsSection';
import { TradingPrefsSection } from './components/TradingPrefsSection';
import { SubscriptionSection } from './components/SubscriptionSection';

export const Settings = () => {
  const [activeSection, setActiveSection] = useState<SectionKey>(SECTIONS[0].key);
  const form = useSettingsForm();

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="p-6 md:p-9 pb-20 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-text-1 mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <SettingsNav activeSection={activeSection} setActiveSection={setActiveSection} />

        <div className="bg-bg-2 border border-white/[0.06] rounded-card p-6 md:p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} variants={fadeUp} initial="hidden" animate="show" exit="hidden">
              {activeSection === 'Account' && <AccountSection form={form} />}
              {activeSection === 'Notifications' && <NotificationsSection />}
              {activeSection === 'Trading Prefs' && <TradingPrefsSection form={form} />}
              {activeSection === 'Subscription' && <SubscriptionSection form={form} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
