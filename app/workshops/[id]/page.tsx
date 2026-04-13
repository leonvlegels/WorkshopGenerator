import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StructureEditor from '@/components/StructureEditor';

export default async function WorkshopDetail({ params }: { params: { id: string } }) {
  const workshop = await prisma.workshopStructure.findUnique({
    where: { id: params.id },
    include: {
      manuals: { orderBy: { id: 'desc' }, take: 1 },
      slides: { orderBy: { id: 'desc' }, take: 1 },
      workshopTemplate: true
    }
  });

  if (!workshop) return notFound();

  const sequence = workshop.generated_sequence_json as {
    modules: Array<Record<string, unknown>>;
    cut_order: string[];
  };

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1>{workshop.title}</h1>
      <p>
        Template: {workshop.workshopTemplate.title} · Duration: {workshop.total_duration_min} min · State: {workshop.review_state}
      </p>

      <h2>1) Edit workshop structure</h2>
      <StructureEditor workshopId={workshop.id} initialSequence={sequence as any} />

      <h2>2) Teacher manual</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12 }}>{workshop.manuals[0]?.markdown_body || 'Generate artifacts to see manual.'}</pre>
      {workshop.manuals[0] && (
        <p>
          <a href={`/api/manuals/${workshop.manuals[0].id}/docx`}>Download DOCX</a>
        </p>
      )}

      <h2>3) Slide deck preview</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12 }}>{workshop.slides[0]?.preview_markdown || 'Generate artifacts to see slides.'}</pre>

      <p>
        <a href={`/api/workshops/${workshop.id}/export`}>Export workshop JSON</a>
      </p>

      <h2>4) Review output</h2>
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
