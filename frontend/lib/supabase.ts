import { createClient } from '@supabase/supabase-js';

// Clerk drives auth (Supabase "Third-Party Auth"): instead of a Supabase Auth
// session, every request carries the current Clerk session token. Supabase
// verifies it against Clerk's JWKS and RLS reads the user from the `sub` claim.
// window.Clerk is the global instance @clerk/clerk-react initializes.
declare global {
  interface Window {
    Clerk?: { session?: { getToken(): Promise<string | null> } };
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — copy frontend/.env.example to frontend/.env and fill them in.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  accessToken: async () => (await window.Clerk?.session?.getToken()) ?? null,
});
