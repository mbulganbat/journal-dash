import React, { useEffect, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { AppProvider } from './context/AppContext';
import { DemoProvider } from './context/DemoProvider';
import { AppShell } from './components/layout/AppShell';
import { DemoBanner } from './components/layout/DemoBanner';
import { SignInGate } from './components/auth/SignInGate';

export default function App() {
  const { isSignedIn } = useUser();

  // Demo mode: browse the app on sample data without an account. Session-
  // scoped so a refresh keeps the tour going but a new visit starts clean.
  const [demoMode, setDemoMode] = useState(
    () => sessionStorage.getItem('lumex_demo') === '1'
  );

  useEffect(() => {
    sessionStorage.setItem('lumex_demo', demoMode ? '1' : '0');
  }, [demoMode]);

  // A real sign-in always wins over a lingering demo flag.
  useEffect(() => {
    if (isSignedIn && demoMode) setDemoMode(false);
  }, [isSignedIn, demoMode]);

  return (
    <Router>
      <SignedOut>
        {demoMode ? (
          <DemoProvider>
            <AppShell />
            <DemoBanner onExit={() => setDemoMode(false)} />
          </DemoProvider>
        ) : (
          <SignInGate onDemo={() => setDemoMode(true)} />
        )}
      </SignedOut>

      <SignedIn>
        <AppProvider>
          <AppShell />
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
