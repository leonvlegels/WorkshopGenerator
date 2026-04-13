import { prisma } from '@/lib/prisma';
import WorkshopForm from '@/components/WorkshopForm';

export default async function NewWorkshopPage() {
  const [templates, modules] = await Promise.all([
    prisma.workshopTemplate.findMany({
      select: { id: true, title: true, default_duration_min: true },
      orderBy: { title: 'asc' }
    }),
    prisma.moduleTemplate.findMany({
      select: { id: true, title: true, module_type: true, topic_id: true, suitable_levels: true, default_sequence_order: true },
      include: { topic: { select: { display_name: true } } },
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
