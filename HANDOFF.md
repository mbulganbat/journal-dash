# Lumex Trading Journal — Session Handoff (v2)

> Paste this into a fresh chat to continue. This supersedes the original HANDOFF.md (Phases A–C are summarized in §2; full detail lives in git history if needed). Covers everything done since, the standing rules to enforce from message one, and what's next.

---

## 0. STANDING RULES — read first, enforce from message one

Established (and explicitly re-confirmed) by the user mid-session. These are not suggestions — apply them without being asked again:

1. **Every source file stays under ~170 lines.** When you finish creating or growing a file, check it. If it's creeping past ~170, split it *now* — don't wait for a reminder or a second offender.
2. **Extract duplicated code the moment a second consumer needs it.** Don't wait for a third occurrence. Precedent this session: `FormModal` / `IconPicker` / `ColorPicker` / `EntityCard` were promoted to `components/ui/` the moment both Setups and Goals needed the same modal chrome / icon grid / color swatches / card shell (see §5).
3. **Keep the architecture clean and organized** — feature-folder convention (§3): root component keeps its export name, logic lives in hooks, view is JSX-only, a hook returns **one object** consumed via `ReturnType<typeof useXxx>` (never hand-written prop interfaces duplicating a hook's shape).
4. **Known pre-existing exceptions exist** — files over 170 lines that predate this rule or grew before it was reinforced. They are not blocking, but don't be surprised by them, and split opportunistically if you're already in one. Full list in §6.

Self-audit habit that worked well — run this after any batch of new/edited files, before calling the work done:
```bash
cd frontend && find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | xargs wc -l | sort -rn | awk '$1>170'
```
Anything **new** in that output gets split before moving on. Pre-existing entries from §6 are a judgment call.

---

## 1. Project at a glance

- **Monorepo** (npm workspaces): `frontend/` + `backend/`. Root `package.json` has a `dev` script (`concurrently` runs both).
- **Frontend**: Vite + **React 19** + **TypeScript** (strict; `noUnusedLocals`/`noUnusedParameters` intentionally off) + **Tailwind via CDN** (`cdn.tailwindcss.com` in `frontend/index.html`, config inline there — not a real build yet) + framer-motion + recharts + @tabler/icons-react + react-router-dom (**HashRouter**) + react-hot-toast + date-fns + **`@clerk/clerk-react`** (new this session — see §5.7).
- **Auth**: Clerk. `<ClerkProvider>` wraps the root in `index.tsx`; `App.tsx` gates the whole app shell behind `<SignedIn>`/`<SignedOut>`. Publishable key in `frontend/.env` (gitignored) as `VITE_CLERK_PUBLISHABLE_KEY`. **A `frontend/.env.example` now exists** — copy it to `.env` and fill in a real key on any fresh clone.
- **State**: single React Context (`frontend/context/AppContext.tsx`) persisted to **localStorage**. Keys: `lumex_trades`, `lumex_accounts`, `lumex_settings`, `lumex_selected_account`, and (new) `lumex_setups`, `lumex_goals`. **No backend data layer yet — this is the next major phase (§7.1).**
- **Backend** (`backend/`): a Google **Vertex AI proxy**, unused by the app (every "AI insight" in the UI is a hardcoded string). Not touched this session. Still undecided whether to keep it (§7.3).
- Mock/seed data + the de-facto stats library live in `frontend/data/mockTrades.ts` (`getNetPnL`, `getWinRate`, `getEquityCurve`, `groupBySession`, `getFundedProgress`, `getAvgRR`, etc.), now also seeding `mockSetups`/`mockGoals`.

### Run / verify
```bash
cd frontend && npm run dev        # vite dev server (http://localhost:5173)
cd frontend && npx tsc --noEmit   # typecheck (strict) — MUST be 0 errors
cd frontend && npm run build      # tsc --noEmit && vite build
cd backend  && npm run dev        # nodemon --env-file=.env.local server.js (boots on :5000, unused by app)
```
Routes (HashRouter): `#/`, `#/journal`, `#/trades`, `#/analytics`, `#/trade/:id`, `#/settings`, `#/reports`, `#/calendar`, `#/setups`, `#/goals`. Sidebar nav only surfaces Dashboard/Journal/Analytics (MAIN), Setups/Calendar/Reports/Goals (TOOLS), Settings (ACCOUNT) — `/trades` and `/trade/:id` are reachable but not top-level nav items (pre-existing, unchanged).

---

## 2. Prior phases (A–C), summarized

Already done, committed, and not revisited this session — see git history (`7b52086`, and the pre-Phase-D commits below) for full detail if you need it:
- **Phase A**: initial bug-fix pass (typecheck added, P&L/win-rate/active-trades single-source-of-truth helpers, context validation, misc fixes).
- **Phase B**: split 10 "god files" into `features/<name>/{Component, constants, hooks/, components/}`. This is the architecture convention §3 formalizes.
- **Phase C**: Calendar/Heatmap style tweaks mid-refactor.

---

## 3. Feature-folder convention (binding, unchanged from Phase B)

1. One feature → `frontend/features/<feature>/` with `components/`, `hooks/`, and `types.ts`/`constants.ts`/`utils.ts` as needed.
2. The **root component keeps its exact export name** (e.g. `export const Setups`) — only the import path in `App.tsx` changes.
3. **Logic → hooks** (`useXxx.ts`: useMemo/useState/handlers). **View → components** (JSX only, minimal logic).
4. **Avoid prop-drilling / hand-written interfaces**: a hook returns ONE object; view components type their props as `ReturnType<typeof useXxx>` or a slice of it.
5. Route-aware widgets call `useNavigate()` themselves.
6. Shared cross-feature UI goes in `components/ui/` (generic, no feature-specific logic) or `lib/` (pure helpers/constants). A feature only owns what's actually specific to it.

---

## 4. Git state

- Branch **main**, remote `github.com/mbulganbat/journal-dash`. **Working tree clean** as of this handoff.
- Commits made this session (most recent first):
  - `9778e17` Add Clerk authentication + extract shared Setup/Goal UI components
  - `062855b` Add Setups, Goals, Settings features + Calendar redesign
  - `c006776` Wire account edit, real drawdown, timezone UI + fixes
  - `ed6adaf` Refactor: split god components into feature folders + layer backend
  - `7b52086` Fix critical/high bugs, add TypeScript typecheck
- `frontend/.env` exists locally (gitignored, confirmed via `git check-ignore -v`) with a real `pk_test_...` key — do not commit it, it's already excluded. `frontend/.env.example` (new, untracked as of this handoff — commit it) documents the shape for fresh clones.

---

## 5. This session's work (Phase D) — full detail

### 5.1 Deferred cleanups (M5/M6/M7/L1/L3/L4 from the original review)
- **M5** — account "Edit" now actually calls `updateAccount` (was a fake "coming soon" toast).
- **M6** — real timezone UI. New `lib/timezone.ts`: `TIMEZONES` list, `getTimezoneOffset`, `toZonedTime` (normalizes to UTC first, then applies the target offset — the old `addHours(new Date(), offset)` double-applied the host machine's own offset).
- **M7** — `getFundedProgress` in `mockTrades.ts` now computes real drawdown off the equity curve instead of hardcoding `dailyDrawdownPct = 2.1` / `totalDrawdownPct = 3.8` for every account.
- **L1/L3** — dead imports removed (unused recharts Radar/Scatter imports, a duplicate dead tooltip).
- **L4** — `mockTrades.ts` now uses a real seeded `mulberry32`-style PRNG + Fisher-Yates shuffle, replacing a fake `Math.sin`-based "deterministic" shuffle and `Math.random()`-based trade IDs (both were actually non-deterministic).

### 5.2 Journal pagination
`features/journal/Journal.tsx`: `PER_PAGE = 9`, `currentPage` state reset to 1 on filter change, `safePage` clamps against `totalPages` (so deleting the last card on the last page can't strand the user on an empty page). The paginated grid `motion.div` has `key={safePage}` — **without this, `AnimatePresence mode="popLayout"` piles up exit-animation nodes across page switches** (was showing 18–27 cards instead of 9). If you touch pagination elsewhere, keep this key.

### 5.3 BTCUSD symbol + lot-size P&L
`lib/assetSpecs.ts`: added `BTCUSD: { multiplier: 1, pipDecimal: 0 }` to `ASSET_SPECS`, plus a `BTC`/`ETH` heuristic in `getAssetSpec`'s fallback chain for unknown symbols. Flows through the existing single-source-of-truth `derivePnl` — no duplicate math was added anywhere.

### 5.4 Setups feature (full CRUD playbook)
New `features/setups/`: `Setups.tsx` (root — KPI row + card grid), `constants.ts` (`SETUP_ICONS`, `ICON_KEYS`, `DEFAULT_ICON`), `hooks/useSetupsData.ts` (per-setup live stats via `selectActiveTrades`: win rate, net P&L, avg R:R, profit factor), `hooks/useSetupForm.ts` (CRUD form state), `components/SetupCard.tsx` (animated SVG win-rate ring, expandable rules/playbook section, uses shared `EntityCard`), `components/SetupFormModal.tsx` (uses shared `FormModal`/`IconPicker`/`ColorPicker`).
`Setup` type (`types.ts`): `{ id, name, description, rules: string[], color: AccentColor, icon: string }`. `rules` is the entry-criteria checklist — this is what the New Trade form's checklist now pulls from (§5.9).

### 5.5 Goals feature (full CRUD, metric-tracked targets)
New `features/goals/`: `Goals.tsx`, `constants.ts` (`METRIC_META` — one entry per `GoalMetric` with `label`/`unit`/`format`/`scopable`; `STATUS_META` for achieved/onTrack/atRisk/overdue), `hooks/useGoalsData.ts` (pace-based status: compares progress% vs elapsed-time% against the deadline; setup-scoped filtering when `goal.setupId` is set), `hooks/useGoalForm.ts`, `components/GoalCard.tsx` (progress bar, inline manual-progress logging for `metric: 'manual'`), `components/GoalFormModal.tsx`.
`GoalMetric` = `'manual' | 'netPnl' | 'winRate' | 'totalTrades' | 'profitFactor' | 'accountBalance' | 'avgRR'`. Metrics other than `manual` auto-compute from real trade/account data — no manual logging UI shown for those.
**Compound/setup-scoped goal support** (the "$100 challenge → trade my A setup 2–3x/day at 1:3 R:R → reach $1000" use case): `Goal.setupId?: string` + `avgRR` as a trackable metric. Any `scopable: true` metric shows a "Filter by Setup" picker in the form; when set, `useGoalsData` filters the trades feeding that goal's calculation down to just that setup's trades. Reused the pre-existing `getAvgRR` helper rather than inventing a parallel calc.

### 5.6 Shared UI extraction — the 170-line-rule fix pass
After the user restated the file-size rule, a self-audit found `GoalFormModal.tsx` (208 lines), `SetupFormModal.tsx` (176), `SetupCard.tsx` (171) over the limit — all written earlier in this same session. Fixed by promoting the common pieces to `components/ui/`:
- **`FormModal.tsx`** (63 lines) — portal-to-`document.body`, overlay, `scaleIn` card, header/body/footer chrome. Props: `isOpen, onClose, title, saveLabel, onSave, children`.
- **`IconPicker.tsx`** (45 lines) — 5-col icon grid. Props: `label?, icons: Record<string, ElementType>, iconKeys, value, onChange, accentColor`.
- **`ColorPicker.tsx`** (42 lines) — accent-color swatch row. Props: `label?, value: AccentColor, onChange`.
- **`EntityCard.tsx`** (60 lines) — card shell: ambient corner-glow blob, icon badge, title/subtitle, hover edit/delete buttons, `children` for body. Props: `icon, title, subtitle, accentSpec: ColorSpec, onEdit, onDelete, children`.

Also promoted (same session, same principle — a second feature needed them):
- **`components/ui/DatePicker.tsx`** (was `features/trade-form/components/CustomDatePicker.tsx`) — gained an optional `label` prop.
- **`components/ui/Dropdown.tsx`** (was `features/trade-form/components/CustomDropdown.tsx`) — unchanged API.
- **`lib/accentColors.ts`** — `ColorSpec` interface + `ACCENT_COLORS: Record<AccentColor, ColorSpec>` (`em`/`warning`/`purple`/`blue`, each with `hex`/`text`/`bg`/`border`/`glow`), `ACCENT_COLOR_KEYS`, `DEFAULT_ACCENT_COLOR`. **This is the one and only accent-color palette — reuse it, don't invent a parallel one.** Uses static literal classes only (no `bg-${color}` interpolation) so the Tailwind CDN's runtime scanner picks them up.

Post-fix line counts: `SetupFormModal.tsx` 95, `GoalFormModal.tsx` 125, `SetupCard.tsx` 143, `GoalCard.tsx` 110 (refactored too, for consistency, even though not technically over). Current audit in §6.

### 5.7 Calendar redesign
`features/calendar/hooks/useCalendarData.ts`: added `maxDayProfit`/`maxDayLoss` (mirrors the Heatmap's existing intensity-scaling convention).
`features/calendar/components/CalendarDay.tsx`: removed the old per-trade colored bar strip entirely. **Went through two design iterations** (user feedback: first version's flat background-color wash "looks ugly" — wanted something "fancy" and a properly "nice green"):
1. ~~Flat intensity-scaled `backgroundColor` tint across the whole card~~ — rejected.
2. **Final**: resting state has no shadow/tint on the card itself; only a small ambient glow blob (`-bottom-6 -right-6 w-20 h-20 blur-xl`, `radial-gradient(circle, rgba(color, opacity) 0%, transparent 72%)`) in the corner, opacity/color scaled by that day's P&L relative to the month's max win/loss (matches the same glow-blob language already used by `MetricCard`/`EntityCard`). Hover reveals an intensity-scaled `boxShadow` halo via `whileHover`.

### 5.8 Settings rebuild
`pages/Settings.tsx` → promoted to `features/settings/` (same promotion pattern as other features). `Settings.tsx` (root), `constants.ts` (`SECTIONS`, `FREE_TRADE_LIMIT = 15`, `PLAN_COMPARISON`), `hooks/useSettingsForm.ts` (avatar upload via `FileReader` → base64 data URL stored in `settings.avatarUrl`; upgrade/downgrade handlers), `components/SettingsNav.tsx` (its own `layoutId="settings-nav-indicator"`, distinct from Sidebar's indicator), `components/AccountSection.tsx`, `NotificationsSection.tsx`, `TradingPrefsSection.tsx`, `SubscriptionSection.tsx` (Free/Pro side-by-side comparison cards, live usage bar comparing current trade count against `FREE_TRADE_LIMIT`).
`AppSettings` gained `avatarUrl?: string` and `plan: PlanTier` (`'free' | 'pro'`, defaults to `'free'`). Sidebar's bottom profile row shows the real avatar/plan; the top "PRO" badge only renders when `settings.plan === 'pro'`.
All native `<select>`s app-wide (including the Journal's "Filter by Setup", which the user specifically called out as looking like an unstyled browser default) now go through the shared `Dropdown.tsx` instead.

### 5.9 New Trade "Setup Checklist" bug fix
Bug: the checklist was a hardcoded static list (`CHECKLIST_ITEMS` constant), completely disconnected from whichever Setup the user picked in the Strategy dropdown — creating a new Setup with its own rules had no effect on the form.
Fix (`features/trade-form/hooks/useTradeForm.ts`): new `checklistItems` memo finds the Trade's selected setup by name and returns its `rules` array; `handleSetupChange` sets the setup and clears prior checklist answers; `checklistScore`/`setupQualityScore` divide by `checklistItems.length` (guarded against 0, since a setup can have zero rules defined). `TradeFormFields.tsx` maps over `checklistItems` instead of the old static constant, shows an empty-state message when a setup has no rules yet, and a small "for {setup name}" sublabel. Dead `CHECKLIST_ITEMS` constant removed from `features/trade-form/constants.ts`.

### 5.10 Clerk authentication
- `@clerk/clerk-react` (NOT `@clerk/nextjs` — this is a Vite SPA, no App Router/middleware). The user pasted a Next.js-oriented Clerk CLI setup prompt; it was explicitly not followed because the framework didn't match — used the direct `@clerk/clerk-react` quickstart instead.
- `index.tsx`: wraps root in `<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>`, throws a clear error if the key is missing.
- `App.tsx`: `<SignedOut><SignInGate/></SignedOut>` / `<SignedIn><AppProvider>{...whole app...}</AppProvider></SignedIn>`, both inside `<Router>`, `<Toaster/>` outside both (so toasts work on the sign-in screen too).
- `components/auth/SignInGate.tsx` (new) — full-screen dark wrapper around Clerk's `<SignIn>`, `appearance.variables`/`appearance.elements` matched to the app palette (`colorPrimary: '#00FFB2'`, `colorBackground: '#0C0C0E'`, etc.), reuses the existing `Background` component + Lumex branding.
- `Sidebar.tsx`: bottom row now has the real profile info (avatar/name/plan) plus Clerk's `<UserButton afterSignOutUrl="/" appearance={{elements:{avatarBox:'w-8 h-8'}}}/>` alongside it.
- `frontend/vite-env.d.ts` (new) — `ImportMetaEnv`/`ImportMeta` typing for `VITE_CLERK_PUBLISHABLE_KEY` (Vite requires the `VITE_` prefix for client-exposed env vars).
- **Security note — action needed**: the user pasted their Clerk **Secret Key** (`sk_test_...`) in chat. It was never used or stored anywhere in code (only the Publishable Key belongs in this frontend-only integration) but **confirm with the user that they've rotated it in the Clerk dashboard** if that hasn't come up yet.

---

## 6. Current status / line-count audit

- ✅ `npx tsc --noEmit` → **0 errors**.
- ✅ `git status` → clean working tree.
- **Known files over ~170 lines** (checked at the time of this handoff — not blocking, but be aware):
  | File | Lines | Note |
  |---|---|---|
  | `data/mockTrades.ts` | 451 | Mock data + de-facto stats library; grew this session (setup/goal seeds, seeded RNG, real drawdown). Candidate to split stats-fns vs. seed-data if touched again. |
  | `features/analytics/hooks/useAnalyticsData.ts` | 415 | Pre-existing from Phase B, not touched this session. |
  | `features/analytics/Analytics.tsx` | 308 | Pre-existing from Phase B, not touched this session. |
  | `features/trade-form/hooks/useTradeForm.ts` | 295 | Grew this session (checklist wiring, §5.9). |
  | `features/trade-form/components/TradeFormFields.tsx` | 292 | Grew this session (checklist wiring, §5.9). |
  | `context/AppContext.tsx` | 219 | Grew this session (setups/goals state + CRUD). |
  | `features/calendar/components/CalendarHeader.tsx` | 185 | Pre-existing from Phase B, not touched this session. |

  Everything else created or touched this session is under 170 (highest: `useCalendarData.ts` at 147). If you're about to make substantial edits to any file in this table, consider splitting it first per §0 rule 4 — but don't block unrelated work on it.

---

## 7. What's LEFT — next steps, in order

### 7.0 Immediate housekeeping
- [ ] Confirm the user has rotated their Clerk **Secret Key** in the Clerk dashboard (it was exposed in chat — see §5.10). Only the Publishable Key should ever be needed here.
- [x] ~~Commit `frontend/.env.example`~~ — done (committed alongside this checklist update).
- [x] ~~Root `package.json` `@supabase/server` dependency~~ — done. Turned out to be a real Supabase package (server-side/Edge Functions utils), not a typo-squat, but still the wrong one for a browser SPA. Removed from root; `@supabase/supabase-js@^2.110.0` added to `frontend/package.json` instead, ready for §7.1.

### 7.1 Supabase — next major phase (not started)
This is the natural next step after Clerk (auth is done; data layer is next):
1. Design schema: `accounts`, `trades`, `settings`, `setups`, `goals` tables, each FK'd to a user identifier tied to the signed-in Clerk user.
2. Wire Clerk ↔ Supabase auth. **Check current Supabase docs when you start this** — Supabase has first-class "Third-Party Auth" support for Clerk now, which may supersede any older JWT-template-based approach; don't assume implementation details without checking, since this integration surface moves.
3. Set up Row Level Security policies keyed on that user identifier.
4. Add `@supabase/supabase-js`, migrate `AppContext`'s localStorage read/write to Supabase queries — **feature by feature**, using the existing `loadFromStorage` pattern as the seam to swap (trades first is a reasonable start, since it's the most-used data).
5. Decide on loading/optimistic-update states once real network calls replace synchronous localStorage reads.

### 7.2 Vercel deployment (blocked on Tailwind migration)
- Migrate Tailwind from the CDN (`cdn.tailwindcss.com` is dev-only — warns in console, doesn't tree-shake) to a real Tailwind/PostCSS build.
- Watch: `Shared.tsx`'s `TagPill` uses dynamic classes (`bg-${color}/10`) that only resolve under the CDN's runtime scanner — they'll need safelisting or a rewrite to literal classes under a real build. `lib/accentColors.ts` already establishes the literal-class pattern to follow (see §5.6) — that file is a good template for the rewrite.
- Then env vars + `vercel.json` rewrites for the HashRouter SPA.

### 7.3 Loose ends (low priority, no rush)
- Decide whether to keep or delete the unused Vertex AI `backend/`.
- Opportunistically split the §6 pre-existing >170-line files when next touching them.

---

## 8. Gotchas (carry forward — read before you hit these yourself)

- **`document.hidden` freezes animations in the Claude Preview MCP browser.** Since the automated tab often isn't genuinely focused, `document.hidden` is `true`, which freezes anything driven by `requestAnimationFrame` (framer-motion `animate`/`whileHover`, `useCountUp`, `ProgressBar` width) at its frame-zero state when read via `preview_eval` right after navigation. **This is a tooling artifact, not an app bug** — confirmed by comparing against pre-existing, already-shipped components showing identical freezing. **Fix**: `preview_click` a neutral element (`body`, an `<h1>`) to force the tab into active rendering before screenshotting or reading final animated values. Synthetic `dispatchEvent`-based hover simulation does **not** reliably trigger framer-motion's `whileHover` — this is a tooling limitation, not something to "fix" in app code.
- **`createPortal(..., document.body)` is required for any `fixed`-position modal rendered inside a routed page.** `App.tsx`'s content wrapper (`<div className="... relative z-10">`) traps `fixed` children in a stacking context below the Sidebar (`z-50`), so an un-portaled modal renders *behind* the sidebar. Already fixed in `ConfirmDialog.tsx` and baked into the shared `FormModal.tsx` — any new modal should use `FormModal` or portal itself the same way.
- **Tailwind CDN only picks up static literal classes**, not `bg-${variable}` string interpolation (its runtime JIT scanner can't see dynamic template strings). This is why `lib/accentColors.ts` and `STATUS_META` hand-enumerate every class combination per color/status instead of building class names dynamically. Keep doing this until the Vercel/PostCSS migration (§7.2) — after that migration, safelisting becomes the alternative, but literal enumeration is simpler and still works fine under a real build too.
- **Vite HMR stale-delete bug**: after removing a moved/renamed file, the dev server may keep logging `[vite] Failed to reload /old/path.tsx`. Not a real error — restart the preview server (`preview_stop` + `preview_start`) to confirm a truly clean console.
- Tailwind config (colors like `bg-2`, `text-1`, `em`, `danger`, radii like `rounded-card`) lives **inline in `frontend/index.html`**, not a separate config file.
- Backend `.env.local` uses `//` comments (Node's `--env-file` tolerates it). Backend is unused by the app — don't block frontend work on it.
- User communicates in **Mongolian (romanized)**; reply in Mongolian. Common shorthand: "zas" = fix, "nem" = add, "hii"/"hiy" = do/build, "urgeljluul" = continue, "daraagiihaa" = next.
