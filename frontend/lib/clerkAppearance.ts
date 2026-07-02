// Matches the app's dark/mint palette so Clerk's hosted UI (sign-in card,
// user-button popover, account-management modal) doesn't look like a foreign
// widget inside a premium dark app. Passed once at the ClerkProvider level —
// every Clerk component inherits it.
export const clerkAppearance = {
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
    footerActionLink: 'text-em hover:text-em-2',
    modalContent: 'border border-white/[0.06]',
    userButtonPopoverCard: 'border border-white/[0.08] shadow-2xl'
  }
};
