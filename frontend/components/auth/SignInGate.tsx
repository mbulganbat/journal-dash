import { motion } from 'framer-motion';
import { SignIn } from '@clerk/clerk-react';
import { IconBolt } from '@tabler/icons-react';
import { Background } from '../layout/Background';
import { fadeUp } from '../../lib/animations';

// Matches this app's dark/mint palette so Clerk's hosted UI doesn't look
// like a foreign widget dropped into a premium dark app.
const clerkAppearance = {
  variables: {
    colorPrimary: '#00FFB2',
    colorBackground: '#0C0C0E',
    colorInputBackground: '#111114',
    colorInputText: '#F0F0F0',
    colorText: '#F0F0F0',
    colorTextSecondary: '#A0A0B0',
    colorDanger: '#FF5A5A',
    borderRadius: '0.75rem',
    fontFamily: 'Inter, sans-serif'
  },
  elements: {
    card: 'shadow-2xl border border-white/[0.06]',
    headerTitle: 'text-text-1',
    headerSubtitle: 'text-text-3',
    socialButtonsBlockButton: 'border border-white/[0.08] hover:bg-white/[0.04]',
    formButtonPrimary: 'bg-em hover:bg-em-2 text-black font-bold shadow-[0_0_20px_rgba(0,255,178,0.25)]',
    footerActionLink: 'text-em hover:text-em-2'
  }
};

export const SignInGate = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-bg-0 text-text-1 overflow-hidden">
      <Background />

      <motion.div
        variants={fadeUp} initial="hidden" animate="show"
        className="relative z-10 flex flex-col items-center"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-em to-em-3 flex items-center justify-center shadow-[0_0_16px_rgba(0,255,178,0.3)]">
            <IconBolt size={20} className="text-black" />
          </div>
          <span className="text-[20px] font-bold text-text-1 tracking-tight">Lumex</span>
        </div>

        <SignIn appearance={clerkAppearance} />
      </motion.div>
    </div>
  );
};
