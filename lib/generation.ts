import { AudienceLevel, CanonicalEntry, FeedbackNote, ModuleTemplate, TeachingView, WorkshopPhase } from '@prisma/client';

export type ModuleSelection = {
  moduleId: string;
  enabled: boolean;
  level: AudienceLevel;
  locked?: boolean;
  plannedTimeMin?: number;
};

export type SequenceModule = {
  module_id: string;
  module_title: string;
  module_type: string;
  topic_id: string;
  workshop_phase: WorkshopPhase;
  locked: boolean;
  enabled: boolean;
  level: AudienceLevel;
  planned_time_min: number;
  min_time_min: number;
  ideal_time_min: number;
  expandable_time_min: number;
  cut_priority: number;
  must_cover_points: string[];
  optional_points: string[];
  if_running_late: string[];
  if_extra_time: string[];
  practical_component: string;
  visual_needs: string;
};

export type AssumptionLog = {
  missing_input_assumptions: string[];
  pacing_assumptions: string[];
  level_assumptions: string[];
  equipment_assumptions: string[];
  unresolved_ambiguities: string[];
};

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [];
}

export function buildWorkshopSequence(input: {
  modules: ModuleTemplate[];
  selections: ModuleSelection[];
  durationMin: number;
}) {
  const selectionMap = new Map(input.selections.map((s) => [s.moduleId, s]));

  const selected = input.modules
    .filter((m) => selectionMap.get(m.id)?.enabled)
    .sort((a, b) => a.default_sequence_order - b.default_sequence_order);

  const phaseAware = selected.sort((a, b) => {
    if (a.workshop_phase === b.workshop_phase) return a.default_sequence_order - b.default_sequence_order;
    if (a.workshop_phase === 'slide_heavy') return -1;
    if (b.workshop_phase === 'slide_heavy') return 1;
    return a.default_sequence_order - b.default_sequence_order;
  });

  let remaining = input.durationMin;
  const modules: SequenceModule[] = phaseAware.map((m) => {
    const pick = selectionMap.get(m.id)!;
    const customTime = pick.plannedTimeMin;
    const planned = Math.max(
      m.min_time_min,
      Math.min(customTime ?? m.ideal_time_min, Math.max(remaining, m.min_time_min))
    );
    remaining -= planned;

    return {
      module_id: m.id,
      module_title: m.title,
      module_type: m.module_type,
      topic_id: m.topic_id,
      workshop_phase: m.workshop_phase,
      locked: Boolean(pick.locked),
      enabled: true,
      level: pick.level,
      planned_time_min: planned,
      min_time_min: m.min_time_min,
      ideal_time_min: m.ideal_time_min,
      expandable_time_min: m.expandable_time_min,
      cut_priority: m.cut_priority,
      must_cover_points: parseStringArray(m.must_cover_points),
      optional_points: parseStringArray(m.optional_points),
      if_running_late: parseStringArray(m.if_running_late),
      if_extra_time: parseStringArray(m.if_extra_time),
      practical_component: m.practical_component,
      visual_needs: m.visual_needs
    };
  });

  return {
    modules,
    cut_order: [...modules].sort((a, b) => b.cut_priority - a.cut_priority).map((m) => m.module_id)
  };
}

export function buildAssumptionLog(input: {
  selectedCount: number;
  levelMix: AudienceLevel[];
  equipment?: string;
  targetDurationMin: number;
}): AssumptionLog {
  return {
    missing_input_assumptions: input.selectedCount
      ? []
      : ['No modules selected explicitly; using all canonical modules from template context.'],
    pacing_assumptions: [`Planned to fit ${input.targetDurationMin} min with cut order by cut_priority.`],
    level_assumptions: [`Per-module levels: ${Array.from(new Set(input.levelMix)).join(', ')}.`],
    equipment_assumptions: [input.equipment || 'General espresso training station assumed.'],
    unresolved_ambiguities: ['Trade-off disagreements are surfaced in module framing instead of forced resolution.']
  };
}

export function buildManualMarkdown(params: {
  title: string;
  totalDurationMin: number;
  goals: string[];
  setupPrep: string[];
  sequence: { modules: SequenceModule[] };
  viewsByTopic: Map<string, TeachingView[]>;
  canonicalsByTopic: Map<string, CanonicalEntry[]>;
  feedback: FeedbackNote[];
  assumptions: AssumptionLog;
}) {
  const moduleBlocks = params.sequence.modules
    .map((m, idx) => {
      const views = params.viewsByTopic.get(m.topic_id) ?? [];
      const canonical = params.canonicalsByTopic.get(m.topic_id)?.[0];
      return `## ${idx + 1}. ${m.module_title} (${m.planned_time_min} min, ${m.level})
- Type: ${m.module_type}
- Must cover:
${m.must_cover_points.map((p) => `  - ${p}`).join('\n')}
- Optional/cuttable:
${m.optional_points.map((p) => `  - ${p}`).join('\n')}
- If running late:
${m.if_running_late.map((p) => `  - ${p}`).join('\n')}
- If extra time:
${m.if_extra_time.map((p) => `  - ${p}`).join('\n')}
- Practical exercise: ${m.practical_component}
- Canonical anchor: ${canonical?.tradeoff_summary ?? 'Use conservative trade-off framing.'}
- Teaching-view guardrails: ${views.length ? 'Use level-appropriate simplifications without changing truth conditions.' : 'No explicit teaching view found; keep claims conservative.'}`;
    })
    .join('\n\n');

  const feedbackNotes = params.feedback.map((f) => `- [priority ${f.priority}] ${f.note_text}`).join('\n') || '- None';

  return `# ${params.title}

## Workshop Goal
${params.goals.map((g) => `- ${g}`).join('\n')}

## Total Duration
- ${params.totalDurationMin} minutes

## Setup / Prep
${params.setupPrep.map((s) => `- ${s}`).join('\n')}

## Timing Blocks
${moduleBlocks}

## Recap
- Re-state trade-offs where multiple approaches are valid.
- Reinforce that taste + flow + context must be interpreted together.

## Final Q&A
- Invite one unresolved ambiguity from each station.

## Active Feedback Notes Applied
${feedbackNotes}

## Assumption / Ambiguity Log
- Missing input assumptions: ${params.assumptions.missing_input_assumptions.join('; ') || 'None'}
- Pacing assumptions: ${params.assumptions.pacing_assumptions.join('; ')}
- Level assumptions: ${params.assumptions.level_assumptions.join('; ')}
- Equipment assumptions: ${params.assumptions.equipment_assumptions.join('; ')}
- Unresolved ambiguities: ${params.assumptions.unresolved_ambiguities.join('; ')}`;
}

export function buildSlideJson(params: { title: string; sequence: { modules: SequenceModule[] }; totalDurationMin: number }) {
  const slides: Array<Record<string, unknown>> = [
    {
      type: 'title',
      heading: params.title,
      tone: 'warm_technical',
      bullets: ['Practical, evidence-aware espresso training'],
      suggested_visuals: ['Workshop roadmap timeline']
    }
  ];

  params.sequence.modules.forEach((m, idx) => {
    slides.push({
      type: 'content',
      heading: `${idx + 1}. ${m.module_title}`,
      module_id: m.module_id,
      level: m.level,
      phase: m.workshop_phase,
      density: m.workshop_phase === 'slide_heavy' ? 'moderate' : 'light',
      bullets: m.must_cover_points,
      suggested_visuals: [m.visual_needs, 'Simple cause/effect diagram'],
      student_tone: 'encouraging_precise'
    });
  });

  slides.push({
    type: 'recap',
    heading: 'Recap: What is consensus vs what depends?',
    bullets: ['Use trade-off framing.', 'Avoid one-size-fits-all espresso dogma.'],
    suggested_visuals: ['Consensus vs depends two-column table']
  });

  slides.push({
    type: 'qna',
    heading: 'Q&A',
    bullets: ['Bring your hardest dial-in ambiguity.'],
    suggested_visuals: ['Open questions board']
  });

  return {
    version: 1,
    total_duration_min: params.totalDurationMin,
    slides
  };
}
