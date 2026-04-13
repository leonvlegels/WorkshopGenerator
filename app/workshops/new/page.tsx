import { prisma } from '@/lib/prisma';
import WorkshopForm from '@/components/WorkshopForm';

export default async function NewWorkshopPage() {
  const templates = await prisma.workshopTemplate.findMany({
    select: { id: true, title: true, default_duration_min: true },
    orderBy: { title: 'asc' }
  });

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Generate Workshop</h1>
      <p>Step A/B: choose template and generation inputs.</p>
      <WorkshopForm templates={templates} />
    </main>
  );
}
