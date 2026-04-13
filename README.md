# Coffee Habits Workshop System (v1, improved scaffold)

Local-first single-user internal curriculum editor built with Next.js + Prisma + SQLite.

## What is implemented

### Structure-first workflow
- Generate a **WorkshopStructure first** from a selected template and selected module set.
- Per-module audience levels are supported in generation input.
- Workshop structure is editable (reorder, retime, phase, lock, level) via `/workshops/[id]`.
- Manual + slide artifacts can be regenerated from the edited structure without replacing the structure.

### Curriculum editor (minimal CRUD)
- `/curriculum` provides basic mutation actions for:
  - topics
  - sources
  - claims
  - canonical entries
  - teaching views
  - module templates
  - workshop templates
  - feedback notes
- UI is intentionally simple and functional.

### Generation outputs
- Manual generator creates outline-oriented content with:
  - title, goal, duration, setup, timing blocks
  - per-module must-cover / optional / pacing guidance
  - recap + final Q&A
  - operator-facing assumption log
- Slide generator emits structured slide JSON with:
  - title slide
  - module slides
  - recap slide
  - final Q&A slide
  - suggested visuals

### Review + feedback loop
- Review events captured with outcome + scores.
- Review updates workshop review state.
- Active scoped feedback notes (global/template/module/artifact type) are read during generation.

### Expansion workflow
- `/expansion` + API supports explicit stages:
  - expansion request
  - research brief
  - draft knowledge entry
  - provisional module
  - approval-for-ingest status gate

### Export
- Workshop JSON export endpoint.
- Manual DOCX download endpoint.

## Setup
```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Useful commands
```bash
npm run check
npm run validate:contract
```

## Known limitations
- CRUD UI is intentionally lightweight and not yet ergonomic for large-scale editing.
- No authentication/multi-user support (out of scope for local-first v1).
- Manual/slide generation is deterministic template logic (no external LLM integration yet).
- No polished visual design system.
