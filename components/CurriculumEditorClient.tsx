'use client';

import { useState } from 'react';

type Row = { id: string; [k: string]: any };

type EntityBlockProps = {
  title: string;
  entity: string;
  rows: Row[];
  createTemplate: Record<string, any>;
  editableField: string;
};

function EntityBlock({ title, entity, rows, createTemplate, editableField }: EntityBlockProps) {
  const [items, setItems] = useState(rows);
  const [draft, setDraft] = useState(JSON.stringify(createTemplate));
  const [msg, setMsg] = useState('');

  async function createItem() {
    setMsg('Creating...');
    const parsed = JSON.parse(draft);
    const res = await fetch('/api/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, data: parsed })
    });
    const data = await res.json();
    if (res.ok) {
      setItems((prev) => [data.created, ...prev]);
      setMsg('Created');
    } else setMsg('Create failed');
  }

  async function updateItem(id: string, value: string) {
    const res = await fetch('/api/curriculum', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, id, data: { [editableField]: value } })
    });
    if (res.ok) setMsg('Updated');
  }

  async function deleteItem(id: string) {
    const res = await fetch('/api/curriculum', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, id })
    });
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <section style={{ border: '1px solid #ddd', padding: 12, marginBottom: 16, background: '#fff' }}>
      <h3>{title}</h3>
      <details>
        <summary>Create new</summary>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
        <button type="button" onClick={createItem}>
          Create
        </button>
      </details>
      <small>{msg}</small>
      <ul>
        {items.map((row) => (
          <li key={row.id} style={{ marginBottom: 8 }}>
            <code>{row.id.slice(0, 8)}</code>{' '}
            <input
              defaultValue={String(row[editableField] ?? '')}
              onBlur={(e) => updateItem(row.id, e.target.value)}
              style={{ width: 420 }}
            />
            <button type="button" onClick={() => deleteItem(row.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function CurriculumEditorClient(props: {
  topics: Row[];
  claims: Row[];
  sources: Row[];
  canonicalEntries: Row[];
  teachingViews: Row[];
  moduleTemplates: Row[];
  workshopTemplates: Row[];
  feedbackNotes: Row[];
  firstTopicId: string;
  firstSourceId: string;
}) {
  return (
    <div>
      <EntityBlock
        title="Topics"
        entity="topic"
        rows={props.topics}
        editableField="display_name"
        createTemplate={{ slug: 'new_topic', display_name: 'New Topic', brew_method: 'espresso', equipment_context: 'general', canonical_status: 'draft' }}
      />
      <EntityBlock
        title="Claims"
        entity="claim"
        rows={props.claims}
        editableField="text"
        createTemplate={{ topic_id: props.firstTopicId, text: 'New claim', claim_strength: 'provisional', evidence_status: 'under_review', consensus_scope: 'narrow' }}
      />
      <EntityBlock
        title="Sources"
        entity="source"
        rows={props.sources}
        editableField="title"
        createTemplate={{ title: 'New source', source_type: 'educator', author_or_org: 'Unknown', citation_text: 'TBD', url_or_local_ref: 'local', source_quality_tier: 'C' }}
      />
      <EntityBlock
        title="Canonical Entries"
        entity="canonicalEntry"
        rows={props.canonicalEntries}
        editableField="canonical_text"
        createTemplate={{ topic_id: props.firstTopicId, canonical_text: 'Draft canonical text', ambiguity_notes: [], allowed_simplifications: [], common_misconceptions: [], tradeoff_summary: 'TBD', version: 1 }}
      />
      <EntityBlock
        title="Teaching Views"
        entity="teachingView"
        rows={props.teachingViews}
        editableField="summary_text"
        createTemplate={{ topic_id: props.firstTopicId, audience_level: 'beginner', summary_text: 'Draft view', must_include_points: [], optional_depth_points: [], avoid_overstatement_points: [], tradeoff_table: {}, example_phrasings: [] }}
      />
      <EntityBlock
        title="Module Templates"
        entity="moduleTemplate"
        rows={props.moduleTemplates}
        editableField="title"
        createTemplate={{ topic_id: props.firstTopicId, module_type: 'concept', title: 'New module', objective: 'TBD', canonical_core_ref: 'topic:v1', default_sequence_order: 99, min_time_min: 5, ideal_time_min: 8, expandable_time_min: 12, cut_priority: 5, prerequisites: [], suitable_levels: ['beginner'], must_cover_points: [], optional_points: [], if_running_late: [], if_extra_time: [], practical_component: 'TBD', slide_needs: 'TBD', visual_needs: 'TBD', recap_prompt: 'TBD', qna_hooks: 'TBD', workshop_phase: 'hands_on', status: 'draft' }}
      />
      <EntityBlock
        title="Workshop Templates"
        entity="workshopTemplate"
        rows={props.workshopTemplates}
        editableField="title"
        createTemplate={{ slug: 'new-template', title: 'New Workshop', description: 'Draft', default_duration_min: 90, intended_audience_range: 'beginner', module_sequence: [], mandatory_modules: [], optional_modules: [], pacing_notes: 'TBD', status: 'draft' }}
      />
      <EntityBlock
        title="Feedback Notes"
        entity="feedbackNote"
        rows={props.feedbackNotes}
        editableField="note_text"
        createTemplate={{ scope_type: 'global', scope_ref_id: 'global', note_text: 'New feedback note', priority: 3, active: true }}
      />
    </div>
  );
}
