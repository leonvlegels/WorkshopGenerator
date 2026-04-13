# Implementation Notes

## What changed in this iteration
- Moved to a stronger structure-first flow: generate workshop structure first, then generate/regenerate artifacts from that structure.
- Added per-module level targeting in workshop creation.
- Added editable structure workflow via `/workshops/[id]` + `PATCH /api/workshops/[id]/structure`.
- Added `POST /api/workshops/[id]/artifacts` to regenerate manual/slides without replacing structure.
- Expanded generation outputs with pacing/cut guidance, practical prompts, and explicit assumption logs.
- Added structured slide JSON generation with suggested visuals and required recap/Q&A.
- Added functional curriculum CRUD endpoint/page (minimal UI, create/delete flows).
- Expanded expansion workflow with progression route for draft knowledge + provisional modules + gate transitions.
- Seeded a richer starter corpus across history, extraction, espresso, grind trade-offs, milk, and workflow.

## Product gaps remaining
- Curriculum editor still lacks in-place update/edit forms for all entities.
- Structure editor is raw JSON; a drag-and-drop/field-based editor should replace it.
- Slide/manual rendering quality is template-driven and not yet model-assisted.
- Feedback incorporation is basic (scoped notes are read, but weighting/relevance logic is simple).
- Expansion ingest into canonical knowledge is still manual and not guided by a dedicated approval UI.

## What to build next
1. Replace JSON textarea editor with typed per-module controls (reorder, lock, retime, level).
2. Add update/edit forms and validation constraints for all curriculum entities.
3. Add automated tests around generation contracts and expansion gates.
4. Add explicit exemplar selection/usage in generation retrieval.
5. Add migration files and stricter schema constraints for artifact typing/status transitions.
