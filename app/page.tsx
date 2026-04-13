import { WorkshopGeneratorForm } from '@/components/workshop-generator-form';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const template = await prisma.workshopTemplate.findFirst({ where: { slug: 'espresso-foundations-beginner' } });

  if (!template) {
    return <div className="card">No seeded workshop template found. Run <code>npm run db:seed</code>.</div>;
  }

  const links = await prisma.workshopTemplateModule.findMany({
    where: { workshopTemplateId: template.id },
    include: { moduleTemplate: true },
    orderBy: { sequenceOrder: 'asc' }
  });

  const modules = links.map((l) => l.moduleTemplate);

  return <WorkshopGeneratorForm template={template} modules={modules} />;
}
