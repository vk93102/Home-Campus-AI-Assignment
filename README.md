# ⚛️ Statyx Frontend — Referral Network Analytics Dashboard

> **A production-grade React 18 + TypeScript single-page application** delivering an interactive referral network intelligence dashboard with graph-theoretic visualisations, sports props analytics, multi-provider OAuth authentication, spring-physics animation orchestration, and a composable Recharts data visualisation layer — built for the Mercor Challenge and deployed live at [statyx.io](https://statyx.io).

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-98.8%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-FF0050?style=flat-square)](https://www.framer.com/motion/)
[![Recharts](https://img.shields.io/badge/Recharts-2.x-22b5bf?style=flat-square)](https://recharts.org)
[![ESLint](https://img.shields.io/badge/ESLint-strict-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org)

---

## 🔗 Quick Links

| Resource | URL |
|---|---|
| 🌐 Live Platform | [statyx.io](https://statyx.io) |
| 🎬 Live Demo Video | [Watch on Google Drive](https://drive.google.com/file/d/1MM9s7fH6XkBgMpIbQMhxkwRXxrmdAb6m/view?usp=sharing) |
| 🐍 Backend Repo | [github.com/vk93102/statyx-Backend](https://github.com/vk93102/statyx-Backend) |
| ⚛️ Frontend Repo | [github.com/vk93102/statyx-frontend](https://github.com/vk93102/statyx-frontend) |

---

## 📋 Table of Contents

- [Demo Walkthrough](#-demo-walkthrough)
- [Project Overview](#-project-overview)
- [Frontend Architecture](#️-frontend-architecture)
- [Component Hierarchy](#-component-hierarchy)
- [Tech Stack Deep Dive](#-tech-stack-deep-dive)
- [State Management Architecture](#-state-management-architecture)
- [Graph Algorithm Engine](#-graph-algorithm-engine)
- [Data Visualisation Layer](#-data-visualisation-layer)
- [Animation System](#-animation-system)
- [Authentication Flow (Frontend)](#-authentication-flow-frontend)
- [Backend Integration](#-backend-integration)
- [Performance Architecture](#-performance-architecture)
- [Directory Structure](#-directory-structure)
- [Design System](#-design-system)
- [Build Pipeline](#️-build-pipeline)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)

---

## 🎬 Demo Walkthrough

> 📺 **[Watch the full live demo on Google Drive](https://drive.google.com/file/d/1MM9s7fH6XkBgMpIbQMhxkwRXxrmdAb6m/view?usp=sharing)**

The demo covers the complete end-to-end user journey across both the frontend SPA and its integration with the Django REST backend. Here is a detailed breakdown of what is demonstrated:

---

### 🔐 Part 1 — Authentication & Onboarding

**What you see:**
The application opens to a polished sign-in/sign-up surface with three distinct authentication pathways rendered with Framer Motion entrance animations and staggered micro-interaction reveals.

**Technical detail:**
- **Google OAuth 2.0 flow** — Frontend triggers Google Sign-In popup, receives ID token (JWT), POSTs to `POST /api/auth/google/` on the Django backend. Backend verifies the JWT signature against Google's JWKS endpoint, extracts the `sub` claim as stable identity, upserts the user record in PostgreSQL, and returns a Django session cookie (`HttpOnly; Secure; SameSite=Lax`).
- **LinkedIn OAuth 2.0 PKCE flow** — Frontend redirects to LinkedIn authorization endpoint with `scope=openid profile email`. LinkedIn issues an auth code, the callback page exchanges it with the Django backend via `POST /api/auth/linkedin/`, which fetches the user's professional profile from LinkedIn `/v2/me` and upserts on `linkedin_id`.
- **Twilio SMS OTP flow** — User enters phone number, triggering `POST /api/auth/send-otp/` which dispatches an SMS via the Twilio Verify API (`twilio.verify.v2.services.verifications.create()`). User enters the 6-digit code, `POST /api/auth/verify-otp/` calls `verification_checks.create()` — on `status == "approved"`, a Django session is established.

**What to notice:** Smooth Framer Motion spring-physics transitions between auth steps, loading spinner states during API round-trips, error boundary handling for failed OAuth callbacks.

---

### 📊 Part 2 — Network Analytics Dashboard (Overview Tab)

**What you see:**
The primary dashboard surface renders an animated KPI card grid showing total network size, direct referral counts, indirect reach, and top-line growth metrics — all driven by graph traversal computations.

**Technical detail:**
- **Network reach computation** runs client-side via `utils/graphAlgorithms.js` — a BFS traversal from each root node through the adjacency list representation of the referral DAG. Time complexity: **O(V + E)** where V = users, E = referral edges.
- **Counter animations** use Framer Motion's `useMotionValue` + `useTransform` hooks with spring physics configuration (`stiffness: 100, damping: 30`) — numbers count up from 0 to their final value on mount, with configurable duration driven by value magnitude.
- **KPI cards** implement staggered `AnimatePresence` with `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` with `delay: index * 0.08` creating a cascading reveal on page load.
- Data is fetched via **RTK Query** `networkApi` endpoints — automatically cached with a 5-minute TTL, deduplicated across concurrent renders, and refetched on window focus.

**What to notice:** The cascade animation on load, real-time metric cards, responsive grid collapsing on mobile viewport.

---

### 👑 Part 3 — Influencer Analysis Tab

**What you see:**
A ranked leaderboard of the most influential users in the referral network, with unique reach scores, flow centrality values, and comparative bar visualisations.

**Technical detail:**
- **Greedy submodular maximisation** algorithm (`greedyInfluencers()` in `graphAlgorithms.js`) selects the top-k users maximising total unique network reach with minimum audience overlap. Approximation guarantee: **(1 - 1/e) ≈ 63% of optimal** — the standard monotone submodular function maximisation bound. Time complexity: **O(k × V²)**.
- **Flow centrality** (`flowCentrality()`) computes all-pairs shortest paths via Floyd-Warshall — **O(V³)** — to quantify how much network flow passes through each node. High centrality = structural bottleneck = high-value influencer.
- Influencer cards render with **Recharts `<BarChart>`** showing reach comparison, with animated bar entry using `animationDuration={800}` and `animationEasing="ease-out"`.
- Rankings use a custom comparator prioritising `uniqueReach` descending, with `flowCentrality` as a tiebreaker.

**What to notice:** The bar charts animating in, the reach vs. centrality distinction, the ranked table with sortable columns.

---

### 📈 Part 4 — Growth Simulation Tab

**What you see:**
An interactive simulation control panel where users configure referral rate, conversion probability, days to simulate, and initial seeding — producing a live Recharts Line chart of projected network growth.

**Technical detail:**
- **Discrete-time growth simulation** (`simulateGrowth()`) models network expansion as: `users_at_day_t = users_at_day_t-1 + (active_referrers × referral_rate × conversion_prob)`. Each day's referrer count uses the prior day's active user count weighted by an adoption probability function (monotonically increasing S-curve). Time complexity: **O(days × active_referrers)**.
- **Adoption modelling** uses a logistic growth function: `P(t) = 1 / (1 + e^(-k(t - t₀)))` where `k` controls steepness and `t₀` is the inflection point — modelling the realistic S-curve of viral product adoption.
- **Binary search for target achievement** (`binarySearchTarget()`) — given a target user count T, binary searches over the days axis to find the minimum days D* such that `simulate(days=D*).users >= T`. Time complexity: **O(log(max_days) × simulation_cost)**.
- The Recharts `<LineChart>` updates reactively on every slider change via `useCallback`-memoised simulation re-runs, with `animationDuration={300}` for smooth chart transitions.

**What to notice:** Real-time chart update on slider drag, the S-curve shape of realistic growth, the target-day binary search marker on the chart.

---

### 💰 Part 5 — Bonus Optimisation Tab

**What you see:**
A scenario comparison table and bar chart showing the minimum bonus value required to achieve different user acquisition targets, computed via binary search over the simulation function.

**Technical detail:**
- **Bonus optimisation** (`optimiseBonus()`) wraps the growth simulation in a binary search over the bonus range `[0, MAX_BONUS]`. For each candidate bonus `mid`, runs the full simulation and checks if `result.users >= target`. Converges in **O(log(MAX_BONUS))** iterations, each costing one simulation run.
- Multiple target scenarios are computed in parallel using JavaScript's event loop — each scenario's binary search is initiated as a separate synchronous computation, results collected and rendered as a comparative bar chart.
- **ROI analysis** computes `cost_per_acquired_user = optimal_bonus × projected_acquirees` for each scenario, surfacing the most capital-efficient bonus tier.

**What to notice:** The comparison across different target tiers, the ROI efficiency metric, bar chart scenario comparison.

---

### 🏀 Part 6 — Sports Props Research (NBA / NFL / Soccer)

**What you see:**
A date-scoped fixture list for NBA, NFL, and Soccer (BETA), with per-fixture player prop cards showing hit rates, odds comparison, EV scores, and matchup grades — all fetched in real time from the Django backend.

**Technical detail:**
- **RTK Query** `fixturesApi` fetches `GET /api/nba/fixtures/?date=YYYY-MM-DD` — the selected date flows through React Router's URL search params, making the fixture view deep-linkable and browser-history-aware.
- **Prop cards** display `hit_rate_l5`, `hit_rate_l10`, `hit_rate_season` from the backend's pre-computed splits, along with `ev_score` (Expected Value %) and `matchup_grade` (A+ → F) served directly from the Django `NBAPlayerProp` model's serialized representation.
- **EV Badge** component classifies `ev_score` into visual tiers: > +8% → 🟢 green, +4–8% → 🟡 yellow, +1–4% → ⚪ grey, negative → 🔴 hidden.
- **Odds table** renders multi-book over/under comparison with inline vig (juice) calculation: `vig = P_over_implied + P_under_implied - 1.0`.
- Date navigation uses `date-fns` for ISO 8601 date arithmetic, with prev/next day controls updating the RTK Query cache key and triggering a background refetch.

**What to notice:** The date selector updating all fixtures, prop card EV badge colouring, hit rate trend across L5/L10/season windows, matchup grade badge.

---

## 🌐 Project Overview

This repository is the **client-side application** of the Statyx platform — a React 18 SPA consuming the [statyx-Backend](https://github.com/vk93102/statyx-Backend) Django REST API over CORS-permitted HTTPS.

The frontend's architectural responsibility is split into three orthogonal domains:

**1. Graph Analytics Computation & Visualisation** — All referral network graph algorithms (BFS, DFS, greedy selection, Floyd-Warshall centrality, discrete-time simulation, binary search optimisation) execute in the browser, in `utils/graphAlgorithms.js`, with results piped directly into Recharts visualisations via React state — zero server round-trips for computation, only for data persistence.

**2. Sports Props Research UI** — A server-state-driven interface consuming the Django props API via RTK Query, with automatic caching, background refetching, and optimistic updates. Presents pre-computed EV scores, hit rates, matchup grades, and multi-book odds without client-side analytics computation.

**3. Multi-Provider Authentication Shell** — OAuth 2.0 callback handling, Twilio OTP verification flow, and session-cookie-based auth state management — bridging three identity providers through a unified Django session backend.

---

## 🏗️ Frontend Architecture

```
Browser (statyx.io)
│
├── index.html                     ← Vite entry point, single DOM mount target
│
└── main.jsx                       ← React.createRoot() + Redux Provider
    │
    └── App.jsx                    ← React Router v6 BrowserRouter
        │
        ├── /auth/*                ← Public routes (no session required)
        │   ├── /sign-in           → <SignIn />
        │   ├── /sign-up           → <SignUp />
        │   ├── /verify-otp        → <OTPVerify />
        │   └── /auth/*/callback   → <OAuthCallback />
        │
        └── /app/*                 ← Protected routes (session required)
            │
            ├── Layout wrapper     ← Sidebar nav + dark sidebar dock
            │
            ├── /app/overview      → <Overview />      Network KPIs
            ├── /app/influencers   → <Influencers />   Ranked table
            ├── /app/simulation    → <Simulation />    Growth sim
            ├── /app/optimization  → <Optimization />  Bonus optimiser
            ├── /app/nba           → <NBAProps />       NBA fixtures + props
            ├── /app/nfl           → <NFLProps />       NFL fixtures + props
            └── /app/soccer        → <SoccerProps />    Soccer fixtures
```

### Data Flow Architecture

```
User Interaction
      │
      ▼
React Component
      │
      ├── Local state (useState / useReducer)
      │         └── UI-only: modal open, input value, tab selection
      │
      ├── Redux slice dispatch (createSlice)
      │         └── Cross-component: auth state, selected date, active sport
      │
      └── RTK Query hook (useGetFixturesQuery / useGetPropsQuery)
                └── Server state: fixtures, props, network graph data
                          │
                          ├── Cache HIT  → renders immediately
                          └── Cache MISS → fetch → normalise → cache → render
                                    │
                                    ▼
                              Django REST API
                              (statyx-Backend on Render.com)
                                    │
                                    ▼
                              PostgreSQL 15
```

---

## 🧩 Component Hierarchy

```
App.jsx
├── AuthGuard (HOC)                    Session validation wrapper
│   └── ProtectedRoute                 Redirects unauthenticated users
│
├── Sidebar                            Dark nav panel
│   ├── NavLink × 7                    Sport + dashboard links
│   └── FloatingDock                   Collapsed action controls
│
├── Dashboard Pages
│   │
│   ├── Overview
│   │   ├── KPICard × 4               Animated metric cards (Framer Motion)
│   │   ├── ReachChart                 Recharts BarChart — reach distribution
│   │   └── GrowthTrendLine            Recharts LineChart — historical growth
│   │
│   ├── Influencers
│   │   ├── InfluencerTable            Sortable ranked table
│   │   │   └── InfluencerRow × n      Per-user row with reach + centrality
│   │   └── ReachBarChart              Recharts BarChart — comparative reach
│   │
│   ├── Simulation
│   │   ├── SimControls                Slider panel (rate, prob, days)
│   │   ├── GrowthLineChart            Recharts LineChart — projected growth
│   │   └── TargetMarker               Binary-search result annotation
│   │
│   └── Optimization
│       ├── ScenarioTable              Target tier comparison table
│       ├── BonusBarChart              Recharts BarChart — bonus per scenario
│       └── ROIMetricCard              Cost-per-acquisition metric
│
└── Sports Pages
    ├── NBAProps / NFLProps / SoccerProps
    │   ├── DateSelector               ISO 8601 date nav (date-fns)
    │   ├── FixtureList                Fetched via RTK Query
    │   │   └── FixtureCard × n
    │   │       └── PropList
    │   │           └── PropCard × n
    │   │               ├── PlayerInfo
    │   │               ├── HitRateBar (L5 / L10 / season)
    │   │               ├── OddsTable  (multi-book over/under + vig)
    │   │               └── EVBadge    (classified EV%)
    │   └── LoadingSkeletons           Framer Motion skeleton screens
    │
    └── Shared
        ├── PropCard
        ├── OddsTable
        ├── EVBadge
        └── MatchupGradeBadge
```

---

## 🛠 Tech Stack Deep Dive

### Core Framework

**React 18** with concurrent mode features — `useTransition` for deferring non-urgent state updates during simulation re-renders, `Suspense` boundaries wrapping RTK Query data-fetching components for declarative loading states, and `React.memo` + `useMemo` for referential equality optimisation on expensive chart re-renders.

**TypeScript 5 (strict mode)** — `tsconfig.json` enables `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`. All API response shapes are typed via discriminated union interfaces. All component props are typed with no implicit `any`. Graph algorithm return types are fully annotated.

### Build Tooling

**Vite 5 with SWC** (`@vitejs/plugin-react-swc`) — Rust-native TypeScript/JSX transpiler replacing Babel. SWC is ~20× faster than Babel for large codebases. Vite's native ESM dev server eliminates the bundling step entirely during development — each module is served as a raw ES module, enabling true sub-10ms HMR for individual component edits.

Production build produces **tree-shaken ES module bundles** with automatic code-splitting at the route boundary — each dashboard tab is a separate dynamic import chunk, ensuring the initial page load only downloads the authentication shell (~40KB gzip) with remaining chunks loaded on-demand.

**ESLint** with strict configuration (`eslint.config.js`) — enforces consistent import ordering, no unused variables, exhaustive dependency arrays in `useEffect`/`useCallback`/`useMemo`, and React-specific rules (no missing keys, no direct state mutation).

### State Management

**Redux Toolkit (`@reduxjs/toolkit`)** — The global state store uses `configureStore` with three slices:

```
authSlice        — {user, sessionStatus, oauthProvider, loadingState}
networkSlice     — {nodes, edges, computedMetrics, selectedSimConfig}
uiSlice          — {selectedDate, activeSport, sidebarCollapsed}
```

All slices use **Immer-powered reducers** (built into RTK) — mutable-style state updates that produce immutable state via structural sharing, eliminating accidental mutation bugs.

**RTK Query** — Eliminates manual `useEffect` + `fetch` + loading/error state boilerplate. Each API endpoint definition auto-generates typed React hooks:

```javascript
// Auto-generated hooks from endpoint definitions:
useGetNBAFixturesQuery({ date })          // fixtures list
useGetPlayerPropsQuery({ fixtureId })     // props per fixture
useGetNetworkInfluencersQuery()           // influencer rankings
useSendOTPMutation()                      // OTP dispatch
useVerifyOTPMutation()                    // OTP verification
```

Cache entries are keyed by serialised argument — `useGetNBAFixturesQuery({ date: "2026-03-18" })` and `useGetNBAFixturesQuery({ date: "2026-03-17" })` maintain independent cache entries, enabling instant back-navigation without refetching.

### Routing

**React Router v6** with `createBrowserRouter` + nested route definitions. Protected routes are wrapped in an `<AuthGuard>` component that reads `authSlice.sessionStatus` from the Redux store — unauthenticated users are redirected to `/auth/sign-in` with the intended destination preserved in `location.state` for post-login redirect.

URL search params (`useSearchParams`) drive the fixture date — `?date=2026-03-18` — making every fixture view deep-linkable, shareable, and browser-history-navigable.

### Charts & Visualisation

**Recharts 2.x** — All four chart types in use:

| Chart | Location | Data |
|---|---|---|
| `<BarChart>` | Influencers tab | Unique reach per influencer |
| `<LineChart>` | Simulation tab | Projected daily user count |
| `<BarChart>` | Optimisation tab | Bonus cost per scenario |
| `<PieChart>` | Overview tab | Network composition breakdown |

All charts are `<ResponsiveContainer width="100%" height={300}>` wrapped — automatically adapts to parent container width. Animated on mount via `isAnimationActive={true}` with `animationDuration={800}` and `animationEasing="ease-out"`.

Custom `<Tooltip>` formatters apply locale-aware number formatting and percentage display. Custom `<Legend>` with icon and label styling matching the Tailwind design tokens.

### Animation

**Framer Motion** — Declarative animation library with a React-idiomatic API. Three animation patterns in use:

**1. Mount/unmount transitions** via `AnimatePresence`:
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  />
</AnimatePresence>
```

**2. Staggered list reveals** via `variants` + `staggerChildren`:
```jsx
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

**3. Spring-physics counter animations** via `useMotionValue` + `animate`:
```jsx
const count = useMotionValue(0);
useEffect(() => {
  animate(count, targetValue, {
    duration: 1.2,
    ease: "easeOut"
  });
}, [targetValue]);
```

**Skeleton loading screens** — `motion.div` elements with `animate={{ opacity: [0.5, 1, 0.5] }}` and `transition={{ repeat: Infinity, duration: 1.5 }}` create pulsing placeholder shimmer effects while RTK Query fetches resolve.

### Icons

**Lucide React (v0.383.0)** — Tree-shakeable SVG icon library. Only icons explicitly imported are included in the production bundle — zero unused icon weight. Used across navigation links, sport badges, action buttons, and status indicators.

---

## 📦 State Management Architecture

### Redux Store Shape

```typescript
interface RootState {
  auth: {
    user: User | null;
    sessionStatus: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
    oauthProvider: 'google' | 'linkedin' | 'otp' | null;
    error: string | null;
  };
  network: {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
    adjacencyList: Record<string, string[]>;
    computedMetrics: {
      influencers: RankedInfluencer[];
      centralityScores: Record<string, number>;
      totalReach: number;
    } | null;
    simConfig: SimulationConfig;
    simResult: SimulationResult | null;
  };
  ui: {
    selectedDate: string;       // ISO 8601 — "2026-03-18"
    activeSport: Sport;
    sidebarCollapsed: boolean;
  };
}
```

### RTK Query API Definition

```javascript
// src/store/api.js
const statyxApi = createApi({
  reducerPath: 'statyxApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: 'include',       // sends session cookie with every request
  }),
  tagTypes: ['Fixtures', 'Props', 'Network', 'User'],
  endpoints: (builder) => ({
    getNBAFixtures: builder.query({
      query: ({ date }) => `/api/nba/fixtures/?date=${date}`,
      providesTags: ['Fixtures'],
    }),
    getPlayerProps: builder.query({
      query: ({ fixtureId }) => `/api/nba/fixtures/${fixtureId}/props/`,
      providesTags: (result, error, { fixtureId }) => [
        { type: 'Props', id: fixtureId }
      ],
    }),
    sendOTP: builder.mutation({
      query: ({ phone }) => ({
        url: '/api/auth/send-otp/',
        method: 'POST',
        body: { phone },
      }),
    }),
    verifyOTP: builder.mutation({
      query: ({ phone, code }) => ({
        url: '/api/auth/verify-otp/',
        method: 'POST',
        body: { phone, code },
      }),
      invalidatesTags: ['User'],    // refetch user profile on login
    }),
  }),
});
```

---

## 🔢 Graph Algorithm Engine

All graph algorithms live in `src/utils/graphAlgorithms.js` and execute synchronously in the browser's main thread. For networks up to ~1,000 users, all operations complete well within a single frame budget (16ms).

### Adjacency List Representation

The referral network is stored as an adjacency list — a JavaScript `Map<nodeId, nodeId[]>` — enabling O(1) neighbour lookup for BFS/DFS traversals. Built once on data load, updated incrementally on new edge insertion.

### BFS — Network Reach (O(V + E))

```javascript
function getReachBFS(rootId, adjacencyList) {
  const visited = new Set();
  const queue = [rootId];
  visited.add(rootId);
  while (queue.length > 0) {
    const node = queue.shift();
    for (const neighbour of (adjacencyList.get(node) ?? [])) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push(neighbour);
      }
    }
  }
  return visited.size - 1;   // exclude root; count of indirect referrals
}
```

### DFS — Cycle Detection (O(V))

```javascript
function wouldCreateCycle(fromId, toId, adjacencyList) {
  // DFS from toId — if we can reach fromId, adding this edge creates a cycle
  const visited = new Set();
  const stack = [toId];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === fromId) return true;
    if (!visited.has(node)) {
      visited.add(node);
      for (const n of (adjacencyList.get(node) ?? [])) stack.push(n);
    }
  }
  return false;
}
```

### Greedy Influencer Selection — Submodular Maximisation (O(k × V²))

```javascript
function greedyInfluencers(k, allNodes, adjacencyList) {
  const selected = [];
  const covered = new Set();
  for (let i = 0; i < k; i++) {
    let bestNode = null, bestGain = -1;
    for (const node of allNodes) {
      if (selected.includes(node)) continue;
      const reach = getBFSSet(node, adjacencyList);
      const marginalGain = [...reach].filter(n => !covered.has(n)).length;
      if (marginalGain > bestGain) {
        bestGain = marginalGain;
        bestNode = node;
      }
    }
    if (!bestNode) break;
    const bestReach = getBFSSet(bestNode, adjacencyList);
    bestReach.forEach(n => covered.add(n));
    selected.push(bestNode);
  }
  return selected;
  // Approximation: (1 - 1/e) ≈ 63% of optimal solution
}
```

### Floyd-Warshall — Flow Centrality (O(V³))

```javascript
function computeFlowCentrality(nodes, adjacencyList) {
  const n = nodes.length;
  const idx = Object.fromEntries(nodes.map((id, i) => [id, i]));
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity))
  );
  // Initialise edges
  for (const [from, neighbours] of adjacencyList) {
    for (const to of neighbours) dist[idx[from]][idx[to]] = 1;
  }
  // Floyd-Warshall relaxation
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];
  // Centrality = fraction of shortest paths passing through each node
  const centrality = {};
  for (const node of nodes) {
    let score = 0;
    const k = idx[node];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (i !== k && j !== k && dist[i][j] === dist[i][k] + dist[k][j])
          score++;
    centrality[node] = score;
  }
  return centrality;
}
```

### Binary Search — Bonus Optimisation (O(log(range) × sim_cost))

```javascript
function optimiseBonus(targetUsers, days, simulateFn) {
  let lo = 0, hi = MAX_BONUS;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const result = simulateFn({ bonus: mid, days });
    if (result.totalUsers >= targetUsers) hi = mid;
    else lo = mid + 1;
  }
  return lo;   // minimum bonus achieving targetUsers in `days` days
}
```

---

## 📊 Data Visualisation Layer

### Chart Architecture

All charts use Recharts' **composable declarative API** — each visual is assembled from atomic primitives (`<XAxis>`, `<YAxis>`, `<Tooltip>`, `<Legend>`, `<Bar>`, `<Line>`, `<Cell>`) rather than a monolithic config object. This enables per-series conditional styling, custom tooltip content, and responsive container sizing.

### Custom Tooltip Pattern

```jsx
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-sm font-semibold">
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};
```

### Responsive Container Strategy

Every chart is wrapped in `<ResponsiveContainer width="100%" height={chartHeight}>` where `chartHeight` is derived from a `useWindowSize` hook — ensuring pixel-perfect rendering across breakpoints without fixed pixel heights that break on mobile viewports.

---

## 🔐 Authentication Flow (Frontend)

### Session State Machine

```
IDLE
  │
  ├── [user visits protected route] → check session cookie
  │         │
  │         ├── cookie valid   → AUTHENTICATED → render app
  │         └── cookie absent  → UNAUTHENTICATED → redirect /auth/sign-in
  │
  ├── [user initiates OTP]     → LOADING
  │         │
  │         ├── OTP sent       → OTP_PENDING → render OTPVerify
  │         │     │
  │         │     ├── code correct → AUTHENTICATED
  │         │     └── code wrong   → OTP_PENDING (error shown)
  │         └── send failed    → UNAUTHENTICATED (error shown)
  │
  ├── [user clicks Google]     → OAUTH_REDIRECTING → popup opens
  │         │
  │         └── token returned → POST /api/auth/google/ → AUTHENTICATED
  │
  └── [user clicks LinkedIn]   → OAUTH_REDIRECTING → redirect
            │
            └── callback page  → POST /api/auth/linkedin/ → AUTHENTICATED
```

### OAuth Callback Handler

```jsx
// src/components/auth/OAuthCallback.jsx
export function OAuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = detectProvider();   // linkedin | google from URL pattern

    if (!code) {
      dispatch(authSlice.actions.setError('OAuth callback missing code'));
      navigate('/auth/sign-in');
      return;
    }

    dispatch(exchangeOAuthCode({ provider, code }))
      .unwrap()
      .then(() => navigate('/app/overview'))
      .catch(() => navigate('/auth/sign-in'));
  }, []);

  return <LoadingSpinner label="Completing sign-in..." />;
}
```

---

## 🌐 Backend Integration

The frontend communicates exclusively with the [statyx-Backend](https://github.com/vk93102/statyx-Backend) Django REST API. All requests include `credentials: 'include'` to send the session cookie cross-origin — enabled by `django-cors-headers` on the backend with `CORS_ALLOW_CREDENTIALS=True` and `CORS_ALLOWED_ORIGINS` explicitly listing the frontend origin.

### API Base URL Configuration

```javascript
// vite.config.js — development proxy (avoids CORS preflight in dev)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
```

In production, `VITE_API_URL` is set to the Render.com backend URL — `https://statyx-backend.onrender.com` — and RTK Query's `fetchBaseQuery.baseUrl` points there directly, with CORS handled by the backend's `django-cors-headers` middleware.

### Request Lifecycle (RTK Query)

```
Component mounts
      │
      ▼
useGetNBAFixturesQuery({ date }) called
      │
      ├── Cache entry exists + fresh?
      │         └── YES → return cached data immediately, no network request
      │
      └── Cache miss or stale?
                └── Dispatch internal fetch action
                          │
                          ▼
                    fetchBaseQuery
                          │
                          ├── Build URL: VITE_API_URL + /api/nba/fixtures/?date=2026-03-18
                          ├── Attach session cookie (credentials: 'include')
                          ├── Set Content-Type: application/json
                          │
                          ▼
                    Django backend (Render.com)
                    ├── django-cors-headers validates origin
                    ├── Session middleware authenticates request
                    ├── NBAFixtureViewSet.list() queries PostgreSQL
                    └── DRF serializer returns JSON
                          │
                          ▼
                    RTK Query normalises response
                    ├── Stores in Redux cache keyed by { date }
                    ├── Sets TTL (5 min default)
                    └── Re-renders subscribed components
```

### Backend Endpoint Map (consumed by frontend)

```
Auth
  POST  /api/auth/send-otp/           Twilio OTP dispatch
  POST  /api/auth/verify-otp/         OTP verification → session
  POST  /api/auth/google/             Google ID token → session
  POST  /api/auth/linkedin/           LinkedIn code → session
  POST  /api/auth/logout/             Session teardown
  GET   /api/auth/me/                 Current user profile
  POST  /api/auth/avatar/             Avatar upload (Pillow)

NBA
  GET   /api/nba/fixtures/?date=      Fixture list
  GET   /api/nba/fixtures/{id}/props/ Props per fixture (EV, hit rates, odds)
  GET   /api/nba/players/{id}/splits/ Historical splits

NFL / Football (BETA)
  GET   /api/football/fixtures/?date=
  GET   /api/football/fixtures/{id}/props/

Network Graph
  POST  /api/network/add-referral/    Add edge (cycle-safe)
  GET   /api/network/reach/{id}/      BFS reach count
  GET   /api/network/influencers/     Greedy top-k
  POST  /api/network/simulate/        Growth simulation
  POST  /api/network/optimise-bonus/  Min viable bonus
  GET   /api/network/centrality/      Flow centrality scores
```

---

## ⚡ Performance Architecture

### Code Splitting Strategy

Vite automatically splits the bundle at dynamic `import()` boundaries. Each major route is a separate chunk:

```javascript
// React Router route definitions use lazy loading
const Overview     = lazy(() => import('./components/dashboard/Overview'));
const Influencers  = lazy(() => import('./components/dashboard/Influencers'));
const Simulation   = lazy(() => import('./components/dashboard/Simulation'));
const NBAProps     = lazy(() => import('./components/sports/NBAProps'));
```

This ensures the initial page load only ships the authentication shell. Dashboard chunks download in the background after sign-in.

### Memoisation Strategy

| Hook | Applied Where | Reason |
|---|---|---|
| `React.memo` | `PropCard`, `InfluencerRow`, `OddsTable` | Prevents re-render when parent re-renders but props unchanged |
| `useMemo` | Graph computation results | Floyd-Warshall O(V³) is expensive — recompute only when adjacency list changes |
| `useCallback` | Simulation re-run handler | Stable reference prevents child re-renders on every slider move |
| `useMemo` | Chart data transformation | Recharts data arrays recreated only when raw data changes |

### RTK Query Cache Optimisation

```javascript
// Polling for live game data during active game windows
useGetNBAFixturesQuery(
  { date: selectedDate },
  {
    pollingInterval: isGameDay ? 30_000 : 0,   // 30s polling on game days only
    refetchOnFocus: true,                       // refetch when tab regains focus
    refetchOnMountOrArgChange: 300,             // refetch if >5 min old
  }
);
```

### Performance Targets

| Metric | Target | Implementation |
|---|---|---|
| Initial bundle size | < 200KB gzip | Route-level code splitting + tree-shaking |
| First Contentful Paint | < 1.5s | Vite static SPA — no SSR hydration overhead |
| Time to Interactive | < 2s | Auth shell loads immediately; dashboard lazy-loads |
| Animation frame rate | 60 FPS | Framer Motion GPU-composited transforms only |
| RTK Query cache hit | > 80% same-session | 5-min TTL + arg-keyed cache entries |

---

## 📁 Directory Structure

```
statyx-frontend/
│
├── public/
│   ├── favicon.svg
│   └── og-image.png
│
├── src/
│   │
│   ├── main.jsx                      Vite entry — ReactDOM.createRoot + Redux Provider
│   ├── App.jsx                       BrowserRouter + route tree + AuthGuard
│   │
│   ├── store/
│   │   ├── index.js                  configureStore — combines all slices + RTK Query
│   │   ├── authSlice.js              User identity, session status, OAuth state
│   │   ├── networkSlice.js           Graph data, computed metrics, sim config
│   │   ├── uiSlice.js                Date selection, active sport, UI prefs
│   │   └── api.js                    RTK Query createApi — all endpoint definitions
│   │
│   ├── components/
│   │   │
│   │   ├── auth/
│   │   │   ├── SignIn.jsx             Email/password + OAuth provider buttons
│   │   │   ├── SignUp.jsx             Registration form + phone input + OTP trigger
│   │   │   ├── OTPVerify.jsx          6-digit code input with countdown timer
│   │   │   └── OAuthCallback.jsx      LinkedIn + Google redirect code exchange
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Overview.jsx           KPI grid + reach chart + growth trend
│   │   │   ├── Influencers.jsx        Ranked table + flow centrality + bar chart
│   │   │   ├── Simulation.jsx         Sim controls + line chart + target marker
│   │   │   └── Optimization.jsx       Bonus scenarios + bar chart + ROI metric
│   │   │
│   │   ├── sports/
│   │   │   ├── NBAProps.jsx           Date nav + fixture list + prop cards
│   │   │   ├── NFLProps.jsx           NFL fixture list (BETA badge)
│   │   │   └── SoccerProps.jsx        Soccer fixture list (BETA badge)
│   │   │
│   │   └── shared/
│   │       ├── PropCard.jsx           Player prop card — hit rates + EV + matchup
│   │       ├── OddsTable.jsx          Multi-book over/under comparison + vig calc
│   │       ├── EVBadge.jsx            EV% tier classification badge
│   │       ├── MatchupGradeBadge.jsx  A+→F grade badge with colour scale
│   │       ├── HitRateBar.jsx         Visual hit-rate progress bar (L5/L10/season)
│   │       ├── LoadingSkeletons.jsx   Framer Motion shimmer placeholders
│   │       └── Sidebar.jsx            Navigation panel + floating dock
│   │
│   ├── utils/
│   │   ├── graphAlgorithms.js         BFS, DFS, greedy, Floyd-Warshall, binary search
│   │   ├── evCalculator.js            EV% formula, implied probability, vig
│   │   ├── simulationEngine.js        Discrete-time growth model, S-curve adoption
│   │   └── formatters.js              Date (date-fns), odds, percentages, currency
│   │
│   └── assets/
│       ├── fonts/
│       └── images/
│
├── index.html                        Single HTML shell — Vite entry point
├── vite.config.js                    Vite + SWC plugin + dev proxy config
├── tsconfig.json                     TypeScript strict mode config
├── eslint.config.js                  ESLint flat config — React + TS rules
├── package.json                      Dependencies + scripts
└── package-lock.json                 Lockfile — deterministic installs
```

---

## 🎨 Design System

### Visual Language

- **Dark-first palette** — `bg-gray-950` base, `bg-gray-900` surface, `bg-gray-800` elevated surface
- **Accent colour** — Cyan (`#00d4ff`) for primary actions, active states, and positive EV indicators
- **Typography scale** — Display headings use `font-bold` at `text-2xl`+; body copy at `text-sm` with `text-gray-400` secondary
- **Glassmorphism cards** — `bg-white/5 backdrop-blur-sm border border-white/10` for elevated content surfaces
- **Spacing system** — Tailwind's 4px base unit, consistent `gap-4`, `p-6`, `rounded-xl` throughout

### Responsive Breakpoints (Tailwind)

| Breakpoint | Width | Layout Change |
|---|---|---|
| `sm` | 640px | Single-column stack |
| `md` | 768px | 2-column grid |
| `lg` | 1024px | Sidebar visible, 3-column |
| `xl` | 1280px | Full 4-column KPI grid |

### Animation Token Consistency

All Framer Motion transitions use a shared duration/easing token:

```javascript
export const TRANSITION_FAST = { duration: 0.15, ease: 'easeOut' };
export const TRANSITION_MED  = { duration: 0.25, ease: 'easeOut' };
export const TRANSITION_SLOW = { duration: 0.4,  ease: [0.4, 0, 0.2, 1] };

export const SPRING_BOUNCY  = { type: 'spring', stiffness: 400, damping: 25 };
export const SPRING_SMOOTH  = { type: 'spring', stiffness: 100, damping: 30 };
```

---

## 🏗️ Build Pipeline

### Development

```bash
npm run dev
# → Vite ESM dev server on http://localhost:5173
# → SWC transpilation (no Babel)
# → Hot Module Replacement: component edits reflect < 50ms
# → Django API proxied via vite.config.js server.proxy
```

### Production Build

```bash
npm run build
# → TypeScript compilation (tsc --noEmit — type check only)
# → Vite + Rollup bundle:
#     dist/index.html              ← Shell
#     dist/assets/index-[hash].js  ← Auth shell chunk
#     dist/assets/Overview-[hash].js   ← Route chunk (lazy)
#     dist/assets/NBAProps-[hash].js   ← Route chunk (lazy)
#     ... one chunk per lazily-imported route
# → Brotli + GZip compression of all JS/CSS assets
# → Asset fingerprinting (content hash in filename) for immutable CDN caching
```

### Type Checking

```bash
npm run typecheck
# → tsc --noEmit --strict
# → Validates all TypeScript across the codebase
# → Must pass with zero errors before any PR merge
```

---

## 💻 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/vk93102/statyx-frontend.git
cd statyx-frontend

# 2. Install dependencies (deterministic via lockfile)
npm install

# 3. Configure environment
cp .env.example .env.local
# Set VITE_API_URL to your local Django backend:
# VITE_API_URL=http://localhost:8000
# (or leave blank to use the vite.config.js proxy)

# 4. Start development server
npm run dev
# → http://localhost:5173

# 5. Run type check
npm run typecheck

# 6. Run linter
npx eslint src/

# 7. Production build (output to dist/)
npm run build

# 8. Preview production build locally
npm run preview
# → http://localhost:4173
```

> ⚠️ The frontend requires the [statyx-Backend](https://github.com/vk93102/statyx-Backend) Django server running on `http://localhost:8000` for all API calls to resolve. Follow the backend setup instructions in that repo first.

---

## 🔐 Environment Variables

```env
# Required — Django backend URL
VITE_API_URL=http://localhost:8000

# Optional — override in production deployment
# VITE_API_URL=https://statyx-backend.onrender.com
```

The `VITE_` prefix is required by Vite — only variables prefixed `VITE_` are exposed to client-side code via `import.meta.env.VITE_*`. Unprefixed variables remain server-only and are never bundled into the browser payload.

---

## 🤝 Contributing

1. Fork [github.com/vk93102/statyx-frontend](https://github.com/vk93102/statyx-frontend)
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Ensure `npm run typecheck` passes with **zero TypeScript errors**
4. Ensure `npx eslint src/` passes with **zero ESLint errors**
5. Follow Conventional Commits: `feat:`, `fix:`, `perf:`, `refactor:`, `chore:`
6. Open a Pull Request — describe what the change does and why

### Code Standards

- No `any` type — all values must be explicitly typed
- All `useEffect` dependency arrays must be exhaustive (enforced by ESLint)
- All new components must be wrapped in `React.memo` if they receive stable props
- Chart components must use `<ResponsiveContainer>` — no fixed pixel widths
- All Framer Motion animations must use shared transition tokens from `utils/tokens.js`

---

## 📜 License

© Statyx. All rights reserved.

---

<p align="center">
  <strong>Statyx Frontend</strong><br/>
  React 18 · TypeScript 5 · Vite 5 + SWC · Redux Toolkit · RTK Query<br/>
  Recharts · Framer Motion · Tailwind CSS · Lucide React<br/><br/>
  <a href="https://statyx.io">Live Platform</a> ·
  <a href="https://github.com/vk93102/statyx-frontend">Frontend Repo</a> ·
  <a href="https://github.com/vk93102/statyx-Backend">Backend Repo</a> ·
  <a href="https://drive.google.com/file/d/1MM9s7fH6XkBgMpIbQMhxkwRXxrmdAb6m/view?usp=sharing">Demo Video</a>
</p>