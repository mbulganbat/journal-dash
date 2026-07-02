import { motion } from 'framer-motion';
import { SignIn } from '@clerk/clerk-react';
import { IconBolt } from '@tabler/icons-react';
import { Background } from '../layout/Background';
import { fadeUp } from '../../lib/animations';

// The dark/mint Clerk theming lives in lib/clerkAppearance.ts and is applied
// globally at the ClerkProvider level, so <SignIn> here inherits it.
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

        <SignIn />
      </motion.div>
    </div>
  );
};
