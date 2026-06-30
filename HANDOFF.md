# Lumex Trading Journal — Session Handoff

> Paste this into a fresh chat to continue. It captures everything done so far, the conventions to keep, how to verify, and what's left. Last updated mid-refactor.

---

## 1. Project at a glance

- **Monorepo** (npm workspaces): `frontend/` + `backend/`. Root `package.json` has `dev` script (concurrently runs both).
- **Frontend**: Vite + **React 19** + **TypeScript** + **Tailwind via CDN** (`cdn.tailwindcss.com` in `frontend/index.html` — config is inline there) + framer-motion + recharts + @tabler/icons-react + react-router-dom (HashRouter) + react-hot-toast + date-fns.
- **State**: single React Context (`frontend/context/AppContext.tsx`) persisted to **localStorage** (keys `lumex_trades`, `lumex_accounts`, `lumex_settings`, `lumex_selected_account`). No backend data layer yet.
- **Backend** (`backend/`): a Google **Vertex AI proxy** (boilerplate from the AI-Studio export). **The trading-journal app does NOT call it** — every "AI insight" in the UI is a hardcoded string. It's kept/refactored but unused by the app.
- Mock/seed data + all stats functions live in `frontend/data/mockTrades.ts` (named "mock" but it's the de-facto stats library: `getNetPnL`, `getWinRate`, `getEquityCurve`, `groupBySession`, `getFundedProgress`, etc.).

### Run / verify
```bash
cd frontend && npm run dev        # vite dev server (http://localhost:5173)
cd frontend && npx tsc --noEmit   # typecheck (strict)  — MUST be 0 errors
cd frontend && npm run build      # tsc --noEmit && vite build
cd backend  && npm run dev        # nodemon --env-file=.env.local server.js (boots on :5000)
```
Frontend uses **HashRouter** → routes are `#/`, `#/journal`, `#/trade/:id`, `#/analytics`, `#/calendar`, `#/reports`, `#/settings`, `#/trades`.

---

## 2. Git state

- Branch: **main**. Remote: `github.com/mbulganbat/journal-dash`.
- **Committed + pushed**: commit `7b52086` "Fix critical/high bugs, add TypeScript typecheck" (all the Phase-A bug fixes + tsconfig).
- **UNCOMMITTED working tree** (~13 changed/added trees): the entire **architecture refactor (Phase B)** + style tweaks (Phase C) + backend layering. Not yet committed. (Commit/push only when the user asks.)

---

## 3. Phase A — Bug fixes (DONE, committed in 7b52086)

- Added `frontend/tsconfig.json` (strict; `noUnusedLocals`/`noUnusedParameters` intentionally OFF) + `typecheck`/`build` scripts + `@types/react`/`@types/react-dom`. **There was no type-checking before — this is the safety net.**
- **C1**: `NewTradePanel` read non-existent `activeAccountId` from context → fixed to `selectedAccountId`.
- **C2**: Analytics `blueprint.worstEmotion` was undefined → now computed.
- **C3**: backend imported undeclared `node-fetch` → removed (Node 18+ global fetch).
- Analytics drawdown chart `<Tooltip content={<></>}>` flooded console 480× → `content={() => null}`.
- **H1 — one P&L source of truth**: created `frontend/lib/assetSpecs.ts` (`ASSET_SPECS`, `getAssetSpec`, `derivePnl`). Calendar now uses stored `trade.pnl`; removed duplicate `ASSET_SPECS` from NewTradePanel/TradeDetail.
- **H2 — one win-rate**: everyone uses `getWinRate` (excludes breakeven).
- **H3 — one "active trades" rule**: created `frontend/lib/selectActiveTrades.ts`. Rule: a specific account → its trades; "All accounts" (`selectedAccountId === null`) → all **non-challenge** accounts combined. Used by Topbar, Dashboard, Analytics, Reports, Journal, Trades.
- **H4**: Reports guards against zero accounts (FALLBACK_ACCOUNT + empty state).
- **H5**: `AppContext` now validates localStorage on load (`loadFromStorage` helper) + merges settings over defaults.
- **M1** stray `/index.js` script in index.html removed. **M3/M4** Trades got a delete ConfirmDialog + pagination clamp. **L7** `vite.config` `plugins: [react()]`.
- Layout: `App.tsx` content div got **`min-w-0`** to kill a horizontal-overflow bug.

---

## 4. Phase B — Architecture refactor (DONE, uncommitted)

**All 10 "god files" split into `features/<name>/` (or backend layers).** Each was approved up-front in a written plan.

### Conventions (FOLLOW THESE for any further splitting)
1. One feature → `frontend/features/<feature>/` with `Components/`… actually: `components/`, `hooks/`, and `types.ts`/`constants.ts`/`utils.ts` as needed.
2. The **root component keeps its exact export name** (e.g. `export const Analytics`) so only the **import path in `App.tsx`** changes. After moving, **delete the old file** and `grep` for dangling refs.
3. **Logic → hooks** (`useXxx.ts`: all useMemo/useState/handlers). **View → components** (JSX only). **Pure helpers → `utils.ts`**.
4. **Avoid prop-drilling**: a hook returns ONE object; pass that object (or specific slices) to view components. Type component props with `ReturnType<typeof useXxx>['field']` — **don't hand-write big interfaces** (no redesign).
5. Behavior must stay identical — copy code **verbatim**, only relocate. Don't rename the user's variables or reformat. Only drop imports that become unused *because of a move*.
6. Route-aware widgets call `useNavigate()` themselves (don't prop-drill `navigate`).

### What got created (all verified: tsc 0, build green, console clean, behavior checked in browser)
- `features/analytics/` (13 files): `Analytics.tsx` (root), `constants.ts`, `hooks/useAnalyticsData.ts` (ALL the calc memos), `components/` = AnalyticsTooltips, OverviewTab, EquityDrawdownChart, BlueprintCard, ExpectancyCard, TopSymbolCard, StreakCard, TimeSessionTab, SetupsPairsTab, BehaviorTab, ReportModal.
- `features/trade-form/` (7): `NewTradePanel.tsx` (root), `constants.ts`, `hooks/useTradeForm.ts`, `components/` = CustomDropdown, CustomDatePicker, TradeFormFields, LivePreview.
- `features/calendar/` (11): `Calendar.tsx` (root), `types.ts`, `constants.ts`, `utils.ts`, `hooks/useCalendarData.ts`, `components/` = CalendarHeader, CalendarGrid, CalendarDay, CalendarLegend, WeekSidebar, DayDetailModal.
- `features/dashboard/` (11): `Dashboard.tsx` (root), `types.ts`, `hooks/useDashboardData.ts`, `components/` = MetricsGrid, WeekStrip, EquityCurveCard, WinRateCard, EmotionsCard, SessionPnlCard, TopSetupsCard, RecentTradesCard. (Imports heatmap from `../heatmap`.)
- `features/journal/` (6): `Journal.tsx` (root), `constants.ts`, `hooks/useJournalFilters.ts`, `components/` = FilterDropdown, JournalFilterBar, TradeCard.
- `features/heatmap/` (7): `TradingActivityHeatmap.tsx` (root), `types.ts`, `hooks/useHeatmapData.ts`, `components/` = StatusBadges, HeatmapGrid, HeatmapDetailPanel, HeatmapLegend.
- `features/trade-detail/` (10): `TradeDetail.tsx` (root), `hooks/useTradeDetail.ts`, `components/` = ScreenshotCarousel, MetadataGrid, NotesEditor, MistakesLessons, ExecutionCard, ExitOutcomeCard, PsychologyCard, AiInsightsCard.
- `features/reports/` (5): `Reports.tsx` (root), `hooks/useReportsData.ts`, `components/` = PropFirmCard, ExecutiveBriefingCard, ComplianceExportCard.
- `features/accounts/` (4): `ManageAccountsModal.tsx` (root), `hooks/useAccountForm.ts`, `components/` = AccountForm, AccountCard.
- **backend** (9): `server.js` (thin entry) + `src/config/env.js`, `src/middleware/rateLimiter.js`, `src/models/apiClients.js`, `src/services/{patternService,authService,wsProxyService}.js`, `src/controllers/proxyController.js`, `src/routes/proxyRouter.js`. Layering: router→controller→services + model + config/middleware. Verified: all `node --check` pass + `node --env-file=.env.local server.js` boots and listens on :5000.

### Stays shared / unchanged (imported by features)
`context/AppContext.tsx`, `hooks/useCountUp.ts`, `lib/{animations,assetSpecs,selectActiveTrades}.ts`, `data/mockTrades.ts`, `components/ui/Shared.tsx` (`MetricCard`, `ProgressBar`, `TagPill`, `Toggle`, `premiumHoverProps`), `components/layout/{Background,Sidebar,Topbar}.tsx`, `components/modals/{ConfirmDialog,ImportModal}.tsx`.

---

## 5. Phase C — Style/feature tweaks the user requested mid-refactor (DONE)

**Calendar** (`features/calendar/`):
- `font-['JetBrains_Mono']` (font wasn't loaded → serif fallback) → `font-mono` everywhere.
- Account dropdown was rendering *behind* the grid → filter-row bumped `z-10` → `z-20`.
- Weekly Net P&L used dynamic font size (jumped) → fixed `text-3xl`; removed `getCurrencyFontSize`.
- Right "Week Window" sidebar was 60px lower than the calendar → `xl:top-24` → `xl:top-9` (aligned).
- Monthly Overview now shows **"Week 1/2/…"** (was "Jun 1-7") with the date range as a subtitle + staggered/hover motion (`range` field added to `MonthlyWeek`).
- Day-detail modal: clicking a trade now navigates to `/trade/:id`.
- Footer stat badges: added a **4th** ("Total Trades") so the 2×2 grid has no empty cell.
- Calendar grid: adjacent-month days now render blank (only current month shown).

**Heatmap** (`features/heatmap/`):
- Grid is now the **Jan–Dec calendar year** (`startOfYear`→`endOfYear`), not trailing 365 days. Month labels read Jan…Dec (a trailing "Jan" can appear from the last partial week — expected, GitHub-style).
- Hover detail moved from a per-cell floating tooltip to a **fixed right-side panel** (`HeatmapDetailPanel`) in the empty space; `hoveredDate:string` → `hoveredCell:HeatmapCell` lifted to root.
- Cells shrunk 14px → **12px**; wrapper `justify-center` → `justify-start`. Combined with `App.tsx` `min-w-0`, this fixed the heatmap+panel overflowing the viewport.

---

## 6. Current status

- ✅ `tsc --noEmit` → **0 errors**. ✅ `npm run build` → green (~979 kB / 281 kB gzip). ✅ backend boots.
- ✅ Every feature visually verified in the browser via the Claude Preview MCP.
- `pages/` now contains only **`Settings.tsx`** (168 lines) and **`Trades.tsx`** (147) — neither is a god file.

---

## 7. What's LEFT

### Immediate (optional finish of the refactor)
- Decide: move `pages/Settings.tsx` → `features/settings/` and `pages/Trades.tsx` → `features/trades/` (plain moves, no internal split needed), OR leave them in `pages/`. (User was asked, hasn't decided.)
- **Commit the refactor.** It's all uncommitted. Suggested: feature branch → PR, or commit to main if the user says so. (Don't commit/push without being asked.)

### The original roadmap (the actual end goal — refactor was prep)
1. **Supabase** — replace `localStorage` with a real DB. Schema: `accounts`, `trades`, `settings` (FK + `user_id`) + RLS. Add `@supabase/supabase-js` (NOTE: root `package.json` currently has a bogus `@supabase/server` dep — wrong package, replace with `@supabase/supabase-js`). The `AppContext` + `loadFromStorage` structure is the seam to swap.
2. **Clerk** — auth; wire Clerk `user_id` into Supabase RLS.
3. **Vercel** — deploy. **Blocker M2**: migrate Tailwind from the CDN (`cdn.tailwindcss.com` is dev-only, warns in console, won't tree-shake) to a real Tailwind/PostCSS build. Watch out: `TagPill` in `Shared.tsx` uses dynamic classes (`bg-${color}/10`) that only work with the CDN's runtime scan — they must be safelisted/enumerated under a build. Then env vars + `vercel.json` rewrites. Decide whether to keep/delete the unused Vertex backend.

### Deferred cleanups (flagged in the original review, not yet done)
- **M5** account "Edit" is a fake toast ("coming soon") though `updateAccount` exists in context.
- **M6** `settings.timezone` is used by Sidebar/Analytics but there's no UI to change it (stuck on "UTC"); also `addHours(new Date(), offset)` double-applies local offset.
- **M7** `getFundedProgress` hardcodes drawdown (`dailyDrawdownPct = 2.1`, `totalDrawdownPct = 3.8`) for ALL accounts — Analytics/Reports compute real drawdown, reuse that.
- **L1/L3** dead imports (e.g. unused recharts Radar/Scatter imports in Analytics, a duplicate dead `RadarTooltip`) — best done with an ESLint pass (tsconfig has noUnusedLocals OFF, so tsc won't catch them).
- **L4** `mockTrades.ts` "deterministic shuffle" is actually non-deterministic (`Math.sin` comparator + `Math.random()` ids). Bundle is ~979 kB → code-split / tree-shake icons later.

---

## 8. Gotchas / how to verify (IMPORTANT for the next session)

- **Verify every change**: `npx tsc --noEmit` (must be 0) → `npm run build` → browser via Claude Preview MCP (`preview_start`, `preview_eval`, `preview_screenshot`, `preview_console_logs`).
- **Vite HMR stale-delete bug**: after you `rm` a moved file, the dev server keeps logging `[vite] Failed to reload /old/path.tsx`. These are **NOT real errors** — they're dev-server module-graph cache. **Restart the preview server** (`preview_stop` + `preview_start`) to clear them and confirm a truly clean console.
- **Screenshots look tiny/scaled** when the page is tall (full-document capture) or when there's horizontal overflow — measure with `preview_eval` (`document.documentElement.scrollWidth > clientWidth`) to confirm overflow rather than trusting the thumbnail.
- **innerText respects CSS** `text-transform: uppercase` and skips `display:none` — use case-insensitive regex and account for `hidden`/`xl:` responsive classes when asserting via eval.
- Tailwind config (colors like `bg-2`, `text-1`, `em`, `danger`, radii `rounded-card`) lives **inline in `frontend/index.html`**, not a config file.
- Backend `.env.local` uses `//` comments (Node `--env-file` tolerates it). Backend is **unused by the app** — don't block frontend work on it.
- User communicates in **Mongolian (romanized)**; reply in Mongolian. "urgeljluul" = continue, "zas" = fix, "next"/"daraagiihruu" = next feature.
