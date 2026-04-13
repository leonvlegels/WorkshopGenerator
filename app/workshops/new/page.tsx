import { prisma } from '@/lib/prisma';
import WorkshopForm from '@/components/WorkshopForm';

export default async function NewWorkshopPage() {
  const [templates, modules] = await Promise.all([
    prisma.workshopTemplate.findMany({
      select: { id: true, title: true, default_duration_min: true },
      orderBy: { title: 'asc' }
    }),
    prisma.moduleTemplate.findMany({
      where: { status: 'canonical' },
      select: { id: true, title: true, module_type: true, ideal_time_min: true },
      orderBy: { default_sequence_order: 'asc' }
    })
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Generate Workshop</h1>
      <p>Step A/B: choose template and generation inputs.</p>
      <WorkshopForm templates={templates} modules={modules} />
    </main>
  );
}
