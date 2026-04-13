import { prisma } from '@/lib/prisma';
import ExpansionBoard from '@/components/ExpansionBoard';

export default async function ExpansionPage() {
  const items = await prisma.expansionRequest.findMany({ orderBy: { created_at: 'desc' }, take: 50 });

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Expansion Workflow</h1>
      <p>Unknown topics move through request → research → draft knowledge → provisional module → review gates.</p>
      <ExpansionBoard items={items as any} />
    </main>
  );
}
