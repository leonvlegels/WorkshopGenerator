# Coffee Habits Workshop System (v1, local-first)

This is a single-user local-first web app scaffold for internal curriculum editing and workshop generation.

## What is implemented

### Structure-first workflow
- Select workshop template and constraints.
- Select modules with per-module level targeting (`beginner`, `intermediate`, `advanced`, `professional`).
- Generate an initial workshop structure first.
- Edit structure JSON (order/timing/level/module points) before output generation.
- Regenerate manual + slide artifacts from the edited structure without replacing the structure.

### Curriculum editor (functional CRUD, minimal UI)
`/curriculum` provides basic create/delete forms and listings for:
- topics
- sources
- claims
- canonical entries
- teaching views
- module templates
- workshop templates
- feedback notes

### Generation layer
- Manual generation now outputs an outline with:
  - goal
  - setup/prep
  - timing blocks
  - must-cover / optional points
  - if-late / if-extra-time guidance
  - practical exercise prompts
  - recap + Q&A
  - explicit assumption/ambiguity log
- Slide generation now outputs structured slide JSON with:
  - title/recap/Q&A slides
  - per-module slides
  - suggested visuals/diagrams
  - phase-sensitive density (slide-heavy vs hands-on)

### Review loop and feedback reuse
- Reviews create `ReviewEvent` records.
- Workshop review updates workshop/artifact status.
- Review notes are also persisted as scoped feedback notes (`artifact_type`) for future generations.

### Expansion workflow
`/expansion` supports:
- expansion request creation
- research brief creation (from `/api/expansion`)
- draft knowledge entry creation
- provisional module creation with warning label
- approval stage transitions (`approved_for_ingest`, `completed`)

### Export
- Manual DOCX download endpoint.
- Workshop JSON export endpoint.

## Tech stack
- Next.js App Router
- TypeScript
- Prisma ORM
- SQLite

## Run locally
```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Known limitations
- Structure editing is currently JSON-based (functional but not friendly UI controls yet).
- Curriculum CRUD currently supports create/delete; update forms are not yet implemented.
- Generation is deterministic/templated and does not yet call an external LLM service.
- No auth/multi-user permissions (intentionally out of scope for v1).
- No automated end-to-end tests yet.
