# Quality Checklist

This quality checklist details the automated and manual verification gates required before final release of Carbon Compass.

## Automated Verification Gates

1. **Static Analysis & Type Checking**
   - [x] **Strict TypeScript Compilation**: Command `pnpm typecheck` (`tsc --noEmit`) passes with zero warnings or errors.
   - [x] **Linting**: Command `pnpm lint` (`eslint`) enforces code structure, imports boundaries, and clean scopes.

2. **Unit Test Suite Coverage**
   - [x] **Calculation Verification**: Standard carbon math pure logic covers all Indian emission factors.
   - [x] **Eco-Score & Goals logic**: Tests validation bounds, targets, and bonuses.
   - [x] **Zod Schema validation**: Verifies request payloads, profiles, tool arguments, and session storage parsers.
   - [x] **UI Unit components**: Renders calculators, dashboards, reports, and AI helper alerts.
   - [x] **Vitest Execution**: Running `pnpm test` successfully executes all 188 unit test blocks.

3. **End-to-End & Integration Coverage**
   - [x] **Playwright Browser Suite**: Running `pnpm test:e2e` spins up Next.js in production build mode (`next start`) and drives browser scenarios.
   - [x] **Interactive Workflows**: Checks onboarding, simulator updates, monthly goal storage, and chat assistant fallback responses.
   - [x] **a11y axe-core scan**: Automatically checks landing, form, dashboard, and report pages.

---

## Manual Verification Guidelines

1. **Desktop & Mobile Responsive Verification**
   - Open in Chromium/Firefox at default viewport.
   - Resize to 375px width (mobile portrait) to verify elements do not clip, overflow, or hide behind headers.
   - Check touch-targets on links and input fields to ensure they can be selected easily without accidental clicks.

2. **Accessibility Tab Flow**
   - Press `Tab` continuously from page load to check skip link visibility.
   - Ensure focus correctly shifts between navigation headers, forms, inputs, and simulator buttons.
   - Verify that focus outline indicator remains visible and descriptive on custom inputs.

3. **Report Print Preview**
   - Navigate to `/report` and trigger browser print (`Ctrl + P`).
   - Check that headers, footers, simulation controls, and assistant workspace fields are correctly hidden via print styling.
   - Ensure the print format fits properly on a standard A4 page grid.

4. **Assistant Fallback Behaviour**
   - Temporarily remove `GEMINI_API_KEY` from `.env` (or simulate a network disconnection).
   - Enter standard questions like "What is driving my emissions?" or "Give me ways to reduce".
   - Confirm that the UI handles API offline state gracefully, displaying the local rule-based response without crash or error message.
