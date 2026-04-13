import { prisma } from '@/lib/prisma';
import CurriculumEditorClient from '@/components/CurriculumEditorClient';

export default async function CurriculumPage() {
  const [topics, claims, sources, canonicalEntries, teachingViews, moduleTemplates, workshopTemplates, feedbackNotes] = await Promise.all([
    prisma.topic.findMany({ orderBy: { slug: 'asc' }, take: 50 }),
    prisma.claim.findMany({ orderBy: { id: 'desc' }, take: 50 }),
    prisma.source.findMany({ orderBy: { id: 'desc' }, take: 50 }),
    prisma.canonicalEntry.findMany({ orderBy: { id: 'desc' }, take: 50 }),
    prisma.teachingView.findMany({ orderBy: { id: 'desc' }, take: 50 }),
    prisma.moduleTemplate.findMany({ orderBy: { default_sequence_order: 'asc' }, take: 50 }),
    prisma.workshopTemplate.findMany({ orderBy: { title: 'asc' }, take: 50 }),
    prisma.feedbackNote.findMany({ orderBy: { priority: 'asc' }, take: 50 })
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Curriculum Editor (CRUD)</h1>
      <p>Simple functional CRUD editor for canonical curriculum data. Edit inline, create via JSON templates, delete rows.</p>
      <CurriculumEditorClient
        topics={topics as any}
        claims={claims as any}
        sources={sources as any}
        canonicalEntries={canonicalEntries as any}
        teachingViews={teachingViews as any}
        moduleTemplates={moduleTemplates as any}
        workshopTemplates={workshopTemplates as any}
        feedbackNotes={feedbackNotes as any}
        firstTopicId={topics[0]?.id ?? ''}
        firstSourceId={sources[0]?.id ?? ''}
      />
    </main>
  );
}
