# Carbon Compass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a judge-ready Carbon Compass website that helps urban students and young professionals in India estimate, understand, track, and reduce their lifestyle carbon footprint.

**Architecture:** Use a Next.js App Router application with deterministic carbon logic in `lib/carbon`, validation in `lib/validation`, UI in `components`, and route-level pages in `app`. Calculations and recommendations must be pure, typed, testable, and safe to run on the server. The Compass Assistant explains deterministic results; it must not invent carbon advice.

**Tech Stack:** Next.js App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui, Recharts, Zod, Vitest, React Testing Library where useful, Playwright, local browser storage for MVP progress, Vercel-compatible deployment.

---

## Product Summary

Carbon Compass is a personal carbon footprint awareness platform for urban students and young professionals in India. It estimates lifestyle emissions across transport, energy, food, shopping, and waste, then ranks the biggest opportunity and creates simple weekly action plans.

The winning angle is that this is not just a calculator. It should feel like a smart assistant that explains the result, compares categories, shows what matters most, and suggests small practical changes.

## Delivery Principles

- Build in small vertical slices.
- Keep all calculation and recommendation logic deterministic before adding any optional AI rewrite.
- Do not add GitHub Actions or workflow files.
- Use GitHub issues as the planning source of truth.
- Keep commits small and conventional.
- Keep code accessible, mobile-first, private by design, and testable.
- Treat all carbon numbers as educational estimates, not audited carbon accounting.

## Repository Structure Target

```txt
app/
  page.tsx
  onboarding/page.tsx
  calculator/page.tsx
  dashboard/page.tsx
  actions/page.tsx
  report/page.tsx
  api/
    calculate/route.ts
    recommendations/route.ts

components/
  ui/
  layout/
  carbon/
    FootprintForm.tsx
    CategoryBreakdown.tsx
    RecommendationCard.tsx
    WhatIfSimulator.tsx
    ProgressChart.tsx
    EcoScoreCard.tsx
    WeeklyChallengeCard.tsx
    ReportSummary.tsx

lib/
  carbon/
    assumptions.ts
    calculate.ts
    factors.ts
    recommendations.ts
    scoring.ts
    simulator.ts
    types.ts
  validation/
    schemas.ts
  storage/
    local-progress.ts
  utils.ts

data/
  emission-factors.json

tests/
  unit/
    calculate.test.ts
    recommendations.test.ts
    scoring.test.ts
    simulator.test.ts
    validation.test.ts
  e2e/
    carbon-compass.spec.ts
```

## Phase A: Project Foundation

GitHub epic: #2

Purpose: create the base application shell and development standards.

- [ ] Inspect repository baseline and confirm stack. Issue: #10.
- [ ] Scaffold Next.js App Router project with pnpm. Issue: #11.
- [ ] Add landing, onboarding, calculator, dashboard, actions, and report routes. Issue: #11.
- [ ] Add Tailwind CSS and shadcn/ui-ready component structure. Issue: #12.
- [ ] Add accessible layout, navigation, focus states, and mobile-first spacing. Issue: #12.
- [ ] Configure strict TypeScript and quality scripts. Issue: #13.
- [ ] Confirm no `.github/workflows` directory exists. Issue: #13.

Acceptance:

- `pnpm dev` starts the app.
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` run.
- Routes render without runtime errors.
- No GitHub Actions files are created.

## Phase B: Carbon Domain Model and Calculation Engine

GitHub epic: #3

Purpose: create trustworthy, transparent carbon estimation logic.

- [ ] Define shared types for profile, footprint input, categories, breakdown, and results. Issue: #14.
- [ ] Add source-noted emission factors, including India grid electricity around `0.710 kg CO2/kWh`. Issue: #15.
- [ ] Add explicit assumptions and educational disclaimer text. Issue: #15.
- [ ] Implement pure category calculation functions. Issue: #16.
- [ ] Implement monthly total, annual total, percentages, top category, and potential savings. Issue: #16.
- [ ] Implement eco score and category ranking. Issue: #17.
- [ ] Add unit tests for calculations, scoring, and assumptions. Issue: #18.

Core formula:

```txt
Emissions kgCO2e = Activity Amount * Emission Factor
```

Acceptance:

- Calculation logic lives outside React components.
- Internal logic keeps useful precision, UI display rounds cleanly.
- Category percentages sum approximately to 100.
- Annual total equals monthly total multiplied by 12.
- Tests cover electricity factor, category totals, zero input, top category, and score bounds.

## Phase C: Compass Assistant Recommendation Engine

GitHub epic: #4

Purpose: build the smart assistant layer with deterministic rules.

- [ ] Define recommendation model and rule registry. Issue: #19.
- [ ] Implement category-specific rules for transport, energy, food, shopping, and waste. Issue: #20.
- [ ] Rank recommendations by top category, estimated saving, difficulty, and user goal. Issue: #21.
- [ ] Add tests for recommendation behavior and required fields. Issue: #22.

Recommendation output must include:

- title
- reason
- action
- estimated monthly saving
- difficulty
- impact
- money-saving potential
- weekly challenge

Acceptance:

- No recommendation depends on randomness.
- No AI call is required for correctness.
- If transport is highest, transport guidance appears first.
- If the user goal is `save_money`, money-saving actions rank higher.

## Phase D: Onboarding and Calculator Flow

GitHub epic: #5

Purpose: collect persona and lifestyle inputs safely and accessibly.

- [ ] Build onboarding page for city/country, household size, persona, transport mode, diet, electricity style, and goal. Issue: #23.
- [ ] Add Zod schemas for profile and footprint input. Issue: #24.
- [ ] Build calculator sections for transport, energy, food, shopping, and waste. Issue: #25.
- [ ] Add demo data button for a student or young professional in Pune. Issue: #25.
- [ ] Add server-safe calculation and recommendation endpoints or server actions. Issue: #26.
- [ ] Add validation and happy-path tests. Issue: #27.

Acceptance:

- Every input has a visible label.
- Errors are shown near the relevant fields.
- Negative, NaN, Infinity, and unrealistic values fail validation.
- Final calculations are not client-only.

## Phase E: Dashboard and Assistant Experience

GitHub epic: #6

Purpose: create the main judge-facing product experience.

- [ ] Add metric cards for monthly footprint, annual estimate, top source, potential saving, and eco score. Issue: #28.
- [ ] Add accessible category chart with text summary. Issue: #29.
- [ ] Add Compass Assistant insight card explaining the top source. Issue: #30.
- [ ] Display ranked recommendation cards and weekly action plan. Issue: #31.
- [ ] Add E2E coverage for landing-to-dashboard flow. Issue: #32.

Acceptance:

- The dashboard explains what is high and why.
- The chart is not the only source of category information.
- Language is encouraging and non-shaming.
- Playwright covers the judge demo path.

## Phase F: What-If Simulator

GitHub epic: #7

Purpose: make the product feel interactive and practical.

- [ ] Implement pure simulation logic for common actions. Issue: #33.
- [ ] Support metro/bus substitution, AC reduction, low-carbon meal day, delivery reduction, recycling, and composting. Issue: #33.
- [ ] Build simulator UI showing before/after emissions and savings. Issue: #34.
- [ ] Add simulator tests for reductions and immutability. Issue: #35.

Acceptance:

- Simulator never mutates original input.
- Before/after difference is clear.
- Savings are deterministic and traceable to emission factors.

## Phase G: Progress Tracker and Shareable Report

GitHub epic: #8

Purpose: show progress and create a clean summary for demos.

- [ ] Add local progress storage with schema versioning and safe fallback. Issue: #36.
- [ ] Add trend chart and best improvement summary. Issue: #37.
- [ ] Add printable/shareable report page. Issue: #38.
- [ ] Add tests for storage and report rendering. Issue: #39.

Acceptance:

- Corrupted local storage does not break the app.
- Report shows monthly footprint, top source, best action, potential saving, and assumptions.
- Progress chart has a text alternative.

## Phase H: Judge-Ready Polish

GitHub epic: #9

Purpose: prepare the final submission.

- [ ] Write README with vertical, problem, solution, logic, assumptions, security, efficiency, accessibility, tests, and demo flow. Issue: #40.
- [ ] Complete accessibility pass. Issue: #41.
- [ ] Complete security and privacy pass. Issue: #42.
- [ ] Complete performance and bundle sanity pass. Issue: #43.
- [ ] Run final quality gates and document results. Issue: #44.

Acceptance:

- README can explain the project without a live walkthrough.
- Accessibility basics are verified manually and through E2E where practical.
- No secrets, exact addresses, or unnecessary personal data are collected.
- Final quality commands pass or failures are clearly documented with rationale.

## Required Scripts

The final `package.json` should include equivalent scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "quality": "pnpm typecheck && pnpm lint && pnpm test && pnpm build"
  }
}
```

Use the current Next.js/ESLint command that the scaffold supports. If `next lint` is not available, use `eslint .`.

## Required Test Coverage

Unit tests:

- `100 kWh * 0.710 kg CO2/kWh = 71 kg CO2e`.
- Monthly total equals sum of categories.
- Percentages sum approximately to 100.
- Zero or low input does not crash.
- Annual total equals monthly total multiplied by 12.
- Eco score stays between 0 and 100.
- Higher footprint lowers score.
- Positive habits improve score.

Recommendation tests:

- Transport top category returns transport recommendation first.
- Energy top category returns energy recommendation.
- High food waste returns food waste recommendation.
- `save_money` goal ranks money-saving actions higher.
- Every recommendation has required fields and positive reasonable savings.

Validation tests:

- Negative km fails.
- Empty city fails.
- Household size below 1 fails.
- Invalid diet type fails.
- Unrealistically large values fail or are capped intentionally.
- Unknown enum values fail.

Simulator tests:

- Reducing AC lowers energy footprint.
- Replacing fuel trips lowers transport footprint.
- Simulator does not mutate original input.
- Before/after saving is calculated correctly.

E2E tests:

- User opens landing page.
- User navigates to calculator.
- User fills demo data.
- User submits calculator.
- Dashboard shows total footprint and top source.
- Recommendations are visible.
- What-if simulator changes projected result.
- Report page renders summary.

Accessibility checks:

- Main pages have one `h1`.
- Inputs have labels.
- Buttons have accessible names.
- Chart has a text summary.
- Keyboard navigation works for the main flow.

## Final Quality Gate

Before marking the final project complete, run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm test:e2e
```

Do not close judge-critical issues if the relevant quality gate is failing.

## Branch and PR Sequence

Use one branch per vertical slice:

```txt
feat/issue-10-repo-baseline
feat/issue-11-app-shell
feat/issue-16-carbon-engine
feat/issue-20-recommendation-rules
feat/issue-25-calculator-flow
feat/issue-31-dashboard-actions
feat/issue-34-what-if-simulator
feat/issue-38-report-page
docs/issue-40-readme
test/issue-44-final-quality
```

Each PR should include:

- summary
- linked issue
- screenshots for UI changes
- tests run
- security/accessibility notes when relevant
- known limitations

## Judge Demo Flow

1. Open landing page.
2. Click "Calculate My Footprint".
3. Use demo data for a student in Pune.
4. Submit calculator.
5. Show dashboard metrics and category breakdown.
6. Explain the top source.
7. Show Compass Assistant recommendation.
8. Use what-if simulator.
9. Show reduced footprint.
10. Open report page.
11. Mention deterministic logic, tests, accessibility, privacy, and README assumptions.
