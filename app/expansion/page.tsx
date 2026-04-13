import { prisma } from '@/lib/prisma';

export default async function ExpansionPage() {
  const [requests, drafts, provisional] = await Promise.all([
    prisma.expansionRequest.findMany({ orderBy: { created_at: 'desc' } }),
    prisma.draftKnowledgeEntry.findMany({ orderBy: { id: 'desc' } }),
    prisma.provisionalModule.findMany({ orderBy: { id: 'desc' } })
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 16 }}>
      <h1>Expansion Workflow</h1>
      <p>Unknown topics move through request → draft knowledge → provisional module → approval gates.</p>

      <form action="/api/expansion" method="post" style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
        <input name="requestedTopicText" placeholder="Requested topic" required />
        <input name="requestedBy" placeholder="Requested by" defaultValue="operator" required />
        <textarea name="contextNotes" placeholder="Context notes" required />
        <button type="submit">Create expansion request</button>
      </form>

      <h2>Requests</h2>
      <ul>
        {requests.map((r) => (
          <li key={r.id}>
            <strong>{r.requested_topic_text}</strong> — {r.status}
            <form action={`/api/expansion/${r.id}/advance`} method="post" style={{ display: 'inline', marginLeft: 8 }}>
              <button name="stage" value="draft_knowledge" type="submit">Create draft knowledge</button>
              <button name="stage" value="provisional_module" type="submit">Create provisional module</button>
              <button name="stage" value="approve_for_ingest" type="submit">Approve for ingest</button>
              <button name="stage" value="complete" type="submit">Mark completed</button>
            </form>
          </li>
        ))}
      </ul>

      <h2>Draft knowledge entries</h2>
      <ul>{drafts.map((d) => <li key={d.id}>{d.topic_slug_proposal} — {d.status}</li>)}</ul>

      <h2>Provisional modules</h2>
      <ul>{provisional.map((p) => <li key={p.id}>{p.warning_label} — {p.status}</li>)}</ul>
    </main>
  );
}
