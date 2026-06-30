import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconPlus } from '@tabler/icons-react';
import { useAppContext } from '../../context/AppContext';
import { scaleIn } from '../../lib/animations';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { useAccountForm } from './hooks/useAccountForm';
import { AccountForm } from './components/AccountForm';
import { AccountCard } from './components/AccountCard';

export const ManageAccountsModal = () => {
  const { openManageAccounts, setOpenManageAccounts, accounts, deleteAccount, trades, setSelectedAccountId } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useAccountForm(() => setShowForm(false));

  const handleClose = () => {
    setOpenManageAccounts(false);
    setShowForm(false);
    form.resetForm();
  };

  const handleToggleForm = () => {
    if (showForm) {
      setShowForm(false);
    } else {
      form.resetForm();
      setShowForm(true);
    }
  };

  const handleEditAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    form.loadAccount(acc);
    setShowForm(true);
  };

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    setOpenManageAccounts(false);
    navigate('/');
  };

  return (
    <>
      <AnimatePresence>
        {openManageAccounts && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={handleClose}
            />
            <motion.div
              variants={scaleIn} initial="hidden" animate="show" exit="hidden"
              className="relative w-full max-w-4xl max-h-[90vh] bg-bg-2 border border-white/[0.08] rounded-card shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex justify-between items-center bg-bg-2 z-10">
                <h2 className="text-[20px] font-bold text-text-1">Manage Accounts</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleForm}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-text-1 transition-colors"
                  >
                    <IconPlus size={16} /> New Account
                  </button>
                  <button onClick={handleClose} className="p-2 text-text-3 hover:text-text-1 transition-colors rounded-xl hover:bg-white/[0.04]">
                    <IconX size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                      className="overflow-hidden"
                    >
                      <AccountForm form={form} onCancel={() => { setShowForm(false); form.resetForm(); }} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {accounts.map(acc => (
                    <AccountCard
                      key={acc.id}
                      acc={acc}
                      trades={trades}
                      onSelect={() => handleSelectAccount(acc.id)}
                      onEdit={() => handleEditAccount(acc.id)}
                      onDelete={() => setConfirmDeleteId(acc.id)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => { if(confirmDeleteId) deleteAccount(confirmDeleteId); setConfirmDeleteId(null); toast.success("Account deleted"); }}
        title="Delete Account"
        message="Are you sure? This will permanently delete the account and ALL associated trades. This action cannot be undone."
      />
    </>
  );
};
