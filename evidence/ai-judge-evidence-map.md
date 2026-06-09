# AI Judge Evidence Map

This map connects hackathon evaluation criteria to concrete implementations, unit test files, fallback rules, and project limitations.

| Judging Rubric Area | Implemented Feature | Source Files | Unit Tests / Coverage | Fallback Behavior | Operational Limitation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Smart Assistant** | Progressive Gemini narration, structural JSON outputs, usage token costs, and weekly challenges. | `app/api/assistant/narrate/route.ts`; `components/carbon/assistant-insight.tsx` | `tests/unit/assistant-insight.test.tsx`; `tests/unit/assistant-api.test.ts` | Falls back to rule-based recommendations if Gemini key is missing, rate-limited, or offline. | Narrates summaries based on calculator inputs; cannot predict user habits outside input parameters. |
| **Logical Decisions** | Activity emission breakdowns, score rating calculations, simulation of commuter behaviors. | `lib/carbon/calculate.ts`; `lib/carbon/scoring.ts`; `lib/carbon/simulator.ts` | `tests/unit/calculate.test.ts`; `tests/unit/scoring.test.ts`; `tests/unit/simulator.test.ts` | Zero-emissions default output if inputs are completely blank. | Estimates potentials using static India energy baselines; not a certified carbon inventory. |
| **Real Usability** | Commute, home energy, food, shopping, and waste forms, dashboard simulator, and progress report. | `components/carbon/footprint-form.tsx`; `components/carbon/dashboard-client.tsx`; `app/report/page.tsx` | `tests/unit/footprint-form.test.tsx`; `tests/unit/dashboard-actions.test.tsx`; `tests/unit/progress-report.test.tsx` | Fallback to pre-compiled Demo Profile (Pune student) if the user skips onboarding. | Session data is browser-locked and cleared on tab closure. |
| **Code Quality** | Strict TypeScript, extracted numeric helpers, clean separation of client/server components. | `lib/carbon/utils.ts`; `lib/carbon/session.ts` | `tests/unit/utils.test.ts`; `tests/unit/session-bridge.test.ts` | Compiler throws build-time errors if type safety is violated. | Custom linter limits are verified locally in ESLint config. |
| **Security & Privacy** | Zod input schema boundary checks, API error scrubbing, local session boundaries. | `lib/validation/schemas.ts`; `lib/carbon/redaction.ts` | `tests/unit/validation.test.ts`; `tests/unit/redaction.test.ts` | Fails closed on invalid schema formats. | Excludes PII entirely; maps geographic grid values at city level only. |
| **Accessibility** | Semantic elements, single H1 headers, skip link, and text alternatives for graphical charts. | `app/layout.tsx`; `components/carbon/category-breakdown.tsx` | `tests/unit/accessibility.test.tsx` | Screen-readers announce chart details via hidden text lists. | Chart visual layout is optimized for desktop and mobile screen sizes. |

---

## Technical Highlights
1. **Zero-Flicker Progressive Render**: The assistant insight component displays clean, local rule-based advice immediately. It triggers a fetch to the Gemini route in the background, rendering conversational narrations progressively once returned.
2. **API Cost Tracking**: The `/api/assistant/narrate` route inspects token metadata returned in the API response headers to compute usage cost in USD.
3. **Automated Verification**: Run `pnpm quality` to execute linting, typechecks, Vitest unit testing, and Next.js compiler builds.
