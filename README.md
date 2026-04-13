# Coffee Habits Workshop System (v1 scaffold)

Local-first Next.js + Prisma + SQLite app for editing curriculum and generating workshop structures, manuals, and slide previews.

## Stack
- Next.js App Router
- TypeScript
- Prisma ORM + SQLite

## Setup
```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Implemented v1 flows
- Workshop template selection and generation input form.
- Structure-first generation contract.
- Manual and slide artifact generation from approved canonical sources.
- Assumption logging persisted on each artifact.
- Review event capture with outcome and scoring.
- Expansion request endpoint that creates a research brief.

## Notes
- This scaffold is intentionally conservative and retrieval-first.
- Generated content does not auto-promote to canonical truth.
