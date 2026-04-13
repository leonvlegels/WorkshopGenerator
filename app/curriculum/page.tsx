import { prisma } from '@/lib/prisma';

export default async function CurriculumPage() {
  const [topics, modules, entries] = await Promise.all([
    prisma.topic.findMany({ orderBy: { slug: 'asc' } }),
    prisma.moduleTemplate.findMany({ orderBy: { default_sequence_order: 'asc' }, include: { topic: true } }),
    prisma.canonicalEntry.findMany({ orderBy: { approved_at: 'desc' }, include: { topic: true } })
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Curriculum Editor</h1>
      <p>Review and maintain topics, canonical entries, and module templates.</p>

      <h2>Topics</h2>
      <ul>
        {topics.map((topic) => (
          <li key={topic.id}>
            <strong>{topic.display_name}</strong> ({topic.slug}) — {topic.brew_method}/{topic.equipment_context}
          </li>
        ))}
      </ul>

      <h2>Canonical entries</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.topic.display_name}</strong> v{entry.version} {entry.approved_at ? '✅ approved' : '⚠️ draft'}
          </li>
        ))}
      </ul>

      <h2>Module templates</h2>
      <ul>
        {modules.map((module) => (
          <li key={module.id}>
            {module.default_sequence_order}. {module.title} ({module.module_type}) — {module.topic.display_name}
          </li>
        ))}
      </ul>
    </main>
  );
}
