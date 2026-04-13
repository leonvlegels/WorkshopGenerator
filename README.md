# WorkshopGenerator (merge synthesis attempt)

## What works
- Repository scaffolding is present.
- Merge planning artifacts are included:
  - `MERGE_NOTES.md`
  - `SELF_AUDIT.md`

## How to run it
This repository currently does not contain application source code, package manifests, or runnable services.

## Known limitations
- The three implementation branches requested for synthesis were not available in this environment.
- A network fetch from GitHub failed with HTTP 403 (`CONNECT tunnel failed`), so the code from versions A/B/C could not be inspected.
- Because the source implementations were inaccessible, no functional merge of subsystems (schema, generation flow, editor UX, review loop, expansion workflow, etc.) could be completed.
