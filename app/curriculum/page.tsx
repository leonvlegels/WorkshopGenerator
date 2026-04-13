import { prisma } from '@/lib/prisma';
import CurriculumEditor from '@/components/CurriculumEditor';

export default async function CurriculumPage() {
  const [topics, sources, claims, canonicalEntries, teachingViews, modules, templates, feedback] = await Promise.all([
    prisma.topic.findMany({ orderBy: { slug: 'asc' } }),
    prisma.source.findMany({ orderBy: { title: 'asc' } }),
    prisma.claim.findMany({ orderBy: { id: 'desc' }, take: 20 }),
    prisma.canonicalEntry.findMany({ orderBy: { id: 'desc' }, take: 20 }),
    prisma.teachingView.findMany({ orderBy: { id: 'desc' }, take: 20 }),
    prisma.moduleTemplate.findMany({ orderBy: { default_sequence_order: 'asc' } }),
    prisma.workshopTemplate.findMany({ orderBy: { title: 'asc' } }),
    prisma.feedbackNote.findMany({ orderBy: { priority: 'asc' } })
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1>Curriculum Editor</h1>
      <p>Minimal functional CRUD for canonical system entities.</p>
      <CurriculumEditor pack={{ topics, sources, claims, canonicalEntries, teachingViews, modules, templates, feedback }} />
    </main>
  );
}
