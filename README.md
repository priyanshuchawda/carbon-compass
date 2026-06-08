# Carbon Compass 🧭

> Understand your carbon footprint and reduce it one simple action at a time.

A **full-stack Next.js application** purpose-built for Indian urban households that helps users calculate, visualise, and meaningfully reduce their personal carbon footprint through a guided, data-driven flow.

---

## Live demo flow

```
/ (landing) → /onboarding → /calculator → /dashboard → /actions → /report
```

Every page is **server-rendered by default**; only interactive chart widgets and form controls are client boundaries.

---

## Features

| Phase | What ships |
|---|---|
| **A – App shell** | Accessible layout, skip-link, header/footer, route placeholders |
| **B – Carbon engine** | Pure-function calculation engine with India-specific emission factors, eco-score, and assumptions footnotes |
| **C – Recommendations** | Deterministic, goal-aware recommendation engine ranked by impact |
| **D – Input flow** | Zod-validated onboarding + calculator forms, `/api/calculate` and `/api/recommendations` route handlers |
| **E – Dashboard** | Metric cards, Recharts pie breakdown, Compass Assistant insight, recommendation cards, Playwright E2E coverage |
| **F – Simulator** | Immutable what-if simulator: reduce car use, switch to metro, cut AC, go solar, go vegan |
| **G – Progress report** | Schema-versioned localStorage progress log, trend analysis, printable report page |
| **H – Polish** | Skip-link, security headers, accessible text alternatives, performance review, README |

---

## Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Server components, route handlers, built-in perf |
| Language | **TypeScript (strict)** | No `any`, exhaustive types, null-safety |
| Styling | **Tailwind CSS v4** | Design tokens, no runtime CSS |
| Charts | **Recharts** | Accessible text fallback alongside SVG |
| Validation | **Zod v4** | Schema-first, runtime-safe |
| Testing (unit) | **Vitest + Testing Library** | Fast, jsdom, component contracts |
| Testing (E2E) | **Playwright (Chromium)** | Real browser, full demo-flow coverage |
| Package manager | **pnpm** | Strict hoisting, fast |

---

## Project structure

```
app/
  layout.tsx          root layout – skip-link, header, footer
  page.tsx            landing page (server component)
  onboarding/         step 1 – context form
  calculator/         step 2 – footprint input form
  dashboard/          step 3 – metrics, chart, simulator
  actions/            step 4 – weekly action plan
  report/             step 5 – printable progress report
  api/
    calculate/        POST /api/calculate   (Zod-validated)
    recommendations/  POST /api/recommendations
components/
  carbon/             domain-specific UI components
  layout/             site header / footer
lib/
  carbon/
    types.ts          shared TypeScript interfaces
    factors.ts        India emission factors with sources
    calculator.ts     pure footprint calculation functions
    scoring.ts        eco-score (0-100) calculation
    recommendations.ts deterministic recommendation engine
    simulator.ts      immutable what-if action simulator
    progress.ts       schema-versioned localStorage helpers
    demo.ts           shared demo inputs and results
data/
  emission-factors.json  source-noted factor table
tests/
  unit/               Vitest + Testing Library specs (50 tests)
  e2e/                Playwright demo-flow spec
```

---

## Getting started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9

### Install

```bash
pnpm install
```

### Run locally

```bash
pnpm dev
# open http://localhost:3000
```

### Run tests

```bash
# Unit tests (fast, no browser)
pnpm test

# E2E demo flow (Chromium, auto-starts dev server)
pnpm test:e2e

# Type-check
pnpm typecheck

# Lint
pnpm lint

# All quality gates
pnpm quality
```

---

## Carbon engine

All calculation logic lives in `lib/carbon/` as **pure functions with no side effects**.

### Emission factors (India-specific)

| Category | Factor | Source |
|---|---|---|
| Two-wheeler | 0.043 kg CO₂/km | IPCC AR6 + India avg |
| Car (petrol) | 0.192 kg CO₂/km | IPCC AR6 |
| Grid electricity | 0.82 kg CO₂/kWh | CEA India 2023 |
| LPG | 2.98 kg CO₂/cylinder | IPCC |
| Flights (domestic) | 255 kg CO₂/flight | ICAO Carbon Calculator |
| Vegetarian diet | 1.7 kg CO₂/day | Poore & Nemecek 2018 |
| Mixed diet | 3.3 kg CO₂/day | Poore & Nemecek 2018 |
| Meat-heavy diet | 7.2 kg CO₂/day | Poore & Nemecek 2018 |

### Eco-score

A 0–100 composite score: `max(0, 100 - (totalKgCO2PerYear / 3000) * 100)`.

India average ≈ 1.9 tCO₂/year per capita. A score above 70 indicates below-average footprint.

---

## API

### `POST /api/calculate`

```json
Request body: FootprintInput (see lib/carbon/types.ts)

Response:
{
  "total": 1234.5,
  "breakdown": { "transport": 400, "energy": 300, ... },
  "percentages": { "transport": 32.4, ... },
  "topCategory": "transport",
  "ecoScore": 59,
  "assumptions": ["India average grid emission factor 0.82 kg CO₂/kWh", ...]
}
```

### `POST /api/recommendations`

```json
Request body: FootprintInput

Response: Recommendation[] (sorted by impact)
```

---

## Security

HTTP security headers applied to all routes via `next.config.ts`:

- `Content-Security-Policy` – self-origin only, no third-party scripts
- `X-Frame-Options: DENY` – clickjacking protection
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` – camera, mic, geolocation denied

**No personal data is collected or transmitted.** All inputs stay in the browser; progress data uses `localStorage` only.

---

## Privacy

- Zero external analytics
- Zero third-party scripts
- No cookies set by the application
- No server-side storage of any user data
- `localStorage` keys are namespaced under `carbon-compass.*`

---

## Accessibility

- Single `<h1>` per page
- Skip-to-main-content link in layout
- All form inputs have associated `<label>` elements
- Chart has visible text alternative (`<ul aria-label="Category breakdown text summary">`)
- ARIA regions on all major dashboard sections
- Min touch target: 44×44px (min-h-11 / min-h-12 classes)

---

## Code quality rules

See [`RULES.md`](./RULES.md) for the full coding contract. Key points:

- **Strict TypeScript** – `"strict": true`, no `any`, no `@ts-ignore`
- No raw `console.log` in production paths
- Pure functions for all calculation logic
- Tests must cover behavior contracts before implementation
- PR per slice; squash-merge into main

---

## Scripts

| Script | What it runs |
|---|---|
| `pnpm dev` | Next.js dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm test` | Vitest unit suite (50 tests) |
| `pnpm test:e2e` | Playwright Chromium E2E flow |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm quality` | typecheck + lint + test + build |
| `scripts/ai-test.ps1` | Compact test output for AI agents |
| `scripts/ai-quality.ps1` | Compact quality gate for AI agents |

---

## Roadmap

- [ ] Persist calculator input across sessions (URL params / localStorage)
- [ ] Multi-user household mode
- [ ] Monthly email digest (opt-in)
- [ ] City-level peer comparison
- [ ] Hindi / regional language support

---

## License

MIT
