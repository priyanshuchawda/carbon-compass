# Accessibility (a11y) Verification

Carbon Compass is designed to be accessible to all users, conforming to WCAG 2.1 AA guidelines. This document outlines the implemented accessibility features, keyboard flows, screen reader supports, and visual design parameters.

## Core Accessibility Features

1. **Keyboard-First Navigation**
   - **Skip Link**: Every page features a visually hidden "Skip to main content" link that appears on focus. It allows keyboard users to bypass header navigation and jump straight to `#main-content`.
   - **Focus Outline Indication**: Standard interactive controls feature clear focus indicators (`focus:ring-2 focus:ring-emerald-500` or browser-native outline parameters) to assist keyboard navigation.
   - **Form Fields Focus Loop**: Onboarding and footprint forms are fully tabbable, maintaining natural source order (`input`, `select`, `button`).

2. **Screen Reader Optimizations (ARIA & Semantics)**
   - **Semantic Heading Hierarchy**: Every page strictly enforces a single `<h1>` tag indicating the main context of the route, with nested `<h2>` and `<h3>` tags correctly structuring section boundaries.
   - **Form Field Labeling**: All numeric inputs, selectors, and text fields have explicit `<label>` tags with matching `htmlFor` properties to prevent ambiguous form inputs for screen reader users.
   - **Chart Text Alternatives**: Graphical charts (using Recharts) can be difficult for screen readers to navigate. We provide a hidden text alternative widget (`<ul aria-label="Category breakdown text summary">`) that lists all categories, values, and percentage shares in raw text.
   - **Status Region Announcements**: Real-time interactive components (like the GoalSetter feedback or form submission warnings) utilize appropriate ARIA tags or roles (`role="alert"`) to immediately notify assistive tech of status changes.

3. **Visual Design Parameters**
   - **Contrast Ratios**: The design system uses high-contrast text combinations (e.g. `text-slate-900` or `text-emerald-800` on white or soft green backgrounds) exceeding WCAG AA requirements (4.5:1 for normal text).
   - **Touch Target Sized Controls**: Interactive controls (inputs, buttons, anchor links) feature a minimum size of 44×44px or have explicit `min-h-11` classes to prevent misclicks on mobile viewports.
   - **Tabular Numbers**: Numeric metrics use `font-variant-numeric: tabular-nums` (or CSS equivalent) to ensure digits align properly when comparing numbers or reading logs.

## Testing Verification

Accessibility has been verified using two primary mechanisms:

- **Unit Accessibility Tests**: In `tests/unit/accessibility.test.tsx`, we verify heading structures and chart text alternative listings programmatically.
- **E2E Axe Accessibility Audits**: Integrated into Playwright E2E tests, the `@axe-core/playwright` engine automatically scans landing, calculator, dashboard, and report pages for contrast, label association, heading violations, and landmark structure.
