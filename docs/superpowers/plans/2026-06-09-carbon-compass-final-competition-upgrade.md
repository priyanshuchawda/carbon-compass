# Carbon Compass Final Competition Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Carbon Compass into the strongest possible judging submission for the Carbon Footprint Awareness Platform challenge by improving real-world product usability, code structure, security, testing evidence, accessibility, and judge-facing documentation.

**Architecture:** Keep the existing Next.js App Router product and carbon calculation engine. Refactor only where it improves maintainability: shared activity/store modules, shared API guard helpers, stronger assistant contracts, and reusable UI primitives. Borrow daily-use UX ideas from `C:\Users\Admin\Desktop\carbon-footprint-assistant` and proof/security/eval discipline from `C:\Users\Admin\Desktop\election-clarity-india`.

**Tech Stack:** Next.js 16, React 19, TypeScript strict mode, Tailwind CSS v4, Zod, Vitest, Playwright, axe-core, Gemini API, localStorage/sessionStorage.

---

## Source Projects Reviewed

### Current Project

- Root: `C:\Users\Admin\Desktop\project`
- Main app routes: `app/`
- Carbon logic: `lib/carbon/`
- Validation: `lib/validation/schemas.ts`
- Tests: `tests/`
- Docs/evidence: `README.md`, `docs/`, `evidence/`

### Carbon Product Reference

- Root: `C:\Users\Admin\Desktop\carbon-footprint-assistant`
- Activity store pattern: `src/lib/store/carbon-store.ts`
- Store validation helpers: `src/lib/store/helpers.ts`
- Activity emissions engine: `src/lib/emissions/calculate.ts`
- Emission factors with per-factor metadata: `src/lib/emissions/factors.ts`
- Insights rules: `src/lib/insights/analyze.ts`
- Accessible activity form: `src/components/app/ActivityForm.tsx`
- Streaming assistant UI: `src/components/app/AssistantChat.tsx`
- Assistant hook: `src/components/app/useAssistantChat.ts`
- Safe markdown renderer: `src/components/app/Markdown.tsx`
- Accessible select/listbox: `src/components/ui/Select.tsx`
- Semantic breakdown chart: `src/components/charts/BreakdownChart.tsx`
- Security headers with optional nonce: `src/lib/security/headers.ts`

### Judge Evidence Reference

- Root: `C:\Users\Admin\Desktop\election-clarity-india`
- API route wrapper: `apps/web/lib/api/public-route.ts`
- Safe API error response: `apps/web/lib/api/error-response.ts`
- Request guard/body limit pattern: `apps/web/lib/assistant/request-guards.ts`
- Rate limiter pattern: `apps/web/lib/security/rate-limit.ts`
- API response headers: `apps/web/lib/security/response-headers.ts`
- Assistant response contract: `packages/shared/src/assistant-response-schema.ts`
- Deterministic assistant decision engine: `apps/web/lib/assistant/decision-engine.ts`
- Assistant content/refusal layer: `apps/web/lib/assistant/content.ts`
- Safety classifier: `apps/web/lib/safety/classifier.ts`
- Assistant telemetry: `apps/web/lib/observability/assistant-telemetry.ts`
- Assistant eval suite: `evals/assistant-evals.test.ts`
- Evidence docs: `docs/`, `evidence/`
- CI gates: `.github/workflows/ci.yml`, `.github/workflows/pr-discipline.yml`

---

## Current Project Strengths To Preserve

- Keep the guided route flow: `/`, `/onboarding`, `/calculator`, `/dashboard`, `/assistant`, `/log`, `/actions`, `/report`.
- Keep pure carbon engine modules:
  - `lib/carbon/calculate.ts`
  - `lib/carbon/scoring.ts`
  - `lib/carbon/recommendations.ts`
  - `lib/carbon/simulator.ts`
  - `lib/carbon/factors.ts`
- Keep Zod boundary validation in `lib/validation/schemas.ts`.
- Keep local-first privacy model using browser storage only.
- Keep existing security files:
  - `proxy.ts`
  - `next.config.ts`
  - `lib/carbon/security/headers.ts`
  - `lib/carbon/redaction.ts`
  - `lib/carbon/sanitize.ts`
- Keep existing evidence structure:
  - `README.md`
  - `docs/ACCESSIBILITY.md`
  - `docs/FORMULAS.md`
  - `docs/SECURITY.md`
  - `docs/quality-checklist.md`
  - `docs/final-judge-readiness-report.md`
  - `evidence/ai-judge-evidence-map.md`

---

## Priority Order

1. P0: Fix stale docs and evidence consistency.
2. P0: Refactor `/log` into a real reusable activity tracking subsystem.
3. P0: Add shared public API guards and consistent assistant response headers.
4. P0: Strengthen assistant contracts, fallback behavior, and evals.
5. P1: Improve accessibility and product polish using reusable UI primitives.
6. P1: Add source/factor confidence and freshness evidence.
7. P1: Improve CI and release proof.
8. P2: Add performance budgets, smoke checks, and final judge demo assets.

---

## File Structure Target

### New Files To Create

- `lib/carbon/activity-types.ts`  
  Single source of truth for activity log categories, activity type IDs, labels, units, and mapping to emission calculations.

- `lib/carbon/activity-log.ts`  
  Zod schemas and pure helpers for loading, saving, adding, editing, deleting, sorting, and validating activity log entries.

- `components/carbon/activity-form.tsx`  
  Reusable accessible form for adding/editing activity log entries.

- `components/carbon/activity-table.tsx`  
  Reusable table/list for displaying logged activities with edit/delete controls.

- `components/carbon/activity-empty-state.tsx`  
  Empty state for the log page when the user has no real activities.

- `components/carbon/assistant-transcript.tsx`  
  Accessible `role="log"` transcript for assistant turns.

- `components/carbon/safe-markdown.tsx`  
  Safe markdown renderer copied conceptually from the carbon reference, without `dangerouslySetInnerHTML`.

- `lib/carbon/api/errors.ts`  
  Shared JSON error helpers, request ID creation, redacted error formatting, and response header helpers.

- `lib/carbon/api/public-route.ts`  
  Shared API route wrapper inspired by `election-clarity-india/apps/web/lib/api/public-route.ts`.

- `lib/carbon/api/rate-limit.ts`  
  Shared rate limiter result and standard rate-limit headers.

- `lib/carbon/ai/contracts.ts`  
  Assistant response schemas, chat response schemas, runtime metadata schemas, and source/fallback discriminators.

- `tests/unit/activity-log.test.ts`

- `tests/unit/activity-form.test.tsx`

- `tests/unit/api-public-route.test.ts`

- `tests/unit/assistant-contracts.test.ts`

- `tests/unit/assistant-behavior-baseline.test.ts`

- `tests/unit/factor-confidence.test.ts`

- `tests/e2e/judge-demo-flow.spec.ts`

- `data/emission-factor-sources.json`

- `docs/factor-source-confidence.md`

- `docs/release-confidence.md`

- `docs/qa-report.md`

- `.github/pull_request_template.md`

- `.github/ISSUE_TEMPLATE/bug_report.yml`

- `.github/ISSUE_TEMPLATE/feature_request.yml`

### Existing Files To Modify

- `app/log/page.tsx`
- `components/carbon/dashboard-client.tsx`
- `components/carbon/report-client.tsx`
- `components/carbon/category-breakdown.tsx`
- `components/carbon/goal-setter.tsx`
- `app/assistant/page.tsx`
- `components/carbon/assistant-insight.tsx`
- `app/api/assistant/chat/route.ts`
- `app/api/assistant/narrate/route.ts`
- `app/api/calculate/route.ts`
- `app/api/recommendations/route.ts`
- `app/api/health/route.ts`
- `lib/carbon/progress.ts`
- `lib/carbon/session.ts`
- `lib/carbon/factors.ts`
- `lib/carbon/assistant-tools.ts`
- `lib/carbon/ai/prompt.ts`
- `lib/carbon/ai/client.ts`
- `lib/validation/schemas.ts`
- `proxy.ts`
- `next.config.ts`
- `README.md`
- `docs/ACCESSIBILITY.md`
- `docs/FORMULAS.md`
- `docs/SECURITY.md`
- `docs/quality-checklist.md`
- `docs/final-judge-readiness-report.md`
- `evidence/ai-judge-evidence-map.md`
- `.github/workflows/ci.yml`
- `package.json`

---

## Task 1: Documentation Consistency Cleanup

**Purpose:** Judges should trust every claim. Current docs have inconsistent known test counts and some stale comparison statements.

**Use From References:**

- `C:\Users\Admin\Desktop\election-clarity-india\README.md`
- `C:\Users\Admin\Desktop\election-clarity-india\evidence\ai-judge-evidence-map.md`
- `C:\Users\Admin\Desktop\election-clarity-india\docs\final-judge-readiness-report.md`

**Files:**

- Modify: `README.md`
- Modify: `COMPETITION_READINESS_COMPARISON.md`
- Modify: `docs/final-judge-readiness-report.md`
- Modify: `docs/quality-checklist.md`
- Modify: `evidence/ai-judge-evidence-map.md`

**Steps:**

- [ ] Replace exact test-count claims with dated verification wording unless the count is freshly verified.

  Use this wording pattern:

  ```md
  Latest known local verification snapshot: unit/component tests, E2E browser flows, typecheck, lint, production build, and bundle inspection were prepared as explicit quality gates. Re-run `pnpm verify` and `pnpm test:e2e` before final submission for current counts.
  ```

- [ ] Update the route list everywhere to include:

  ```txt
  / -> /onboarding -> /calculator -> /dashboard -> /assistant -> /log -> /actions -> /report
  ```

- [ ] Update API docs everywhere to include:

  ```txt
  GET /api/health
  POST /api/calculate
  POST /api/recommendations
  POST /api/assistant/chat
  POST /api/assistant/narrate
  ```

- [ ] Update `COMPETITION_READINESS_COMPARISON.md` so it no longer says `/log` lacks natural-unit tracking. The current `app/log/page.tsx` already supports dated activity entries with category, activity type, quantity, preview, edit, delete, and clear.

- [ ] Add a clear "Chosen vertical" section to `README.md`:

  ```md
  ## Chosen Vertical

  Carbon Compass is designed for everyday individuals in Indian urban households, especially students, young professionals, and families who want a private, simple way to understand, track, and reduce lifestyle emissions.
  ```

- [ ] Add a clear "Assumptions" section to `README.md` that says:

  ```md
  - Carbon numbers are educational estimates, not certified carbon audits.
  - Emission factors are static and should be refreshed before production use.
  - Location is city-level only; the app does not request exact address or GPS.
  - User data is stored locally in the browser.
  - The AI assistant narrates deterministic calculations and falls back to local rules when Gemini is unavailable.
  ```

**Validation:**

- [ ] Read all changed docs and confirm no stale test count remains.
- [ ] Confirm every judging criterion maps to source files, tests, fallback behavior, and limitations.
- [ ] Do not run tests unless execution mode allows it later.

---

## Task 2: Activity Tracking Subsystem Refactor

**Purpose:** Make `/log` feel like a maintainable real product feature, not a large page-local component.

**Use From References:**

- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\lib\store\carbon-store.ts`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\lib\store\helpers.ts`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\app\ActivityForm.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\lib\emissions\factors.ts`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\lib\emissions\calculate.ts`

**Files:**

- Create: `lib/carbon/activity-types.ts`
- Create: `lib/carbon/activity-log.ts`
- Create: `components/carbon/activity-form.tsx`
- Create: `components/carbon/activity-table.tsx`
- Create: `components/carbon/activity-empty-state.tsx`
- Modify: `app/log/page.tsx`
- Modify: `lib/carbon/progress.ts`
- Test: `tests/unit/activity-log.test.ts`
- Test: `tests/unit/activity-form.test.tsx`

**Implementation Details:**

- [ ] Move `CATEGORY_META` and `ACTIVITY_TYPES` out of `app/log/page.tsx` into `lib/carbon/activity-types.ts`.

- [ ] Use plain ASCII labels and no emoji in domain constants. UI icons can be added separately.

- [ ] Use this shape for activity type metadata:

  ```ts
  export type ActivityTypeDefinition = {
    id: string;
    category: CarbonCategory;
    label: string;
    unit: string;
    helperText: string;
  };
  ```

- [ ] Keep the current category/type IDs compatible:

  ```txt
  transport: two_wheeler, car, public_transport, cab_auto, flight
  energy: electricity, lpg, ac
  food: meat_meal, delivery
  shopping: clothes, online, electronics
  waste: recycling, composting
  ```

- [ ] Create `activityLogEntrySchema` in `lib/carbon/activity-log.ts` with:

  ```ts
  id: z.string().min(1)
  recordedAt: z.string().datetime()
  category: z.enum(["transport", "energy", "food", "shopping", "waste"])
  activityType: z.string().min(1)
  value: z.number().finite().nonnegative()
  kgCO2e: z.number().finite()
  ```

- [ ] Add pure helper functions:

  ```ts
  loadActivityLog(storage?: StorageLike): ActivityLogEntry[]
  saveActivityLog(entries: ActivityLogEntry[], storage?: StorageLike): void
  addActivityLogEntry(entry: ActivityLogEntry, storage?: StorageLike): ActivityLogEntry[]
  updateActivityLogEntry(id: string, patch: ActivityLogEntry, storage?: StorageLike): ActivityLogEntry[]
  deleteActivityLogEntry(id: string, storage?: StorageLike): ActivityLogEntry[]
  clearActivityLog(storage?: StorageLike): void
  ```

- [ ] Generate IDs using `crypto.randomUUID()` with timestamp fallback:

  ```ts
  export function makeActivityId(): string {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
    return `activity-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
  }
  ```

- [ ] Refactor `app/log/page.tsx` so it only composes:

  ```tsx
  <ActivityForm />
  <ActivityTable />
  <ActivityEmptyState />
  ```

- [ ] Keep edit, delete, clear, and live preview behavior.

- [ ] Add `aria-live="polite"` for success feedback.

**Validation:**

- [ ] Add tests for invalid JSON storage, corrupted entries, add, edit, delete, clear, and sorting.
- [ ] Add UI tests for preview emissions and edit flow.
- [ ] Later execution command: `pnpm test tests/unit/activity-log.test.ts tests/unit/activity-form.test.tsx`

---

## Task 3: Reusable UI Primitives And Accessibility Polish

**Purpose:** Reduce duplicated Tailwind classes and improve consistent accessibility.

**Use From References:**

- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\ui\Button.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\ui\Field.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\ui\Input.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\ui\Select.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\ui\Toast.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\charts\BreakdownChart.tsx`

**Files:**

- Create or modify: `components/ui/button.tsx`
- Create or modify: `components/ui/field.tsx`
- Create or modify: `components/ui/input.tsx`
- Create or modify: `components/ui/select.tsx`
- Create or modify: `components/ui/toast.tsx`
- Modify: `components/carbon/footprint-form.tsx`
- Modify: `components/carbon/goal-setter.tsx`
- Modify: `components/carbon/category-breakdown.tsx`
- Modify: `components/carbon/recommendation-card.tsx`
- Modify: `app/log/page.tsx`
- Modify: `app/globals.css`

**Implementation Details:**

- [ ] Add shared `Button` with variants:

  ```txt
  primary
  secondary
  danger
  ghost
  ```

- [ ] Add shared `Field` wrapper that provides:

  ```txt
  label
  hint
  error
  id
  aria-describedby
  role="alert" for errors
  ```

- [ ] Add shared `Input` with consistent focus states and `min-height`.

- [ ] Add shared accessible `Select`. Prefer the reference listbox implementation only if there is enough time; otherwise start with a well-labelled native `select`.

- [ ] Add global tabular number utility:

  ```css
  .tnum {
    font-variant-numeric: tabular-nums;
  }
  ```

- [ ] Update numeric metrics in dashboard, report, log, goal, and chart components to use `tnum`.

- [ ] Replace emoji badges in `/log` with text/icon labels. If adding icons, install `lucide-react`; otherwise use text-only accessible labels.

- [ ] Update `CategoryBreakdown` to include a semantic table or keep the visible list but add table-like row headers.

**Validation:**

- [ ] Existing accessibility tests should still find one H1 per page.
- [ ] E2E should still pass axe scans after implementation.
- [ ] Manual check: keyboard focus order through calculator, log form, goal setter, assistant, report.

---

## Task 4: Shared API Guard Layer

**Purpose:** Make public API routes safer and more maintainable.

**Use From References:**

- `C:\Users\Admin\Desktop\election-clarity-india\apps\web\lib\api\public-route.ts`
- `C:\Users\Admin\Desktop\election-clarity-india\apps\web\lib\api\error-response.ts`
- `C:\Users\Admin\Desktop\election-clarity-india\apps\web\lib\assistant\request-guards.ts`
- `C:\Users\Admin\Desktop\election-clarity-india\apps\web\lib\security\response-headers.ts`

**Files:**

- Create: `lib/carbon/api/errors.ts`
- Create: `lib/carbon/api/public-route.ts`
- Create: `lib/carbon/api/rate-limit.ts`
- Modify: `app/api/calculate/route.ts`
- Modify: `app/api/recommendations/route.ts`
- Modify: `app/api/assistant/chat/route.ts`
- Modify: `app/api/assistant/narrate/route.ts`
- Modify: `app/api/health/route.ts`
- Modify: `lib/carbon/utils.ts`
- Test: `tests/unit/api-public-route.test.ts`
- Test: `tests/unit/api-routes.test.ts`

**Implementation Details:**

- [ ] Create request IDs:

  ```ts
  export function createRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
  ```

- [ ] Create a shared JSON error body:

  ```ts
  {
    code: string;
    error: string;
    requestId: string;
  }
  ```

- [ ] Every API response should include:

  ```txt
  X-Request-ID
  Cache-Control: no-store for assistant/API JSON responses
  X-Content-Type-Options: nosniff
  ```

- [ ] Assistant route responses should include:

  ```txt
  RateLimit-Limit
  RateLimit-Remaining
  RateLimit-Reset
  Retry-After on 429
  ```

- [ ] Use shared bounded body reading for JSON endpoints that accept larger or AI-bound payloads.

- [ ] Keep same-origin POST checks in the edge proxy and duplicate critical checks at the API wrapper level for defense in depth.

- [ ] Replace route-local `parseJson()` helpers in `calculate` and `recommendations` with shared parsing.

**Validation:**

- [ ] Add tests for malformed JSON, payload too large, validation failure, redacted error, request ID header, and rate-limit headers.
- [ ] Later execution command: `pnpm test tests/unit/api-public-route.test.ts tests/unit/api-routes.test.ts`

---

## Task 5: Strong Assistant Contracts And Behavior Baselines

**Purpose:** Make the assistant judge-safe: deterministic facts are authoritative; model output is validated and bounded.

**Use From References:**

- `C:\Users\Admin\Desktop\election-clarity-india\packages\shared\src\assistant-response-schema.ts`
- `C:\Users\Admin\Desktop\election-clarity-india\packages\assistant-runtime\src\service.ts`
- `C:\Users\Admin\Desktop\election-clarity-india\evals\assistant-evals.test.ts`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\lib\ai\prompt.ts`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\app\Markdown.tsx`

**Files:**

- Create: `lib/carbon/ai/contracts.ts`
- Create: `components/carbon/safe-markdown.tsx`
- Create: `components/carbon/assistant-transcript.tsx`
- Modify: `lib/carbon/ai/prompt.ts`
- Modify: `lib/carbon/ai/client.ts`
- Modify: `app/api/assistant/chat/route.ts`
- Modify: `app/api/assistant/narrate/route.ts`
- Modify: `app/assistant/page.tsx`
- Modify: `components/carbon/assistant-insight.tsx`
- Test: `tests/unit/assistant-contracts.test.ts`
- Test: `tests/unit/assistant-behavior-baseline.test.ts`
- Test: `tests/unit/assistant-chat-api.test.ts`
- Test: `tests/unit/assistant-api.test.ts`

**Implementation Details:**

- [ ] Define a shared assistant runtime metadata shape:

  ```ts
  export const assistantRuntimeSchema = z.object({
    source: z.enum(["gemini", "fallback", "rate_limited", "invalid_response"]),
    attemptedModels: z.array(z.string()),
    modelUsed: z.string().optional(),
    costUSD: z.number().finite().nonnegative().optional(),
    requestId: z.string(),
  }).strict();
  ```

- [ ] Define narration response schema:

  ```ts
  export const assistantNarrationResponseSchema = z.object({
    narrative: z.string().trim().min(5).max(4000),
    weeklyChallenge: z.string().trim().min(5).max(1000),
    goalTip: z.string().trim().min(5).max(1000),
    runtime: assistantRuntimeSchema,
  }).strict();
  ```

- [ ] Define chat response schema:

  ```ts
  export const assistantChatResponseSchema = z.object({
    content: z.string().trim().min(1).max(6000),
    runtime: assistantRuntimeSchema,
  }).strict();
  ```

- [ ] Validate Gemini JSON output with Zod after `JSON.parse()` and before returning.

- [ ] If Gemini output fails schema validation, return deterministic fallback and runtime source `invalid_response`.

- [ ] Add behavior baseline cases:

  ```txt
  biggest source question
  reduce footprint question
  India average comparison
  off-topic coding question
  medical/legal question
  prompt injection request
  missing API key
  malformed provider JSON
  function call with invalid args
  ```

- [ ] Make the assistant page transcript use:

  ```tsx
  <div role="log" aria-live="polite" aria-label="Conversation with Carbon Compass assistant">
  ```

- [ ] Add safe Markdown rendering only for assistant replies. Do not use `dangerouslySetInnerHTML`.

**Validation:**

- [ ] Later execution command: `pnpm test tests/unit/assistant-contracts.test.ts tests/unit/assistant-behavior-baseline.test.ts tests/unit/assistant-chat-api.test.ts tests/unit/assistant-api.test.ts`

---

## Task 6: Factor Source Confidence And Methodology

**Purpose:** Make carbon math auditable and transparent.

**Use From References:**

- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\lib\emissions\factors.ts`
- `C:\Users\Admin\Desktop\election-clarity-india\evidence\source-freshness.md`
- `C:\Users\Admin\Desktop\election-clarity-india\docs\SOURCE_GROUNDING.md`

**Files:**

- Create: `data/emission-factor-sources.json`
- Create: `docs/factor-source-confidence.md`
- Modify: `lib/carbon/factors.ts`
- Modify: `lib/carbon/types.ts`
- Modify: `docs/FORMULAS.md`
- Modify: `README.md`
- Modify: `components/carbon/report-client.tsx`
- Modify: `components/carbon/category-breakdown.tsx`
- Test: `tests/unit/factors.test.ts`
- Test: `tests/unit/factor-confidence.test.ts`

**Implementation Details:**

- [ ] Extend `EmissionFactor` with:

  ```ts
  sourceName: string;
  sourceUrl?: string;
  lastCheckedAt?: string;
  confidence: "high" | "medium" | "low";
  limitation: string;
  ```

- [ ] Add source URL and confidence for each major category:

  ```txt
  India grid electricity
  two-wheeler
  car
  public transport
  cab/auto
  LPG
  domestic flight
  diet tiers
  meat meals
  delivery
  clothes
  online orders
  electronics
  waste/recycling/composting
  ```

- [ ] Create `data/emission-factor-sources.json` with:

  ```json
  {
    "schemaVersion": 1,
    "lastReviewedAt": "2026-06-09",
    "factors": []
  }
  ```

- [ ] Add a visible methodology section to report:

  ```txt
  Educational estimate
  Static factor set
  Source confidence
  Last reviewed date
  Not a certified carbon audit
  ```

- [ ] Align all numbers in `README.md`, `docs/FORMULAS.md`, and `lib/carbon/factors.ts`.

**Validation:**

- [ ] Add tests that fail if docs/source JSON and code factors drift in IDs or key values.
- [ ] Later execution command: `pnpm test tests/unit/factors.test.ts tests/unit/factor-confidence.test.ts`

---

## Task 7: Dashboard, Report, And Goal Product Polish

**Purpose:** Make the app feel like a real ongoing tracker, not a one-time calculator.

**Use From References:**

- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\app\DashboardClient.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\app\ActivityList.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\app\GoalSetter.tsx`
- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\components\charts\TrendChart.tsx`

**Files:**

- Modify: `components/carbon/dashboard-client.tsx`
- Modify: `components/carbon/progress-trend.tsx`
- Modify: `components/carbon/report-client.tsx`
- Modify: `components/carbon/goal-setter.tsx`
- Modify: `components/carbon/metric-card.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/report/page.tsx`
- Test: `tests/unit/dashboard-actions.test.tsx`
- Test: `tests/unit/progress-report.test.tsx`
- Test: `tests/unit/goal-setter.test.tsx`

**Implementation Details:**

- [ ] Show whether data source is:

  ```txt
  Real calculator session
  Real activity log
  Demo profile
  Generated one-entry fallback
  ```

- [ ] Add a dashboard card for activity log count and latest logged activity.

- [ ] Let report show:

  ```txt
  footprint summary
  top source
  best action
  goal progress
  activity history summary
  methodology/factor confidence
  limitations
  ```

- [ ] If progress history is generated from current session, label it:

  ```txt
  This report uses your current estimate as the first progress point. Save future check-ins to compare change over time.
  ```

- [ ] Make goal feedback use `aria-live="polite"` instead of only `role="alert"` for success messages.

**Validation:**

- [ ] Existing report tests should still pass.
- [ ] Add tests for real data label, demo label, and generated first-entry label.

---

## Task 8: CI, Smoke Checks, And Release Proof

**Purpose:** Make judging confidence visible and automated.

**Use From References:**

- `C:\Users\Admin\Desktop\election-clarity-india\.github\workflows\ci.yml`
- `C:\Users\Admin\Desktop\election-clarity-india\scripts\cloudrun-smoke.mjs`
- `C:\Users\Admin\Desktop\election-clarity-india\docs\release-confidence.md`
- `C:\Users\Admin\Desktop\election-clarity-india\docs\qa-report.md`

**Files:**

- Modify: `.github/workflows/ci.yml`
- Modify: `scripts/smoke.mjs`
- Modify: `scripts/inspect-client-chunks.mjs`
- Modify: `package.json`
- Create: `docs/release-confidence.md`
- Create: `docs/qa-report.md`
- Test: `tests/unit/ci-workflow.test.ts` if a workflow test pattern is added

**Implementation Details:**

- [ ] Ensure CI runs:

  ```txt
  pnpm audit:prod
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  pnpm perf:bundle-report
  client bundle secret scan
  pnpm test:e2e
  ```

- [ ] Ensure `pnpm verify` remains the local all-gates command.

- [ ] Expand `scripts/smoke.mjs` to check:

  ```txt
  GET /
  GET /calculator
  GET /dashboard
  GET /assistant
  GET /log
  GET /actions
  GET /report
  GET /api/health
  POST /api/calculate with demo payload
  POST /api/recommendations with demo payload
  POST /api/assistant/chat without key returns fallback
  ```

- [ ] Add bundle thresholds to `scripts/inspect-client-chunks.mjs`. Initial suggested budgets:

  ```txt
  fail if any client chunk exceeds 350 KB gzip-equivalent estimate
  fail if total first-load JS exceeds documented budget
  ```

- [ ] Add `docs/release-confidence.md` with:

  ```txt
  local gate status
  CI gate status
  smoke status
  E2E/a11y status
  known risks
  release decision
  ```

- [ ] Add `docs/qa-report.md` with manual checks:

  ```txt
  keyboard flow
  mobile 390px overflow
  reduced motion
  print report
  assistant fallback
  corrupted storage
  no API key
  ```

**Validation:**

- [ ] Later execution command: `pnpm verify`
- [ ] Later execution command: `pnpm test:e2e`
- [ ] Later execution command: `pnpm smoke`

---

## Task 9: GitHub Hygiene And Maintainability Signals

**Purpose:** Judges often reward clean maintainability artifacts.

**Use From References:**

- `C:\Users\Admin\Desktop\election-clarity-india\.github\pull_request_template.md`
- `C:\Users\Admin\Desktop\election-clarity-india\.github\ISSUE_TEMPLATE\bug_report.yml`
- `C:\Users\Admin\Desktop\election-clarity-india\.github\ISSUE_TEMPLATE\feature_request.yml`
- `C:\Users\Admin\Desktop\election-clarity-india\.github\CODEOWNERS`
- `C:\Users\Admin\Desktop\election-clarity-india\.github\workflows\pr-discipline.yml`

**Files:**

- Create: `.github/pull_request_template.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/CODEOWNERS`
- Optional create: `.github/workflows/pr-discipline.yml`
- Modify: `CONTRIBUTING.md`

**Implementation Details:**

- [ ] PR template must ask for:

  ```txt
  Summary
  Judging criteria affected
  Testing evidence
  Accessibility impact
  Security/privacy impact
  Screenshots or demo notes
  Known limitations
  ```

- [ ] Bug template must ask for:

  ```txt
  Route/page
  Steps to reproduce
  Expected behavior
  Actual behavior
  Browser/device
  Accessibility impact
  Console/server errors
  ```

- [ ] Feature template must ask for:

  ```txt
  User problem
  Proposed behavior
  Carbon logic affected
  Security/privacy implications
  Testing plan
  ```

- [ ] CODEOWNERS can start simple:

  ```txt
  * @priyanshuchawda
  ```

**Validation:**

- [ ] Manually read templates for clarity.
- [ ] Add docs-link tests only if current test style already supports it.

---

## Task 10: Final Judge Demo Flow And Evidence Assets

**Purpose:** Make evaluation easy in five minutes.

**Use From References:**

- `C:\Users\Admin\Desktop\election-clarity-india\README.md`
- `C:\Users\Admin\Desktop\election-clarity-india\evidence\demo-screenshots.md`
- `C:\Users\Admin\Desktop\election-clarity-india\evidence\assistant-sample-transcripts.md`

**Files:**

- Modify: `README.md`
- Create: `evidence/demo-flow.md`
- Create: `evidence/assistant-sample-transcripts.md`
- Optional create: `scripts/capture-demo-screenshots.mjs`
- Test: `tests/e2e/judge-demo-flow.spec.ts`

**Implementation Details:**

- [ ] Add this judge route:

  ```txt
  1. Open /
  2. Click Calculate My Footprint
  3. Use Pune student demo data
  4. View dashboard metrics and category breakdown
  5. Save check-in
  6. Open what-if simulator
  7. Ask assistant "What is driving my emissions the most?"
  8. Open /log and add one activity
  9. Open /actions and inspect ranked actions
  10. Open /report and print/export
  ```

- [ ] Add sample assistant transcripts for:

  ```txt
  missing API key fallback
  biggest source
  reduce footprint
  compare to India average
  off-topic refusal
  prompt injection refusal/redirect
  ```

- [ ] Add final evidence table:

  ```txt
  Requirement
  Feature
  Source files
  Tests
  Demo step
  Limitation
  ```

**Validation:**

- [ ] `tests/e2e/judge-demo-flow.spec.ts` should exercise the exact README demo route.
- [ ] Evidence docs should not claim live provider behavior unless the app is configured with a key.

---

## Task 11: Security Hardening Follow-Up

**Purpose:** Close remaining safe-practice gaps without overengineering.

**Use From References:**

- `C:\Users\Admin\Desktop\carbon-footprint-assistant\src\lib\security\headers.ts`
- `C:\Users\Admin\Desktop\election-clarity-india\docs\security-review.md`
- `C:\Users\Admin\Desktop\election-clarity-india\docs\production-secrets.md`
- `C:\Users\Admin\Desktop\election-clarity-india\apps\web\lib\security\audit.ts`

**Files:**

- Modify: `lib/carbon/security/headers.ts`
- Modify: `proxy.ts`
- Modify: `docs/SECURITY.md`
- Modify: `SECURITY.md`
- Modify: `.env.example`
- Optional create: `lib/carbon/security/audit.ts`
- Test: `tests/unit/sanitize.test.ts`
- Test: `tests/unit/redaction.test.ts`
- Test: `tests/unit/api-routes.test.ts`

**Implementation Details:**

- [ ] Keep CSP honest. If nonce CSP is not implemented, docs must explicitly say:

  ```txt
  The current CSP allows `'unsafe-inline'` for Next.js hydration compatibility. Third-party script sources remain blocked. A nonce-based migration is tracked as a future hardening item.
  ```

- [ ] If implementing nonce CSP, add optional nonce support to `securityHeaders(nonce)` and pass it where feasible.

- [ ] Add redacted security/audit logs for assistant failures:

  ```txt
  requestId
  route
  status
  runtime source
  redacted error name/message
  ```

- [ ] Ensure `.env.example` lists:

  ```txt
  GEMINI_API_KEY=
  NEXT_PUBLIC_SITE_URL=
  ```

- [ ] Ensure docs say `GEMINI_API_KEY` must never be `NEXT_PUBLIC_`.

**Validation:**

- [ ] Existing secret bundle scan in CI should remain.
- [ ] Add test that provider URL/API key does not appear in assistant page output.

---

## Task 12: Final Verification Matrix

**Purpose:** Define exactly what to run before submission.

**Files:**

- Modify: `docs/quality-checklist.md`
- Modify: `docs/final-judge-readiness-report.md`
- Modify: `README.md`

**Final Gate Commands:**

```bash
pnpm install --frozen-lockfile
pnpm audit:prod
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm perf:bundle-report
pnpm smoke
pnpm test:e2e
```

**Manual Checks:**

- [ ] Open landing page and complete demo flow.
- [ ] Complete calculator with demo data.
- [ ] Save dashboard check-in.
- [ ] Add, edit, delete activity in `/log`.
- [ ] Ask assistant with missing key and confirm fallback.
- [ ] Ask assistant with off-topic question and confirm redirect/refusal.
- [ ] Open report and browser print preview.
- [ ] Check 390px mobile width for no horizontal overflow.
- [ ] Keyboard tab through header, calculator, dashboard, log, assistant, report.
- [ ] Confirm reduced motion setting does not break UI.

---

## Recommended Execution Sequence

### Phase 1: Trust And Evidence

- Task 1: Documentation Consistency Cleanup
- Task 10: Final Judge Demo Flow And Evidence Assets

### Phase 2: Product Usability

- Task 2: Activity Tracking Subsystem Refactor
- Task 3: Reusable UI Primitives And Accessibility Polish
- Task 7: Dashboard, Report, And Goal Product Polish

### Phase 3: Safety And Assistant Rigor

- Task 4: Shared API Guard Layer
- Task 5: Strong Assistant Contracts And Behavior Baselines
- Task 11: Security Hardening Follow-Up

### Phase 4: Release Confidence

- Task 6: Factor Source Confidence And Methodology
- Task 8: CI, Smoke Checks, And Release Proof
- Task 9: GitHub Hygiene And Maintainability Signals
- Task 12: Final Verification Matrix

---

## Non-Goals

- Do not add accounts or server database storage before submission.
- Do not add live geolocation or exact address collection.
- Do not claim certified carbon-audit precision.
- Do not make the AI the source of truth for calculations.
- Do not rewrite the whole app into the reference project structure.
- Do not add large dependencies unless they directly support judging criteria.

---

## Final Submission Positioning

Carbon Compass should be presented as:

- A privacy-first carbon footprint awareness platform.
- A deterministic carbon calculator with transparent assumptions.
- A practical habit tracker with activity logs, goals, progress, simulator, and report.
- A smart assistant that explains user-specific data and falls back safely.
- A tested, accessible, security-conscious Next.js application.

The strongest final sentence for judges:

```txt
The assistant is smart because the product logic is smart: calculations, recommendations, simulations, progress, and safety boundaries are deterministic, tested, and transparent; AI is used only to explain those facts in a user-friendly way.
```
