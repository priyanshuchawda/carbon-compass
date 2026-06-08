# Carbon Compass Engineering Rules

These rules apply to all future work in this repository.

## Hard Rules

- Do not add GitHub Actions or `.github/workflows`.
- Do not commit secrets, API keys, real `.env` files, tokens, or private data.
- Do not collect exact home addresses or sensitive identity data.
- Do not rely on client-only calculation for final results.
- Do not generate random carbon advice.
- Do not require AI for calculation or recommendations.
- Do not work directly on `main` after initial setup.
- Do not force-push `main`.
- Do not close issues unless relevant tests and checks pass or the limitation is documented.

## Product Rules

- Product name: Carbon Compass.
- Persona: urban student or young professional in India.
- Assistant name: Compass Assistant.
- Main unit: `kg CO2e/month`.
- Results are educational estimates, not audited carbon accounting.
- Use practical, encouraging, non-shaming language.
- Always explain the biggest emission source and the next best action.

## Tech Stack

- Framework: Next.js App Router.
- Language: TypeScript.
- Package manager: pnpm.
- Styling: Tailwind CSS.
- UI components: shadcn/ui where it fits cleanly.
- Validation: Zod.
- Charts: Recharts.
- Unit tests: Vitest.
- Component tests: React Testing Library where useful.
- E2E tests: Playwright.
- Storage for MVP: local browser storage for demo progress.
- Deployment target: Vercel-compatible.

## TypeScript Rules

Enable strict TypeScript. Preserve or add these compiler options:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Additional rules:

- Avoid `any`. Use `unknown` when the type is not known yet.
- Use Zod for external and user-provided input.
- Infer types from Zod schemas where useful.
- Use discriminated unions for category and recommendation variants.
- Centralize category names and emission factors.
- Keep business logic out of React components.
- Keep calculation and recommendation functions pure.

Core shared types should include:

```ts
export type CarbonCategory =
  | "transport"
  | "energy"
  | "food"
  | "shopping"
  | "waste";

export type Persona = "student" | "working" | "family";

export type MainGoal =
  | "save_money"
  | "reduce_carbon"
  | "learn"
  | "habit_building";

export type Difficulty = "easy" | "medium" | "hard";

export type ImpactLevel = "low" | "medium" | "high";
```

## Carbon Logic Rules

Use this formula:

```txt
Emissions kgCO2e = Activity Amount * Emission Factor
```

Required categories:

- transport
- energy
- food
- shopping
- waste

Calculation output must include:

- monthly total
- annual total
- category breakdown
- percentage breakdown
- top category
- eco score
- potential monthly saving
- assumptions

Emission factors must be configurable and source-noted. For India grid electricity, use an educational factor around:

```txt
0.710 kg CO2/kWh
```

Do not show fake precision in the UI. Prefer rounded values such as `182 kg CO2e/month`.

## Recommendation Rules

Recommendations must be deterministic and rule-based.

Each recommendation must include:

```ts
export type Recommendation = {
  id: string;
  category: CarbonCategory;
  title: string;
  reason: string;
  action: string;
  estimatedSavingKgCO2ePerMonth: number;
  difficulty: Difficulty;
  impact: ImpactLevel;
  moneySavingPotential: "none" | "low" | "medium" | "high";
  weeklyChallenge: string;
};
```

Sort recommendations by:

1. user's top emission category
2. estimated saving
3. ease of action
4. user goal match

Goal-specific ranking:

- `save_money`: prefer high money-saving actions.
- `habit_building`: prefer easy weekly challenges.
- `learn`: include clearer explanations.
- `reduce_carbon`: prefer highest savings.

## UI and Accessibility Rules

- Mobile-first layout.
- Semantic HTML.
- One clear `h1` per page.
- Labels for every input.
- Error text connected to inputs.
- Visible focus states.
- Keyboard-navigable forms and controls.
- Sufficient color contrast.
- Do not rely on color alone.
- Charts need text summaries.
- Buttons need accessible names.
- Icons are decorative unless paired with text or labels.
- Avoid guilt or shame in copy.

Preferred copy:

```txt
Your biggest opportunity is transport. Small commute changes can make the biggest difference.
```

Avoid copy like:

```txt
Your lifestyle is bad.
```

## Security and Privacy Rules

- Validate all user inputs with Zod.
- Validate again in server/API routes or server actions.
- Never trust client-side validation only.
- Use safe JSON parsing.
- Do not use `dangerouslySetInnerHTML`.
- Store only approximate lifestyle data.
- City-level location is enough.
- Use `.env.example` only for documented environment variables.
- If optional AI rewriting is added, send the minimum context required and never send sensitive personal data.

Required disclaimer:

```txt
These results are educational estimates based on configurable emission factors. They are not an audited carbon inventory.
```

## Efficiency Rules

- Keep calculations O(n) over categories.
- Load emission factors from static typed data or local JSON.
- Avoid repeated expensive calculations in render.
- Avoid unnecessary client components.
- Keep pages server components where possible.
- Use client components only for forms, charts, local storage, and interactivity.
- Avoid unnecessary AI calls.
- Avoid heavy dependencies unless they clearly improve delivery.

## Testing Rules

Use TDD for core logic:

1. Write the failing test.
2. Run it and confirm failure.
3. Implement the smallest passing change.
4. Run tests again.
5. Commit.

Minimum test areas:

- calculation logic
- recommendation logic
- validation schemas
- eco score
- simulator
- dashboard route
- main E2E user flow
- accessibility basics

Required quality commands:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm test:e2e
```

Run E2E tests when UI flows change.

## GitHub Workflow Rules

- Use the existing GitHub issues.
- Use one branch per issue or vertical slice.
- Branch format:

```txt
feat/issue-<number>-short-description
fix/issue-<number>-short-description
test/issue-<number>-short-description
docs/issue-<number>-short-description
chore/issue-<number>-short-description
```

- Use conventional commits:

```txt
feat(carbon): add footprint calculation engine
test(carbon): cover electricity and category totals
fix(validation): reject negative transport values
docs(readme): add challenge assumptions
```

- PRs must link issues with `Closes #<number>` when complete.
- PRs must include tests run and known limitations.
- UI PRs should include screenshots.
- Security or accessibility work must state what was checked.

## Done Definition

An issue is done only when:

- the feature or doc works as scoped
- relevant tests pass
- typecheck passes
- lint passes
- build passes when applicable
- docs are updated when behavior changes
- no secrets are present
- no GitHub Actions were added
- PR is merged or ready with a clear status

The final project is done only when the judge demo flow works end to end and all final quality gates pass.
