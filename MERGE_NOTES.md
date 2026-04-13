# MERGE_NOTES

## Context
Requested merge targets:
- Version A: PR #2 / `codex/create-coffee-habits-workshop-system-0hhxfg`
- Version B: PR #3 / `codex/create-coffee-habits-workshop-system-5ral1x`
- Version C: PR #4 / `codex/create-coffee-habits-workshop-system-aaxguk`

Observed repository state in this environment:
- Only one local branch exists initially: `work`
- Repository tree contains only `LICENSE`
- No remote configured initially
- `git fetch` from `https://github.com/leonvlegels/WorkshopGenerator.git` failed due network/proxy restriction (`CONNECT tunnel failed, response 403`)

Given the above, subsystem-by-subsystem code comparison was blocked.

| Subsystem | Winner version | Files/patterns used | Rewritten? | Why |
|-----------|----------------|--------------------|------------|-----|
| schema | N/A (blocked) | None accessible in environment | No | No A/B/C source branches were available locally and remote fetch failed (403). |
| seed data | N/A (blocked) | None accessible in environment | No | Could not inspect branch seed corpus content. |
| workshop generation flow | N/A (blocked) | None accessible in environment | No | Could not load any implementation files for flow comparison. |
| structure payload design | N/A (blocked) | None accessible in environment | No | Rich payload preservation could not be validated without source branches. |
| structure editing UX | N/A (blocked) | None accessible in environment | No | Interactive editor code unavailable. |
| artifact regeneration flow | N/A (blocked) | None accessible in environment | No | Regenerate-from-saved-structure behavior could not be audited. |
| curriculum editor | N/A (blocked) | None accessible in environment | No | No editor code present in local checkout. |
| review loop | N/A (blocked) | None accessible in environment | No | Persistence and reuse logic unavailable. |
| expansion workflow | N/A (blocked) | None accessible in environment | No | Expansion status/artifact workflow unavailable. |
| documentation | Current branch (this update) | `README.md`, `MERGE_NOTES.md`, `SELF_AUDIT.md` | Yes (new docs) | Added honest status documentation for current environment constraints. |
| validation/tests | N/A (blocked) | None accessible in environment | No | No application/test files exist in checkout. |

## What was taken from A
- Not possible to evaluate or take code due inaccessible branch content.

## What was taken from B
- Not possible to evaluate or take code due inaccessible branch content.

## What was taken from C
- Not possible to evaluate or take code due inaccessible branch content.

## What was rewritten instead of copied
- Created project status documentation (`README.md`, `MERGE_NOTES.md`, `SELF_AUDIT.md`) to truthfully reflect blocked merge conditions.

## Why these choices are better
- They prevent a fabricated “merge” without source evidence.
- They provide a clear, auditable record of the exact technical blocker and the commands used.
