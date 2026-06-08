# AI Agent Rules

These rules are for any AI coding agent working in this repository. The goal is to preserve coding quality while avoiding token waste from huge files, logs, diffs, and repeated context.

## Default Operating Loop

Use this loop by default:

```txt
Search -> Read Small Chunk -> Edit -> Run Focusable Test -> Summarize Result
```

Do not start by reading entire files or dumping full command outputs into context.

## Context Budget Rules

- Never read full files over 300 lines unless there is a specific reason.
- Search before reading.
- Read at most 100 lines at a time.
- Prefer diffs over full files.
- Show only failing tests.
- Summarize command outputs over 50 lines.
- Store full logs on disk and inspect only the useful tail.
- Keep architecture facts in docs instead of repeating them in prompts.
- Cache file summaries after first inspection.
- Ask for structured outputs when analyzing bugs or implementation options.

## Search Before Reading

Use fast search first:

```bash
rg "calculateFootprint"
rg "Recommendation"
rg "FootprintInput"
```

Then read only the matching section:

```bash
sed -n '120,200p' lib/carbon/calculate.ts
```

On PowerShell:

```powershell
Get-Content lib/carbon/calculate.ts | Select-Object -Skip 119 -First 80
```

## Use Diffs, Not Whole Files

For review or handoff, prefer:

```bash
git diff -- lib/carbon/calculate.ts
```

Avoid pasting a full 1000-line file when only a 20-line patch matters.

## Test Output Rules

Agents usually do not need hundreds of passing test lines.

Preferred commands:

```bash
pnpm test -- --reporter=dot
pnpm test -- --run tests/unit/calculate.test.ts --reporter=dot
pnpm exec playwright test tests/e2e/carbon-compass.spec.ts --reporter=line
```

If a command is noisy, write full output to a log file and print only a concise summary:

```bash
pnpm test -- --reporter=dot > .agent/logs/test.log 2>&1
tail -50 .agent/logs/test.log
```

PowerShell:

```powershell
pnpm test -- --reporter=dot *> .agent/logs/test.log
Get-Content .agent/logs/test.log -Tail 50
```

## Build Output Rules

Do not paste full build logs. Store full output and inspect the end:

```powershell
pnpm build *> .agent/logs/build.log
Get-Content .agent/logs/build.log -Tail 80
```

Most useful build errors are near the end of the log.

## Stack Trace Rules

Compress stack traces to the useful facts:

```txt
TypeError: Cannot read properties of undefined
Location: lib/carbon/recommendations.ts:42
Caller: app/api/recommendations/route.ts:18
Likely cause: validated input does not include foodWasteLevel
```

Do not paste dependency internals unless they are necessary.

## Conversation History Rules

When resuming work, summarize current status:

```txt
Current status:
- Carbon engine implemented
- Validation tests pass
- Dashboard E2E failing
- Current failure: top source text missing on dashboard
- Next file to inspect: components/carbon/DashboardSummary.tsx
```

Avoid replaying long conversations.

## Architecture Memory

Use these docs as source of truth:

- `PLAN.md`: implementation phases, issue map, acceptance criteria.
- `RULES.md`: engineering rules, stack, TypeScript, security, testing.
- `AI_RULES.md`: AI-agent token and workflow rules.
- `AI_PLAN.md`: AI-agent execution plan.

If architecture changes, update the docs instead of relying on chat history.

## File Summary Cache

After reading files, keep short summaries in `.agent/context/file-summaries.md`.

Example:

```md
- `lib/carbon/calculate.ts`: pure category calculations and total footprint output.
- `lib/validation/schemas.ts`: Zod schemas for profile and footprint input.
- `components/carbon/FootprintForm.tsx`: client form for calculator sections.
```

Do not commit `.agent/`.

## Structured Output Rules

When asked to analyze a bug, return:

```txt
1. Root cause
2. Files to edit
3. Exact patch plan
4. Tests to run
5. Risk level
```

When asked to implement, return:

```txt
1. Files changed
2. Behavior changed
3. Tests run
4. Known limitations
```

## Secret Handling Rules

- Never print `.env` contents.
- Never print API keys.
- Never commit `.env`, `key.md`, or logs.
- If a key is provided in `key.md`, move it into local `.env`, verify `.env` is ignored, then delete `key.md`.
- Commit only `.env.example` with empty placeholder variables.

## Shortcut Scripts

Use scripts in `scripts/` when available:

```powershell
.\scripts\ai-test.ps1
.\scripts\ai-quality.ps1
```

These scripts write full logs to `.agent/logs/` and print only concise pass/fail summaries plus useful failure tails.

## Final Rule

The agent should spend tokens on reasoning, patches, and failed evidence, not on repeated full-file reads or passing test noise.

