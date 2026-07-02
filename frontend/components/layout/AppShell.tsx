import { Routes, Route } from 'react-router-dom';
import { Background } from './Background';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NewTradePanel } from '../../features/trade-form/NewTradePanel';
import { ImportModal } from '../modals/ImportModal';
import { ManageAccountsModal } from '../../features/accounts/ManageAccountsModal';

// Pages
import { Dashboard } from '../../features/dashboard/Dashboard';
import { Journal } from '../../features/journal/Journal';
import { Trades } from '../../pages/Trades';
import { Analytics } from '../../features/analytics/Analytics';
import { TradeDetail } from '../../features/trade-detail/TradeDetail';
import { Settings } from '../../features/settings/Settings';
import { Reports } from '../../features/reports/Reports';
import { Calendar } from '../../features/calendar/Calendar';
import { Setups } from '../../features/setups/Setups';
import { Goals } from '../../features/goals/Goals';

// The full application UI: chrome, routes, and global panels. Rendered by
// both the real (Supabase-backed) app and the read-only demo — anything it
// shows comes from whichever provider wraps it.
export const AppShell = () => (
  <>
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
  </>
);
