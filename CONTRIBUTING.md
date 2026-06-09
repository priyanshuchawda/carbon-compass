# Contributing

## Required Workflow

1. Start from an issue.
2. Create a branch named `feat/issue-<number>-short-name`.
3. Keep the work scoped to that issue.
4. Run verification checks before opening the PR.
5. Open a PR with:
   - linked issue
   - summary of changes
   - testing evidence

## Quality Expectations

Before submitting any code changes, ensure all verification commands pass locally:

```bash
# Typecheck TypeScript files without emitting
pnpm typecheck

# Run ESLint check
pnpm lint

# Run Vitest unit tests (with coverage)
pnpm test
pnpm test:coverage

# Run Playwright E2E integration tests
pnpm test:e2e

# Perform production build verification
pnpm build
```

## Architectural Guidelines

- **Domain Separation**: All carbon footprint metrics, calculations, factors, and algorithms must remain pure functions under `lib/carbon/`. UI components should only consume these pure outputs.
- **Strict TypeScript**: Enforce compiler settings such as `noUncheckedIndexedAccess`, `noImplicitOverride`, and `noFallthroughCasesInSwitch`. Do not use `any` types or `@ts-ignore` comments.
- **Strict Validation**: Always validate API payloads using the Zod schemas configured in `lib/validation/schemas.ts`.
- **A11y (Accessibility)**: Ensure form controls are linked to labels, dynamic state changes are announced via `aria-live`, and charts provide fallback screen-reader text.
