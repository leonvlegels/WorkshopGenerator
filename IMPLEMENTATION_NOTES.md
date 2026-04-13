# Implementation Notes

## What changed
- Upgraded generation flow to support module-level audience targeting and module subset selection.
- Added editable structure workflow with save + regenerate artifact endpoints.
- Improved manual and slide generation helpers to produce more structured outputs and explicit assumption logs.
- Added minimal CRUD mutation endpoint and UI for core curriculum entities.
- Expanded unknown-topic pipeline with actions for draft knowledge and provisional modules.
- Reworked seed data to include broader starter corpus, multiple workshops, source + claim metadata, and trade-off-oriented entries.
- Added a small validation script (`npm run validate:contract`) to check key workflow hooks.

## Requirement review

### Fully done
- Structure-first generation with editable structure before artifact regeneration.
- Per-module audience level targeting.
- Typed reusable module composition with pacing metadata usage.
- Minimal but functional CRUD path for required curriculum entities.
- More structured manual generation including pacing/cut/extra-time guidance and assumptions.
- More concrete slide JSON including visuals + recap + Q&A.
- Review persistence and generation-time scoped feedback retrieval.
- Expansion workflow beyond research brief (draft knowledge + provisional module + status gates).
- Richer seed corpus with multiple topics/modules/workshops and source-backed claims.

### Partially done
- Curriculum editor UX is basic and not yet production-friendly.
- Feedback influence is implemented but still rule-based (no advanced ranking or retrieval heuristics).
- Expansion workflow ingest gate exists but no automated canonical-ingest wizard yet.

### Not done
- External LLM integration and model orchestration layer.
- Automated test suite against live DB/API routes (environment package restrictions prevented full test run).

## Recommended next builds
1. Add proper form-driven edit pages per entity (instead of quick action buttons).
2. Add DB-backed integration tests (Vitest or Playwright API tests).
3. Add revision history/versioning for canonical entries and module templates.
4. Add explicit exemplar browser and generation-time exemplar retrieval weighting.
5. Add import/export utilities for canonical bundles and workshop packages.
