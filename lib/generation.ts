import { AudienceLevel, FeedbackNote, ModuleTemplate, TeachingView, CanonicalEntry, WorkshopPhase } from '@prisma/client';

export type StructureModuleInput = {
  moduleId: string;
  level: AudienceLevel;
  locked?: boolean;
  enabled?: boolean;
};

export type AssumptionLog = {
  missing_input_assumptions: string[];
  pacing_assumptions: string[];
  level_assumptions: string[];
  equipment_assumptions: string[];
  unresolved_ambiguities: string[];
};

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [];
}

export function buildWorkshopSequence(params: {
  modules: ModuleTemplate[];
  selected: StructureModuleInput[];
  durationMin: number;
}) {
  const selectedMap = new Map(params.selected.map((s) => [s.moduleId, s]));

  const filtered = params.modules
    .filter((module) => {
      const pick = selectedMap.get(module.id);
      return pick ? pick.enabled !== false : false;
    })
    .sort((a, b) => a.default_sequence_order - b.default_sequence_order);

  let minutesLeft = params.durationMin;
  let running = 0;

  const modules = filtered.map((module, index) => {
    const selected = selectedMap.get(module.id)!;
    const recommended = Math.min(module.ideal_time_min, Math.max(module.min_time_min, minutesLeft));
    minutesLeft -= recommended;
    running += recommended;

    return {
      module_id: module.id,
      module_title: module.title,
      module_type: module.module_type,
      workshop_phase: module.workshop_phase,
      level: selected.level,
      locked: Boolean(selected.locked),
      planned_time_min: recommended,
      min_time_min: module.min_time_min,
      ideal_time_min: module.ideal_time_min,
      expandable_time_min: module.expandable_time_min,
      cut_priority: module.cut_priority,
      must_cover_points: parseJsonArray(module.must_cover_points),
      optional_points: parseJsonArray(module.optional_points),
      if_running_late: parseJsonArray(module.if_running_late),
      if_extra_time: parseJsonArray(module.if_extra_time),
      practical_component: module.practical_component,
      slide_needs: module.slide_needs,
      visual_needs: module.visual_needs,
      sequence_index: index + 1,
      minute_window: [Math.max(running - recommended, 0), running]
    };
  });

  return {
    modules,
    cut_order: [...modules].sort((a, b) => b.cut_priority - a.cut_priority).map((m) => m.module_id),
    pacing_summary: {
      planned_total: modules.reduce((acc, m) => acc + m.planned_time_min, 0),
      requested_total: params.durationMin
    }
  };
}

export function buildAssumptionLog(input: {
  durationMin: number;
  equipmentContext?: string;
  selectedLevels: AudienceLevel[];
  unresolved: string[];
}): AssumptionLog {
  return {
    missing_input_assumptions: ['No explicit station rotation map provided; used even rotation assumption.'],
    pacing_assumptions: [
      `Generated sequence constrained to ${input.durationMin} minutes.`,
      'Used module min/ideal/expandable timings to allocate blocks.'
    ],
    level_assumptions: [`Module-level targeting set to: ${Array.from(new Set(input.selectedLevels)).join(', ')}.`],
    equipment_assumptions: [input.equipmentContext ?? 'General espresso training station assumed.'],
    unresolved_ambiguities: input.unresolved.length > 0 ? input.unresolved : ['No major unresolved ambiguities.']
  };
}

function scopedFeedback(
  feedback: FeedbackNote[],
  scopeType: 'global' | 'topic' | 'module' | 'workshop_template' | 'artifact_type',
  scopeRefId: string
) {
  return feedback
    .filter((f) => f.active)
    .filter((f) => f.scope_type === 'global' || (f.scope_type === scopeType && f.scope_ref_id === scopeRefId))
    .sort((a, b) => a.priority - b.priority)
    .map((f) => f.note_text);
}

export function buildManualMarkdown(params: {
  title: string;
  durationMin: number;
  sequence: ReturnType<typeof buildWorkshopSequence>;
  setupPrep: string[];
  workshopGoal: string;
  assumptionLog: AssumptionLog;
  feedback: FeedbackNote[];
}) {
  const blocks = params.sequence.modules
    .map((m) => {
      const moduleFeedback = scopedFeedback(params.feedback, 'module', m.module_id)
        .map((x) => `- Feedback constraint: ${x}`)
        .join('\n');

      return `## ${m.sequence_index}. ${m.module_title} (${m.planned_time_min} min, ${m.level})
- Type: ${m.module_type}
- Phase: ${humanizePhase(m.workshop_phase)}
- Must cover:
${m.must_cover_points.map((p) => `  - ${p}`).join('\n')}
- Optional/cuttable:
${m.optional_points.map((p) => `  - ${p}`).join('\n') || '  - none'}
- If running late:
${m.if_running_late.map((p) => `  - ${p}`).join('\n') || '  - reduce examples, keep diagnostics core'}
- If extra time:
${m.if_extra_time.map((p) => `  - ${p}`).join('\n') || '  - add comparative tasting'}
- Practical exercise: ${m.practical_component}
${moduleFeedback}`;
    })
    .join('\n\n');

  return `# ${params.title}

## Workshop goal
${params.workshopGoal}

## Total duration
${params.durationMin} minutes

## Setup / prep
${params.setupPrep.map((x) => `- ${x}`).join('\n')}

## Timing blocks
${blocks}

## Recap
- Revisit key trade-offs (ratio-first vs time-first where relevant).
- Ask learners to explain one “it depends” condition they can now diagnose.

## Final Q&A
- What assumptions in your workflow need testing next shift?

## Assumption / ambiguity log
- Missing input assumptions:
${params.assumptionLog.missing_input_assumptions.map((x) => `  - ${x}`).join('\n')}
- Pacing assumptions:
${params.assumptionLog.pacing_assumptions.map((x) => `  - ${x}`).join('\n')}
- Level assumptions:
${params.assumptionLog.level_assumptions.map((x) => `  - ${x}`).join('\n')}
- Equipment assumptions:
${params.assumptionLog.equipment_assumptions.map((x) => `  - ${x}`).join('\n')}
- Unresolved ambiguities:
${params.assumptionLog.unresolved_ambiguities.map((x) => `  - ${x}`).join('\n')}`;
}

export function buildSlideDeck(params: { title: string; sequence: ReturnType<typeof buildWorkshopSequence> }) {
  const slides: Array<Record<string, unknown>> = [
    {
      kind: 'title',
      title: params.title,
      subtitle: 'Coffee Habits Workshop',
      tone: 'warm-technical',
      suggested_visuals: ['Coffee bar workflow photo', 'Simple agenda diagram']
    }
  ];

  for (const module of params.sequence.modules) {
    slides.push({
      kind: 'content',
      module_id: module.module_id,
      title: `${module.module_title} (${module.level})`,
      bullets: module.must_cover_points,
      suggested_visuals: [module.visual_needs, module.slide_needs],
      phase: humanizePhase(module.workshop_phase),
      density: module.workshop_phase === WorkshopPhase.slide_heavy ? 'moderate' : 'sparse'
    });
  }

  slides.push({
    kind: 'recap',
    title: 'Recap: What changed?',
    bullets: ['What is consensus?', 'What depends on context?', 'What assumptions did we make today?'],
    suggested_visuals: ['Trade-off comparison table']
  });
  slides.push({ kind: 'qna', title: 'Q&A', bullets: ['Ask anything about the workflow you tested today.'] });

  return {
    title: params.title,
    slide_count: slides.length,
    slides
  };
}

function humanizePhase(phase: WorkshopPhase) {
  if (phase === WorkshopPhase.slide_heavy) return 'slide-heavy';
  if (phase === WorkshopPhase.hands_on) return 'hands-on';
  return 'recap';
}

export function chooseTeachingView(
  views: TeachingView[],
  topicId: string,
  level: AudienceLevel
): TeachingView | undefined {
  return views.find((v) => v.topic_id === topicId && v.audience_level === level) ?? views.find((v) => v.topic_id === topicId);
}

export function mergeCanonicalContext(entries: CanonicalEntry[]) {
  return entries.map((entry) => ({
    topicId: entry.topic_id,
    canonicalText: entry.canonical_text,
    tradeoffSummary: entry.tradeoff_summary,
    ambiguityNotes: parseJsonArray(entry.ambiguity_notes)
  }));
}
