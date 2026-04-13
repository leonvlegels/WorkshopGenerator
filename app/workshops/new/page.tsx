import { prisma } from '@/lib/prisma';
import WorkshopForm from '@/components/WorkshopForm';

export default async function NewWorkshopPage() {
  const [templates, modules] = await Promise.all([
    prisma.workshopTemplate.findMany({
      select: { id: true, title: true, default_duration_min: true, module_sequence: true },
      orderBy: { title: 'asc' }
    }),
    prisma.moduleTemplate.findMany({
      select: { id: true, title: true, module_type: true, topic_id: true, suitable_levels: true },
      orderBy: { default_sequence_order: 'asc' }
    })
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Generate Workshop Structure</h1>
      <p>Step A/B/C: choose template, tune constraints, select module levels, and generate structure first.</p>
      <WorkshopForm templates={templates as any} modules={modules as any} />
    </main>
  );
}
