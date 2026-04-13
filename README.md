# Coffee Habits Workshop System (v1, improved scaffold)

Local-first, single-user curriculum editor and workshop generator.

## Stack
- Next.js App Router + TypeScript
- Prisma ORM + SQLite
- Structured canonical knowledge base first, generation second

## What is implemented now

### 1) Structure-first workshop flow
- Choose workshop template + constraints + per-module level targets.
- Generate **workshop structure first** (no artifact generation in this step).
- Edit structure in workshop detail page (enable/disable modules, change times, lock modules, adjust levels).
- Regenerate manual + slides from edited structure without discarding structure.

### 2) Per-module level targeting
- Module selection includes audience level per module:
  - beginner
  - intermediate
  - advanced
  - professional

### 3) Module composition
- Structure generation uses module metadata including:
  - min/ideal/expandable time
  - cut priority
  - must-cover/optional points
  - if-running-late / if-extra-time guidance
  - workshop phase (slide-heavy / hands-on / recap)

### 4) Curriculum editor CRUD (functional, intentionally simple)
- `/curriculum` now supports create/update/delete for:
  - topics
  - claims
  - sources
  - canonical entries
  - teaching views
  - module templates
  - workshop templates
  - feedback notes

### 5) Better manual generation
- Generated manual includes:
  - title + goal
  - total duration
  - setup/prep
  - timing blocks
  - module must-cover points
  - optional/cuttable points
  - if-late / if-extra-time guidance
  - practical exercise moments
  - recap + final Q&A
  - assumption/ambiguity log

### 6) Better slide generation
- Slide artifact JSON now contains explicit slide objects with:
  - title slide
  - content slides per module
  - recap slide
  - final Q&A slide
  - suggested visuals per slide
  - tone/density hints

### 7) Review + feedback loop
- Reviews are stored with outcome + 3 scoring dimensions.
- Non-approve review notes can create reusable feedback notes.
- Generation reads scoped active feedback (global, topic, module, template, artifact type).

### 8) Expansion workflow improvements
- Expansion request route creates request + research brief.
- Expansion advance route creates:
  - draft knowledge entry
  - provisional module
  - status progression to awaiting review

### 9) Seed data upgraded
Seed includes a small but real starter corpus:
- coffee history/specialty context
- extraction fundamentals
- espresso fundamentals
- grind/flow/taste trade-offs
- milk basics
- workflow/professionalism
- two workshop templates
- source + claim + claim-source links

## Run locally
```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Known limitations (honest)
- CRUD editor is functional but raw (JSON templates, minimal validation UX).
- No auth/multi-user features (intentionally out of scope).
- No automated migration files committed yet (schema + seed are present).
- Generation heuristics are deterministic utilities, not full LLM orchestration.
- No polished slide renderer yet; slide artifact is structured JSON + markdown preview.
