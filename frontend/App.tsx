import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { AppProvider } from './context/AppContext';
import { Background } from './components/layout/Background';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { SignInGate } from './components/auth/SignInGate';
import { NewTradePanel } from './features/trade-form/NewTradePanel';
import { ImportModal } from './components/modals/ImportModal';
import { ManageAccountsModal } from './features/accounts/ManageAccountsModal';

// Pages
import { Dashboard } from './features/dashboard/Dashboard';
import { Journal } from './features/journal/Journal';
import { Trades } from './pages/Trades';
import { Analytics } from './features/analytics/Analytics';
import { TradeDetail } from './features/trade-detail/TradeDetail';
import { Settings } from './features/settings/Settings';
import { Reports } from './features/reports/Reports';
import { Calendar } from './features/calendar/Calendar';
import { Setups } from './features/setups/Setups';
import { Goals } from './features/goals/Goals';

export default function App() {
  return (
    <Router>
      <SignedOut>
        <SignInGate />
      </SignedOut>

      <SignedIn>
        <AppProvider>
          <div className="flex min-h-screen bg-bg-0 text-text-1 selection:bg-em/30">
            <Background />
            <Sidebar />

            <div className="ml-[224px] flex flex-col flex-1 min-w-0 min-h-screen relative z-10">
              <Topbar />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/trades" element={<Trades />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/trade/:id" element={<TradeDetail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/setups" element={<Setups />} />
                  <Route path="/goals" element={<Goals />} />
                </Routes>
              </main>
            </div>
          </div>

          <NewTradePanel />
          <ImportModal />
          <ManageAccountsModal />
        </AppProvider>
      </SignedIn>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0C0C0E',
            color: '#F0F0F0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px'
          },
          success: {
            iconTheme: { primary: '#00FFB2', secondary: '#0C0C0E' },
            style: { border: '1px solid rgba(0,255,178,0.3)' }
          },
          error: {
            iconTheme: { primary: '#FF5A5A', secondary: '#0C0C0E' },
            style: { border: '1px solid rgba(255,90,90,0.3)' }
          }
        }}
      />
    </Router>
  );
}
