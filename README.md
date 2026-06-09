# Carbon Compass 🧭

> Understand your carbon footprint and reduce it one simple action at a time.

A **full-stack Next.js application** purpose-built for Indian urban households that helps users calculate, visualise, and meaningfully reduce their personal carbon footprint through a guided, data-driven flow.

---

## Live demo flow

```
/ (landing) → /onboarding → /calculator → /dashboard → /assistant → /log → /actions → /report
```

Every page is **server-rendered by default**; only interactive chart widgets and form controls are client boundaries.

---

## Features

| Phase                   | What ships                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| **A – App shell**       | Accessible layout, skip-link, header/footer, route placeholders                                                |
| **B – Carbon engine**   | Pure-function calculation engine with India-specific emission factors, eco-score, and assumptions footnotes    |
| **C – Recommendations** | Deterministic, goal-aware recommendation engine ranked by impact                                               |
| **D – Input flow**      | Zod-validated onboarding + calculator forms, `/api/calculate` and `/api/recommendations` route handlers        |
| **E – Dashboard**       | Metric cards, Recharts pie breakdown, Compass Assistant insight, recommendation cards, Playwright E2E coverage |
| **F – Simulator**       | Immutable what-if simulator: reduce car use, switch to metro, cut AC, go solar, go vegan                       |
| **G – Progress report** | Schema-versioned localStorage progress log, trend analysis, printable report page                              |
| **H – Polish**          | Skip-link, security headers, accessible text alternatives, performance review, README                          |

## Challenge Requirement Mapping

This table connects evaluation criteria to concrete implementations, unit test files, fallback paths, and operational limitations:

| Evaluation Criterion    | Implemented Feature                                                                                                            | Source Files                                                                                                                      | Tests / Verification                                                                                                                                | Fallback & Safety                                                                                                 | Limitation                                                                                                 |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **Smart Assistant**     | Conversational chat interface grounded in footprint data + progressive summaries and weekly challenges.                        | `app/api/assistant/chat/route.ts`<br>`app/api/assistant/narrate/route.ts`<br>`app/assistant/page.tsx`                             | `tests/unit/assistant-page.test.tsx`<br>`tests/unit/assistant-chat-api.test.ts`<br>`tests/unit/assistant-evals.test.ts`                             | Falls back to rule-based fallback generator using user's actual footprint metrics if API is rate-limited/offline. | Narrates and summarizes calculator data; cannot predict user habits outside input parameters.              |
| **Logical Decisions**   | Pure-function carbon engine with India-specific emission factors, Eco-Score calculations, and Commute simulator.               | `lib/carbon/calculate.ts`<br>`lib/carbon/scoring.ts`<br>`lib/carbon/simulator.ts`                                                 | `tests/unit/calculate.test.ts`<br>`tests/unit/scoring.test.ts`<br>`tests/unit/simulator.test.ts`                                                    | Returns empty/safe metrics defaults if inputs are fully blank.                                                    | Calculations are educational estimates using static national grid baselines; not a certified carbon audit. |
| **Real Usability**      | Dynamic onboarding, transport/energy/shopping calculators, GoalSetter tracking, activity logs, printable reports.              | `components/carbon/footprint-form.tsx`<br>`components/carbon/dashboard-client.tsx`<br>`app/log/page.tsx`<br>`app/report/page.tsx` | `tests/unit/footprint-form.test.tsx`<br>`tests/unit/goal-setter.test.tsx`<br>`tests/unit/progress-report.test.tsx`<br>`tests/e2e/demo-flow.spec.ts` | Falls back to pre-populated Pune student profile if the user skips onboarding or form is empty.                   | Data is browser-locked and stored locally using sessionStorage and localStorage.                           |
| **Code Quality**        | Strict compiler settings (`strict: true`, exhaustive switch matching, no implicit overrides), clean client/server separation.  | `tsconfig.json`<br>`eslint.config.mjs`<br>`lib/carbon/types.ts`                                                                   | `tests/unit/eslint-rules.test.ts`<br>`pnpm quality` task                                                                                            | Builds fail in CI if compiler or linting errors are introduced.                                                   | Linter rules are verified locally in ESLint config.                                                        |
| **Security & Privacy**  | Zod input schema boundary checks, recursive error redaction, bounded payload readers, safe same-origin checks, secure headers. | `lib/validation/schemas.ts`<br>`lib/carbon/redaction.ts`<br>`lib/carbon/utils.ts`<br>`proxy.ts`<br>`next.config.ts`               | `tests/unit/validation.test.ts`<br>`tests/unit/redaction.test.ts`<br>`tests/unit/api-routes.test.ts`                                                | Rejects payload and fails closed on invalid schemas, same-origin violations, or oversized bodies.                 | Calculator data is local-first; assistant features send summarized context to server-side AI routes.       |
| **Accessibility**       | Skip-to-main link, semantic single-H1 layout, form labels, chart text alternatives, Axe-audited UI controls.                   | `app/layout.tsx`<br>`components/carbon/category-breakdown.tsx`<br>`docs/ACCESSIBILITY.md`                                         | `tests/unit/accessibility.test.tsx`<br>`tests/e2e/demo-flow.spec.ts`                                                                                | Screen readers announce details via text summaries beside the SVG charts.                                         | Display fits mobile portrait viewport sizes down to 390px.                                                 |
| **Efficiency & Perf**   | Static-first pages, Turbopack optimizer, light CSS, client-bundle chunk inspector.                                             | `next.config.ts`<br>`scripts/inspect-client-chunks.mjs`                                                                           | `pnpm perf:bundle-report`<br>`pnpm quality`                                                                                                         | Next.js optimizes static routes and chunks compilation for fast initial loading.                                  | Bundle size is bounded by Recharts core rendering libraries.                                               |
| **Verification & Docs** | Comprehensive docs (Formulas, Security, A11y, Judge Readiness, Quality checks), Unit/E2E test suites.                          | `README.md`<br>`docs/`<br>`tests/`                                                                                                | `pnpm quality` verification task                                                                                                                    | Automated CI verify pipeline runs on every repository code commit.                                                | Reports show latest known verification snapshot.                                                           |

---

## Tech stack

| Layer           | Choice                       | Reason                                           |
| --------------- | ---------------------------- | ------------------------------------------------ |
| Framework       | **Next.js 16 (App Router)**  | Server components, route handlers, built-in perf |
| Language        | **TypeScript (strict)**      | No `any`, exhaustive types, null-safety          |
| Styling         | **Tailwind CSS v4**          | Design tokens, no runtime CSS                    |
| Charts          | **Recharts**                 | Accessible text fallback alongside SVG           |
| Validation      | **Zod v4**                   | Schema-first, runtime-safe                       |
| Testing (unit)  | **Vitest + Testing Library** | Fast, jsdom, component contracts                 |
| Testing (E2E)   | **Playwright (Chromium)**    | Real browser, full demo-flow coverage            |
| Package manager | **pnpm**                     | Strict hoisting, fast                            |

---

## Project structure

```
app/
  layout.tsx          root layout – skip-link, header, footer
  page.tsx            landing page (server component)
  onboarding/         step 1 – context form
  calculator/         step 2 – footprint input form
  dashboard/          step 3 – metrics, chart, simulator
  assistant/          step 4 – AI chat interface
  actions/            step 5 – weekly action plan
  log/                step 6 – manual activity tracker
  report/             step 7 – printable progress report
  api/
    calculate/        POST /api/calculate   (Zod-validated)
    recommendations/  POST /api/recommendations
    health/           GET /api/health
    assistant/
      chat/           POST /api/assistant/chat
      narrate/        POST /api/assistant/narrate
components/
  carbon/             domain-specific UI components
  layout/             site header / footer
lib/
  carbon/
    types.ts          shared TypeScript interfaces
    factors.ts        India emission factors with sources
    calculate.ts      pure footprint calculation functions
    scoring.ts        eco-score (0-100) calculation
    recommendations.ts deterministic recommendation engine
    simulator.ts      immutable what-if action simulator
    activity-types.ts natural-unit activity metadata
    activity-log.ts   schema-versioned activity history helpers
    progress.ts       schema-versioned progress and goal helpers
    demo.ts           shared demo inputs and results

tests/
  unit/               Vitest + Testing Library specs
  e2e/                Playwright demo-flow spec
```

---

## Getting started

### Prerequisites

- Node.js ≥ 22
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

| Category         | Factor               | Source                              |
| ---------------- | -------------------- | ----------------------------------- |
| Two-wheeler      | 0.12 kg CO₂/km       | IPCC AR6 (India petrol scooter avg) |
| Car (petrol)     | 0.18 kg CO₂/km       | IPCC AR6                            |
| Public transport | 0.30 kg CO₂/trip     | India urban bus avg                 |
| Cab / auto       | 1.20 kg CO₂/trip     | India shared cab avg                |
| Grid electricity | 0.71 kg CO₂/kWh      | CEA India Baseline Database         |
| LPG cylinder     | 42.5 kg CO₂/cylinder | IPCC                                |
| Domestic flight  | 250 kg CO₂/flight    | ICAO Carbon Calculator              |
| Vegetarian diet  | 45 kg CO₂/month      | Poore & Nemecek 2018                |
| Mixed diet       | 55 kg CO₂/month      | Poore & Nemecek 2018                |
| Meat-heavy diet  | 80 kg CO₂/month      | Poore & Nemecek 2018                |

### Eco-score

A 0–100 composite score: `max(0, min(100, 100 - (monthlyTotal / householdSize / 5.25) + habitBonus))`.

We calibrate the scoring so that an average Indian citizen (monthly per-capita average footprint of ~158 kg CO2e) achieves a base score of exactly 70. This makes any score above 70 mathematically indicate a below-average footprint (before habit bonuses).

Bonus points: +4 for renewable energy, +3 for recycling, +3 for composting.

---

## API

### `POST /api/calculate`

```json
Request body:
{
  "profile": {
    "id": "user-Delhi-student",
    "city": "Delhi",
    "country": "India",
    "householdSize": 2,
    "persona": "student",
    "mainGoal": "reduce_carbon"
  },
  "footprint": {
    "transport": {
      "twoWheelerKmPerWeek": 50,
      "carKmPerWeek": 0,
      "publicTransportTripsPerWeek": 10,
      "cabAutoTripsPerWeek": 2,
      "flightsPerYear": 0
    },
    "energy": {
      "monthlyElectricityKWh": 150,
      "lpgCylindersPerMonth": 1,
      "acHoursPerDay": 4,
      "renewableEnergy": false
    },
    "food": {
      "dietType": "vegetarian",
      "meatMealsPerWeek": 0,
      "dairyFrequency": "medium",
      "foodDeliveryPerWeek": 1,
      "foodWasteLevel": "low"
    },
    "shopping": {
      "clothesPerMonth": 1,
      "onlineOrdersPerMonth": 3,
      "electronicsPerYear": 0
    },
    "waste": {
      "recycles": true,
      "composts": false,
      "plasticUsage": "medium"
    }
  }
}

Response:
{
  "success": true,
  "data": {
    "result": {
      "monthlyTotalKgCO2e": 234.5,
      "annualTotalKgCO2e": 2814.0,
      "breakdown": [
        { "category": "transport", "label": "Transport", "kgCO2e": 42.1, "percentage": 18.0 },
        { "category": "energy", "label": "Household Energy", "kgCO2e": 150.2, "percentage": 64.0 },
        { "category": "food", "label": "Food & Diet", "kgCO2e": 32.2, "percentage": 13.7 },
        { "category": "shopping", "label": "Shopping", "kgCO2e": 8.0, "percentage": 3.4 },
        { "category": "waste", "label": "Waste & Recycling", "kgCO2e": 2.0, "percentage": 0.9 }
      ],
      "topCategory": "energy",
      "ecoScore": 76,
      "potentialMonthlySavingKgCO2e": 54.2,
      "assumptions": [
        "Grid electricity factor: 0.710 kg CO₂/kWh",
        "Vegetarian diet base: 45 kg CO₂/month"
      ]
    }
  }
}
```

### `POST /api/recommendations`

```json
Request body:
{
  "profile": { ... },
  "footprint": { ... }
}

Response:
{
  "success": true,
  "data": {
    "result": { ... },
    "recommendations": [
      {
        "id": "switch_led",
        "category": "energy",
        "title": "Switch to energy-efficient LED bulbs",
        "reason": "Lighting contributes to high household electricity consumption",
        "action": "Replace incandescent/fluorescent lights with LEDs",
        "estimatedSavingKgCO2ePerMonth": 12.5,
        "difficulty": "easy",
        "impact": "medium",
        "moneySavingPotential": "medium",
        "weeklyChallenge": "Swap out at least two active incandescent bulbs for LEDs"
      },
      ...
    ]
  }
}
```

---

## Security

HTTP security headers applied to all routes via `next.config.ts`:

- `Content-Security-Policy` – self-origin scripts; `'unsafe-inline'` retained for Next.js compatibility (nonce migration tracked in #67)
- `X-Frame-Options: DENY` – clickjacking protection
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` – camera, mic, geolocation denied

**Local-first privacy model.** Calculator inputs and progress history are stored locally in the browser. When the optional AI assistant features are enabled, summarized carbon context, city-level profile fields, and chat messages are sent to server-side API routes that can call Google Gemini. Exact addresses and coordinates are never collected.

---

## Privacy

- Zero external analytics
- Zero third-party scripts
- No cookies set by the application
- No persistent server-side storage of user data (ephemeral assistant requests are processed in memory and never persisted)
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

Key engineering rules for this codebase:

- **Strict TypeScript** – `"strict": true`, no `any`, no `@ts-ignore`
- Runtime inputs are validated with Zod at API, storage, and AI response boundaries
- Calculation and recommendation logic stays in pure library functions, outside UI components
- Client components are kept behind explicit `"use client"` boundaries
- API responses use consistent `{ success, data }` or `{ success, error }` envelopes where applicable
- Production logging goes through the redacting logger instead of ad hoc console calls
- Formatter, lint, typecheck, tests, build, and bundle budget checks are wired into `pnpm quality`

---

## Scripts

| Script                    | What it runs                                                                    |
| ------------------------- | ------------------------------------------------------------------------------- |
| `pnpm dev`                | Next.js dev server on port 3000                                                 |
| `pnpm build`              | Production build compilation                                                    |
| `pnpm start`              | Start production compiled Next.js server                                        |
| `pnpm test`               | Vitest unit and component suite                                                 |
| `pnpm test:e2e`           | Playwright Chromium E2E browser flows                                           |
| `pnpm typecheck`          | `tsc --noEmit`                                                                  |
| `pnpm lint`               | ESLint checks                                                                   |
| `pnpm audit:prod`         | Production dependency vulnerability audit                                       |
| `pnpm perf:bundle-report` | Inspect client chunk sizes (Recharts, AI boundaries)                            |
| `pnpm smoke`              | Production smoke checks against `/api/health`, core pages, and assistant routes |
| `pnpm quality`            | All quality checks: typecheck + lint + test + build + bundle budget             |
| `pnpm verify`             | Alias for `pnpm quality`                                                        |

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
