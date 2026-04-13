# Coffee Habits Workshop System (v1 scaffold)

Local-first Next.js + Prisma + SQLite app for editing curriculum context and generating:
- workshop structure JSON
- teacher manual markdown
- slide preview markdown

## Quick start

```bash
cp .env.example .env
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000.

## Included v1 capabilities

- Canonical schema covering sources, claims, topics, canonical entries, teaching views, module/workshop templates, artifacts, review events, feedback, and expansion workflow.
- Seed data for core coffee topics and one full 120-minute workshop template.
- Workflow form for workshop context input and generation.
- Generation endpoint that persists workshop structure + manual + slides with assumption logs.
- DOCX export endpoint for manual artifacts.

## Notes

- Generated artifacts remain draft and require human review to become exemplars.
- Canonical knowledge is not auto-updated from generated outputs.
