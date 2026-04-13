import { prisma } from '@/lib/prisma';

export default async function CurriculumPage() {
  const [topics, sources, claims, canonicals, views, modules, templates, feedback] = await Promise.all([
    prisma.topic.findMany({ orderBy: { slug: 'asc' } }),
    prisma.source.findMany({ orderBy: { title: 'asc' } }),
    prisma.claim.findMany({ orderBy: { id: 'desc' }, include: { topic: true } }),
    prisma.canonicalEntry.findMany({ orderBy: { id: 'desc' }, include: { topic: true } }),
    prisma.teachingView.findMany({ orderBy: { id: 'desc' }, include: { topic: true } }),
    prisma.moduleTemplate.findMany({ orderBy: { default_sequence_order: 'asc' }, include: { topic: true } }),
    prisma.workshopTemplate.findMany({ orderBy: { title: 'asc' } }),
    prisma.feedbackNote.findMany({ orderBy: { priority: 'asc' } })
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 20 }}>
      <h1>Curriculum Editor (functional CRUD, minimal UI)</h1>

      <section>
        <h2>Topics</h2>
        <form action="/api/curriculum" method="post" style={{ display: 'grid', gap: 8, maxWidth: 540 }}>
          <input type="hidden" name="entity" value="topic" />
          <input name="slug" placeholder="slug" required />
          <input name="display_name" placeholder="display name" required />
          <input name="brew_method" placeholder="brew method" required />
          <input name="equipment_context" placeholder="equipment context" required />
          <button type="submit">Create topic</button>
        </form>
        <ul>
          {topics.map((x) => (
            <li key={x.id}>
              {x.display_name} ({x.slug})
              <form action="/api/curriculum" method="post" style={{ display: 'inline' }}>
                <input type="hidden" name="entity" value="topic" />
                <input type="hidden" name="action" value="delete" />
                <input type="hidden" name="id" value={x.id} />
                <button type="submit">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Sources</h2>
        <form action="/api/curriculum" method="post" style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
          <input type="hidden" name="entity" value="source" />
          <input name="title" placeholder="title" required />
          <select name="source_type" defaultValue="official_doc">
            <option value="official_doc">official_doc</option><option value="standards_body">standards_body</option><option value="educator">educator</option><option value="publisher">publisher</option><option value="forum">forum</option><option value="internal_doc">internal_doc</option>
          </select>
          <input name="author_or_org" placeholder="author/org" required />
          <input name="citation_text" placeholder="citation text" required />
          <input name="url_or_local_ref" placeholder="url or ref" required />
          <select name="source_quality_tier" defaultValue="B"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select>
          <button type="submit">Create source</button>
        </form>
        <ul>{sources.map((s) => <li key={s.id}>{s.title} ({s.source_quality_tier})</li>)}</ul>
      </section>

      <section>
        <h2>Claims</h2>
        <form action="/api/curriculum" method="post" style={{ display: 'grid', gap: 8, maxWidth: 700 }}>
          <input type="hidden" name="entity" value="claim" />
          <select name="topic_id">{topics.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select>
          <textarea name="text" placeholder="claim text" required />
          <select name="claim_strength" defaultValue="strong_heuristic"><option value="consensus">consensus</option><option value="strong_heuristic">strong_heuristic</option><option value="provisional">provisional</option></select>
          <select name="evidence_status" defaultValue="supported"><option value="supported">supported</option><option value="mixed">mixed</option><option value="disputed">disputed</option><option value="under_review">under_review</option></select>
          <select name="consensus_scope" defaultValue="moderate"><option value="broad">broad</option><option value="moderate">moderate</option><option value="narrow">narrow</option><option value="none">none</option></select>
          <button type="submit">Create claim</button>
        </form>
        <ul>{claims.map((c) => <li key={c.id}>{c.topic.display_name}: {c.text}</li>)}</ul>
      </section>

      <section>
        <h2>Canonical entries + teaching views</h2>
        <form action="/api/curriculum" method="post" style={{ display: 'grid', gap: 8 }}>
          <input type="hidden" name="entity" value="canonical_entry" />
          <select name="topic_id">{topics.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select>
          <textarea name="canonical_text" placeholder="canonical text" required />
          <textarea name="tradeoff_summary" placeholder="trade-off summary" required />
          <input name="ambiguity_notes" placeholder="ambiguity note" />
          <button type="submit">Create canonical entry</button>
        </form>
        <form action="/api/curriculum" method="post" style={{ display: 'grid', gap: 8 }}>
          <input type="hidden" name="entity" value="teaching_view" />
          <select name="topic_id">{topics.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select>
          <select name="audience_level"><option value="beginner">beginner</option><option value="intermediate">intermediate</option><option value="advanced">advanced</option><option value="professional">professional</option></select>
          <textarea name="summary_text" placeholder="summary text" required />
          <input name="must_include_points" placeholder="must include point" />
          <button type="submit">Create teaching view</button>
        </form>
        <ul>{canonicals.map((c) => <li key={c.id}>{c.topic.display_name}: {c.tradeoff_summary}</li>)}</ul>
        <ul>{views.map((v) => <li key={v.id}>{v.topic.display_name} ({v.audience_level})</li>)}</ul>
      </section>

      <section>
        <h2>Module templates + workshop templates + feedback</h2>
        <form action="/api/curriculum" method="post" style={{ display: 'grid', gap: 8 }}>
          <input type="hidden" name="entity" value="module_template" />
          <select name="topic_id">{topics.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select>
          <select name="module_type"><option value="concept">concept</option><option value="demonstration">demonstration</option><option value="exercise">exercise</option><option value="discussion">discussion</option><option value="recap">recap</option><option value="optional_tangent">optional_tangent</option><option value="troubleshooting">troubleshooting</option><option value="pacing_buffer">pacing_buffer</option></select>
          <input name="title" placeholder="module title" required />
          <input name="objective" placeholder="objective" required />
          <input name="canonical_core_ref" placeholder="canonical ref" required />
          <input name="must_cover_points" placeholder="must cover point" />
          <button type="submit">Create module template</button>
        </form>
        <form action="/api/curriculum" method="post" style={{ display: 'grid', gap: 8 }}>
          <input type="hidden" name="entity" value="workshop_template" />
          <input name="slug" placeholder="slug" required />
          <input name="title" placeholder="title" required />
          <textarea name="description" placeholder="description" required />
          <input name="default_duration_min" type="number" defaultValue={120} />
          <input name="intended_audience_range" placeholder="audience range" required />
          <input name="pacing_notes" placeholder="pacing notes" />
          <button type="submit">Create workshop template</button>
        </form>
        <form action="/api/curriculum" method="post" style={{ display: 'grid', gap: 8 }}>
          <input type="hidden" name="entity" value="feedback_note" />
          <select name="scope_type"><option value="global">global</option><option value="topic">topic</option><option value="module">module</option><option value="workshop_template">workshop_template</option><option value="artifact_type">artifact_type</option></select>
          <input name="scope_ref_id" placeholder="scope ref id" required />
          <textarea name="note_text" placeholder="feedback note" required />
          <input name="priority" type="number" defaultValue={3} />
          <button type="submit">Create feedback note</button>
        </form>
        <ul>{modules.map((m) => <li key={m.id}>{m.title} — {m.topic.display_name}</li>)}</ul>
        <ul>{templates.map((t) => <li key={t.id}>{t.title} ({t.default_duration_min}m)</li>)}</ul>
        <ul>{feedback.map((f) => <li key={f.id}>{f.scope_type}:{f.scope_ref_id} - {f.note_text}</li>)}</ul>
      </section>
    </main>
  );
}
