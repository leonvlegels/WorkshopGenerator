import { prisma } from '@/lib/prisma';

export default async function ExpansionPage() {
  const requests = await prisma.expansionRequest.findMany({
    orderBy: { created_at: 'desc' },
    include: { researchBrief: true, draftEntries: true, provisionalModules: true }
  });

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Expansion Workflow</h1>
      <p>Unknown topics progress through explicit non-canonical gates.</p>
      {requests.map((r) => (
        <section key={r.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 12 }}>
          <h3>{r.requested_topic_text}</h3>
          <p>Status: {r.status}</p>
          <p>Research briefs: {r.researchBrief.length}</p>
          <p>Draft knowledge entries: {r.draftEntries.length}</p>
          <p>Provisional modules: {r.provisionalModules.length}</p>
          <form action="/api/expansion/manage" method="post" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="hidden" name="expansionRequestId" value={r.id} />
            <button name="action" value="to_researching">Mark researching</button>
            <button name="action" value="create_draft_knowledge">Create draft knowledge</button>
            <button name="action" value="create_provisional_module">Create provisional module</button>
            <button name="action" value="approve_for_ingest">Approve for ingest</button>
          </form>
        </section>
      ))}
    </main>
  );
}
