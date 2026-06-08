# AI Agent Efficiency Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep future AI coding work on Carbon Compass fast, focused, low-token, and still rigorous.

**Architecture:** AI agents should rely on repo documentation for stable context, use search before reads, store long command output in local ignored logs, and inspect only focused file chunks. Scripts in `scripts/` provide shortcuts for tests and quality gates with concise terminal output.

**Tech Stack:** PowerShell helper scripts, pnpm, Vitest dot reporter, Playwright line reporter, local `.agent/` logs, `.env.example` for documented local secrets.

---

## Task 1: Context Entry

**Files:**
- Read: `PLAN.md`
- Read: `RULES.md`
- Read: `AI_RULES.md`

- [ ] Read only the top sections of the docs first.
- [ ] Identify the active GitHub issue and phase.
- [ ] Search for relevant symbols before opening files.
- [ ] Create or update `.agent/context/file-summaries.md` with short file summaries after inspection.

Expected status summary:

```txt
Current issue: #<number>
Phase: <phase>
Relevant docs read: PLAN.md, RULES.md, AI_RULES.md
Relevant files found by search: <files>
Next action: <test/edit/run>
```

## Task 2: Focused Investigation

**Files:**
- Read only targeted chunks of source files.
- Store long outputs under `.agent/logs/`.

- [ ] Run `rg` for the symbol, route, component, test name, or error string.
- [ ] Read only the matching 50-100 line chunk.
- [ ] If more context is needed, read the nearest imports/types and the direct caller.
- [ ] Summarize what each inspected file does.

Preferred commands:

```powershell
rg "calculateFootprint"
Get-Content lib/carbon/calculate.ts | Select-Object -Skip 0 -First 100
git diff -- lib/carbon/calculate.ts
```

## Task 3: Focused Testing

**Files:**
- Use: `scripts/ai-test.ps1`
- Output: `.agent/logs/test-*.log`

- [ ] Run the narrowest useful unit test first.
- [ ] Use dot or line reporters.
- [ ] Print only pass/fail and the last useful failure lines.
- [ ] Read full logs only when the tail is insufficient.

Example:

```powershell
.\scripts\ai-test.ps1 -Filter "tests/unit/calculate.test.ts"
```

Expected successful output:

```txt
PASS tests completed
Log: .agent/logs/test-YYYYMMDD-HHMMSS.log
```

Expected failing output:

```txt
FAIL tests failed
Log: .agent/logs/test-YYYYMMDD-HHMMSS.log
Last 80 lines:
<failure tail>
```

## Task 4: Focused Quality Gate

**Files:**
- Use: `scripts/ai-quality.ps1`
- Output: `.agent/logs/quality-*.log`

- [ ] Run quality checks after a meaningful implementation slice.
- [ ] Stop on the first failing command.
- [ ] Print only the command name, status, log path, and failure tail.
- [ ] Fix failures before continuing.

Example:

```powershell
.\scripts\ai-quality.ps1
```

Quality order:

```txt
pnpm typecheck
pnpm lint
pnpm test -- --reporter=dot
pnpm build
```

Run Playwright separately when UI flows changed:

```powershell
pnpm test:e2e -- --reporter=line
```

## Task 5: Patch Discipline

**Files:**
- Edit only files required for the current issue.

- [ ] Prefer small patches over broad rewrites.
- [ ] Keep business logic out of React components.
- [ ] Add tests close to the changed logic.
- [ ] Use `git diff --stat` and `git diff -- <file>` before committing.
- [ ] Do not stage unrelated files.

Commit pattern:

```bash
git add <specific-files>
git commit -m "feat(scope): concise change"
```

## Task 6: Handoff Summary

**Files:**
- Update docs only if behavior, architecture, or setup changed.

- [ ] Summarize files changed.
- [ ] Summarize tests run.
- [ ] Include failing evidence only if unresolved.
- [ ] Include next issue or next exact action.
- [ ] Avoid dumping logs or full diffs into the final response.

Final summary shape:

```txt
Changed:
- <file>: <purpose>

Validation:
- PASS <command>
- FAIL <command>: <reason and log path>

Next:
- <issue or exact follow-up>
```

