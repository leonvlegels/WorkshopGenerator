import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function WorkshopDetail({ params }: { params: { id: string } }) {
  const workshop = await prisma.workshopStructure.findUnique({
    where: { id: params.id },
    include: { manuals: true, slides: true, workshopTemplate: true }
  });

  if (!workshop) return notFound();

  const sequence = workshop.generated_sequence_json as {
    modules: Array<{ module_title: string; planned_time_min: number; module_type: string }>;
    cut_order: string[];
  };

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>{workshop.title}</h1>
      <p>Template: {workshop.workshopTemplate.title}</p>
      <p>Total duration: {workshop.total_duration_min} min</p>
      <h2>Generated module sequence</h2>
      <ol>
        {sequence.modules.map((m, idx) => (
          <li key={`${m.module_title}-${idx}`}>
            {m.module_title} ({m.module_type}, {m.planned_time_min} min)
          </li>
        ))}
      </ol>
      <h2>Manual artifact</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12 }}>{workshop.manuals[0]?.markdown_body}</pre>
      {workshop.manuals[0] && (
        <p>
          <a href={`/api/manuals/${workshop.manuals[0].id}/docx`}>Download DOCX</a>
        </p>
      )}
      <h2>Slides preview</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12 }}>{workshop.slides[0]?.preview_markdown}</pre>
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
