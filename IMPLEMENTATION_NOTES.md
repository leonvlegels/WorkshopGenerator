# Implementation Notes

## What changed in this iteration
1. Shifted generation flow to structure-first:
   - `/api/generate` creates `WorkshopStructure` only.
   - `/api/workshops/[id]/structure` persists edits.
   - `/api/workshops/[id]/artifacts` regenerates manual + slides from edited structure.
2. Added per-module audience level targeting in workshop form and stored levels inside generated sequence.
3. Upgraded generation helpers to produce richer manuals/slides with pacing controls and assumption logs.
4. Added practical curriculum CRUD through `/curriculum` + `/api/curriculum` for core entities.
5. Added expansion progression route `/api/expansion/[id]/advance` to create draft knowledge + provisional module and move status.
6. Improved review feedback loop: non-approve reviews create reusable feedback notes.
7. Expanded seed corpus to include multiple canonical topics/modules/workshops and richer source/claim mapping.

## Requirement status review

### Fully done
- Structure-first generation with separate artifact regeneration.
- Meaningful structure editing before artifact generation.
- Per-module level targeting (mixed levels in one workshop).
- Manual generation includes pacing/cut/extra-time guidance and assumptions.
- Slide artifact structured JSON includes title/content/recap/Q&A + visual suggestions.
- Review data persisted and re-used via scoped feedback notes.
- Expansion workflow goes beyond research brief (adds draft knowledge + provisional module + gate status).
- Seed is materially richer than initial scaffold.

### Partially done
- Curriculum editor CRUD is functional but intentionally rough:
  - create via JSON template
  - inline text updates on one key field per entity
  - delete supported
  - not all fields have dedicated form controls.
- Validation/tests: no executable tests run in this environment due dependency installation restrictions.

### Not done yet / suggested next steps
- Add robust form-level validation and friendlier editors per entity field.
- Add optimistic ordering/reordering UI for module sequence drag-and-drop.
- Add explicit exemplar promotion UX + approval gate for candidate canonical updates.
- Add migration files and CI test pipeline once package install is available.
