import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const templates = await prisma.workshopTemplate.findMany({ orderBy: { title: 'asc' } });
  const structures = await prisma.workshopStructure.findMany({ orderBy: { updated_at: 'desc' }, take: 10 });

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Coffee Habits Workshop System</h1>
      <p>Local-first curriculum editor and workshop generator.</p>
      <p>
        <Link href="/workshops/new">Create workshop from template</Link> · <Link href="/curriculum">Curriculum editor</Link> ·{' '}
        <Link href="/expansion">Expansion workflow</Link>
      </p>
      <h2>Templates</h2>
      <ul>
        {templates.map((template) => (
          <li key={template.id}>
            <strong>{template.title}</strong> ({template.default_duration_min} min)
          </li>
        ))}
      </ul>
      <h2>Recent workshop structures</h2>
      <ul>
        {structures.map((w) => (
          <li key={w.id}>
            <Link href={`/workshops/${w.id}`}>{w.title}</Link> ({w.total_duration_min} min, {w.review_state})
          </li>
        ))}
      </ul>
    </main>
  );
}
