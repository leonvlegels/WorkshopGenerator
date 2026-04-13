import { ModuleTemplate, TeachingView, CanonicalEntry, FeedbackNote } from '@prisma/client';

export type AssumptionLog = {
  missing_input_assumptions: string[];
  pacing_assumptions: string[];
  level_assumptions: string[];
  equipment_assumptions: string[];
  unresolved_ambiguities: string[];
};

export function buildWorkshopSequence(modules: ModuleTemplate[], durationMin: number) {
  const sorted = [...modules].sort((a, b) => a.default_sequence_order - b.default_sequence_order);
  let used = 0;

  const planned = sorted.map((m) => {
    const remaining = Math.max(durationMin - used, 0);
    const plannedTime = Math.min(m.ideal_time_min, remaining || m.min_time_min);
    used += plannedTime;

    return {
      module_id: m.id,
      module_title: m.title,
      module_type: m.module_type,
      workshop_phase: m.workshop_phase,
      locked: false,
      planned_time_min: plannedTime,
      cut_priority: m.cut_priority
    };
  });

  return {
    modules: planned,
    cut_order: planned
      .filter((x) => x.cut_priority > 0)
      .sort((a, b) => b.cut_priority - a.cut_priority)
      .map((x) => x.module_id)
  };
}

export function buildAssumptionLog(input: {
  level?: string;
  equipment?: string;
  targetDurationMin: number;
}): AssumptionLog {
  return {
    missing_input_assumptions: ['No explicit operator override for pedagogical trade-off emphasis.'],
    pacing_assumptions: [`Total duration enforced at ${input.targetDurationMin} minutes.`],
    level_assumptions: [input.level ? `Audience level interpreted as ${input.level}.` : 'Audience level defaulted to beginner.'],
    equipment_assumptions: [
      input.equipment
        ? `Equipment context set to ${input.equipment}.`
        : 'Equipment context defaulted to general espresso station.'
    ],
    unresolved_ambiguities: ['Ratio-first versus time-first adjustment stance deferred to trade-off framing.']
  };
}

export function buildManualMarkdown(params: {
  title: string;
  sequence: ReturnType<typeof buildWorkshopSequence>;
  views: TeachingView[];
  canonicals: CanonicalEntry[];
  feedback: FeedbackNote[];
}) {
  const modules = params.sequence.modules
    .map(
      (m, idx) => `## ${idx + 1}. ${m.module_title} (${m.planned_time_min} min)\n- Type: ${m.module_type}\n- Must cover: preserve trade-offs, avoid overstatement, connect taste + flow.`
    )
    .join('\n\n');

  return `# ${params.title}\n\n## Goals\n- Build conservative, evidence-aware coffee understanding.\n- Keep multiple valid approaches explicit.\n\n## Timing Blocks\n${modules}\n\n## Teaching Notes\n- Active feedback notes: ${params.feedback.length}\n- Canonical anchors used: ${params.canonicals.length}\n- Teaching views used: ${params.views.length}\n\n## Q&A Prompt\nWhat changed in your mental model of extraction trade-offs today?`;
}
