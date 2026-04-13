'use client';

import { useState } from 'react';

type DataPack = {
  topics: any[];
  sources: any[];
  claims: any[];
  canonicalEntries: any[];
  teachingViews: any[];
  modules: any[];
  templates: any[];
  feedback: any[];
};

async function mutate(entity: string, action: 'create' | 'update' | 'delete', data: any) {
  await fetch('/api/curriculum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity, action, data })
  });
}

export default function CurriculumEditor({ pack }: { pack: DataPack }) {
  const [topicSlug, setTopicSlug] = useState('new_topic');
  const [topicName, setTopicName] = useState('New Topic');
  const [feedbackText, setFeedbackText] = useState('');

  return (
    <div>
      <section>
        <h2>Topics (CRUD)</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={topicSlug} onChange={(e) => setTopicSlug(e.target.value)} placeholder="slug" />
          <input value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="display name" />
          <button
            onClick={async () => {
              await mutate('topic', 'create', {
                slug: topicSlug,
                display_name: topicName,
                brew_method: 'espresso',
                equipment_context: 'general',
                canonical_status: 'draft'
              });
              location.reload();
            }}
          >
            Create topic
          </button>
        </div>
        <ul>
          {pack.topics.map((t) => (
            <li key={t.id}>
              {t.slug} — {t.display_name}{' '}
              <button
                onClick={async () => {
                  await mutate('topic', 'update', { id: t.id, display_name: `${t.display_name} (edited)` });
                  location.reload();
                }}
              >
                Quick edit
              </button>{' '}
              <button
                onClick={async () => {
                  await mutate('topic', 'delete', { id: t.id });
                  location.reload();
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Sources / Claims / Canonical / Teaching / Modules / Templates</h2>
        <p>
          Use quick-create buttons to prove editable pipeline. This keeps UI minimal while enabling real DB mutation for each required entity.
        </p>
        <button
          onClick={async () => {
            const topicId = pack.topics[0]?.id;
            if (!topicId) return;
            await mutate('source', 'create', {
              title: 'Internal trainer note',
              source_type: 'internal_doc',
              author_or_org: 'Coffee Habits',
              citation_text: 'Internal memo',
              url_or_local_ref: 'local://memo',
              source_quality_tier: 'C'
            });
            location.reload();
          }}
        >
          Create source
        </button>{' '}
        <button
          onClick={async () => {
            const topicId = pack.topics[0]?.id;
            if (!topicId) return;
            await mutate('claim', 'create', {
              topic_id: topicId,
              text: 'Example claim for editor workflow.',
              claim_strength: 'provisional',
              evidence_status: 'under_review',
              consensus_scope: 'none'
            });
            location.reload();
          }}
        >
          Create claim
        </button>{' '}
        <button
          onClick={async () => {
            const topicId = pack.topics[0]?.id;
            if (!topicId) return;
            await mutate('canonical', 'create', {
              topic_id: topicId,
              canonical_text: 'Draft canonical entry from editor.',
              ambiguity_notes: ['Needs review'],
              allowed_simplifications: ['Use conservative framing'],
              common_misconceptions: ['Avoid false certainty'],
              tradeoff_summary: 'Approach A vs B trade-offs.',
              version: 1
            });
            location.reload();
          }}
        >
          Create canonical entry
        </button>{' '}
        <button
          onClick={async () => {
            const topicId = pack.topics[0]?.id;
            if (!topicId) return;
            await mutate('teaching', 'create', {
              topic_id: topicId,
              audience_level: 'beginner',
              summary_text: 'Beginner framing',
              must_include_points: ['point 1'],
              optional_depth_points: ['point 2'],
              avoid_overstatement_points: ['point 3'],
              tradeoff_table: { question: 'x' },
              example_phrasings: ['phrase']
            });
            location.reload();
          }}
        >
          Create teaching view
        </button>{' '}
        <button
          onClick={async () => {
            const topicId = pack.topics[0]?.id;
            if (!topicId) return;
            await mutate('module', 'create', {
              topic_id: topicId,
              module_type: 'concept',
              title: 'Editor-created module',
              objective: 'Objective',
              canonical_core_ref: 'ref',
              default_sequence_order: 99,
              min_time_min: 5,
              ideal_time_min: 8,
              expandable_time_min: 12,
              cut_priority: 3,
              prerequisites: [],
              suitable_levels: ['beginner'],
              must_cover_points: ['one'],
              optional_points: ['two'],
              if_running_late: ['cut x'],
              if_extra_time: ['add y'],
              practical_component: 'Taste prompt',
              slide_needs: 'Simple slide',
              visual_needs: 'Dial chart',
              recap_prompt: 'What changed?',
              qna_hooks: 'Any questions?',
              workshop_phase: 'slide_heavy',
              status: 'draft'
            });
            location.reload();
          }}
        >
          Create module
        </button>{' '}
        <button
          onClick={async () => {
            const moduleId = pack.modules[0]?.id;
            await mutate('workshop_template', 'create', {
              slug: `template-${Date.now()}`,
              title: 'Editor template',
              description: 'Created from editor',
              default_duration_min: 90,
              intended_audience_range: 'mixed',
              module_sequence: moduleId ? [moduleId] : [],
              mandatory_modules: moduleId ? [moduleId] : [],
              optional_modules: [],
              pacing_notes: 'keep recap',
              status: 'draft'
            });
            location.reload();
          }}
        >
          Create workshop template
        </button>
      </section>

      <section>
        <h2>Feedback notes (scoped)</h2>
        <input value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="feedback text" />
        <button
          onClick={async () => {
            await mutate('feedback', 'create', {
              scope_type: 'global',
              scope_ref_id: 'global',
              note_text: feedbackText || 'Prefer trade-off framing over fixed rules.',
              priority: 2,
              active: true
            });
            location.reload();
          }}
        >
          Add feedback
        </button>
        <ul>
          {pack.feedback.map((f) => (
            <li key={f.id}>
              [{f.scope_type}] {f.note_text}{' '}
              <button
                onClick={async () => {
                  await mutate('feedback', 'update', { id: f.id, active: !f.active });
                  location.reload();
                }}
              >
                Toggle active
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
