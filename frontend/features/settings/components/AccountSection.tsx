import { motion } from 'framer-motion';
import { IconCamera } from '@tabler/icons-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { CustomDropdown } from '../../../components/ui/Dropdown';
import { TIMEZONES } from '../../../lib/timezone';
import { SettingsFormState } from '../hooks/useSettingsForm';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' }
];

const TIMEZONE_OPTIONS = TIMEZONES.map(tz => ({ value: tz.value, label: tz.label }));

export const AccountSection = ({ form }: { form: SettingsFormState }) => {
  const {
    userName, setUserName,
    currency, setCurrency,
    timezone, setTimezone,
    avatarPreview, fileInputRef, handleAvatarInputChange,
    handleSaveAccount
  } = form;
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div className="flex items-center gap-5 mb-2">
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => fileInputRef.current?.click()}
          className="group relative w-20 h-20 rounded-full cursor-pointer shrink-0"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-em to-em-3 flex items-center justify-center text-black text-2xl font-bold overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <IconCamera size={20} className="text-white" />
          </div>
          <input
            type="file" accept="image/png, image/jpeg" hidden
            ref={fileInputRef} onChange={handleAvatarInputChange}
          />
        </motion.div>
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl border border-white/10 text-sm text-text-2 hover:text-text-1 hover:border-white/20 transition-colors"
          >
            Change Photo
          </button>
          <p className="text-[11px] text-text-3 mt-2">PNG or JPG, up to 5MB.</p>
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase text-text-3 tracking-wide mb-2">Display Name</label>
        <input
          type="text" value={userName} onChange={e => setUserName(e.target.value)}
          className="w-full bg-bg-3 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-text-1 focus:outline-none focus:border-em/50 transition-colors"
        />
      </div>

      <CustomDropdown label="Currency" value={currency} options={CURRENCY_OPTIONS} onChange={setCurrency} />
      <CustomDropdown label="Timezone" value={timezone} options={TIMEZONE_OPTIONS} onChange={setTimezone} />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSaveAccount}
        className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-em hover:bg-em-2 transition-colors w-fit"
      >
        Save Changes
      </motion.button>

      <div className="mt-4 pt-6 border-t border-white/[0.06]">
        <label className="block text-[11px] uppercase text-text-3 tracking-wide mb-3">Sign-in & Security</label>
        <div className="flex items-center gap-3 bg-bg-3 border border-white/[0.06] rounded-xl px-4 py-3">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-1 truncate">{user?.fullName || userName}</p>
            <p className="text-[12px] text-text-3 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => openUserProfile()}
            className="px-4 py-2 rounded-xl border border-white/10 text-sm text-text-2 hover:text-text-1 hover:border-white/20 transition-colors"
          >
            Manage account
          </button>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded-xl border border-danger/30 text-sm text-danger hover:bg-danger/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
