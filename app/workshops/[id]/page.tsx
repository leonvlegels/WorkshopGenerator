import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StructureEditor from '@/components/StructureEditor';

export default async function WorkshopDetail({ params }: { params: { id: string } }) {
  const workshop = await prisma.workshopStructure.findUnique({
    where: { id: params.id },
    include: { manuals: { orderBy: { id: 'desc' } }, slides: { orderBy: { id: 'desc' } }, workshopTemplate: true }
  });

  if (!workshop) return notFound();

  const sequence = workshop.generated_sequence_json as {
    modules: Array<{ module_title: string; planned_time_min: number; module_type: string; level: string }>;
    cut_order: string[];
    pacing_summary?: { planned_total: number; requested_total: number };
  };

  return (
    <main style={{ padding: 24, maxWidth: 1080, margin: '0 auto' }}>
      <h1>{workshop.title}</h1>
      <p>
        Template: {workshop.workshopTemplate.title} · Duration: {workshop.total_duration_min} min · State: {workshop.review_state}
      </p>

      <h2>1) Editable structure</h2>
      <StructureEditor workshopId={workshop.id} initial={sequence} />

      <h2>2) Generate artifacts from current structure</h2>
      <form action={`/api/workshops/${workshop.id}/artifacts`} method="post">
        <button type="submit">Generate / regenerate manual + slides</button>
      </form>

      <h2>Current module sequence</h2>
      <ol>
        {sequence.modules.map((m, idx) => (
          <li key={`${m.module_title}-${idx}`}>
            {m.module_title} ({m.module_type}, {m.level}, {m.planned_time_min} min)
          </li>
        ))}
      </ol>

      <h2>Latest manual artifact</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12 }}>{workshop.manuals[0]?.markdown_body ?? 'No manual yet.'}</pre>
      {workshop.manuals[0] && (
        <p>
          <a href={`/api/manuals/${workshop.manuals[0].id}/docx`}>Download DOCX</a>
        </p>
      )}

      <h2>Latest slides preview</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12 }}>{workshop.slides[0]?.preview_markdown ?? 'No slides yet.'}</pre>
      <p>
        <a href={`/api/workshops/${workshop.id}/export`}>Export workshop JSON</a>
      </p>

      <h2>Review action</h2>
      <form action="/api/review" method="post" style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input type="hidden" name="artifactType" value="workshop_structure" />
        <input type="hidden" name="artifactId" value={workshop.id} />
        <label>
          Outcome
          <select name="outcome" defaultValue="approve_with_edits">
            <option value="approve">Approve</option>
            <option value="approve_with_edits">Approve with edits</option>
            <option value="reject">Reject</option>
          </select>
        </label>
        <input name="accuracy" type="number" min={1} max={5} placeholder="Accuracy 1-5" required />
        <input name="depth" type="number" min={1} max={5} placeholder="Depth 1-5" required />
        <input name="usefulness" type="number" min={1} max={5} placeholder="Usefulness 1-5" required />
        <textarea name="notes" placeholder="Operator notes" required />
        <button type="submit">Submit review</button>
      </form>
    </main>
  );
}
