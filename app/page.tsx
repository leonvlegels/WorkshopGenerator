import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const templates = await prisma.workshopTemplate.findMany({ orderBy: { title: 'asc' } });

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Coffee Habits Workshop System</h1>
      <p>Local-first curriculum editor and workshop generator.</p>
      <Link href="/workshops/new">Create workshop from template</Link>
      <h2>Templates</h2>
      <ul>
        {templates.map((template) => (
          <li key={template.id}>
            <strong>{template.title}</strong> ({template.default_duration_min} min)
          </li>
        ))}
      </ul>
    </main>
  );
}
