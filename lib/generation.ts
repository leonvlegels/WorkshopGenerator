import { ModuleTemplate, TeachingView, CanonicalEntry, FeedbackNote } from '@prisma/client';

export type AssumptionLog = {
  missing_input_assumptions: string[];
  pacing_assumptions: string[];
  level_assumptions: string[];
  equipment_assumptions: string[];
  unresolved_ambiguities: string[];
};

export function buildWorkshopSequence(
  modules: ModuleTemplate[],
  durationMin: number,
  moduleLevelMap: Record<string, string>
) {
  const sorted = [...modules].sort((a, b) => a.default_sequence_order - b.default_sequence_order);
  let used = 0;
  const halfway = durationMin / 2;

  const planned = sorted.map((m) => {
    const remaining = Math.max(durationMin - used, 0);
    const plannedTime = Math.min(m.ideal_time_min, remaining || m.min_time_min);
    const locked = m.module_type === 'recap';
    const phase = used < halfway ? 'slide-heavy' : 'hands-on';
    used += plannedTime;

    return {
      module_id: m.id,
      module_title: m.title,
      module_type: m.module_type,
      workshop_phase: phase,
      locked,
      planned_time_min: plannedTime,
      cut_priority: m.cut_priority,
      audience_level: moduleLevelMap[m.id] ?? 'beginner'
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
  workshopGoal?: string;
  totalDurationMin: number;
  setupPrep: string[];
  sequence: ReturnType<typeof buildWorkshopSequence>;
  views: TeachingView[];
  canonicals: CanonicalEntry[];
  feedback: FeedbackNote[];
  moduleDetails: ModuleTemplate[];
  assumptions: AssumptionLog;
}) {
  const detailById = Object.fromEntries(params.moduleDetails.map((m) => [m.id, m]));
  const modules = params.sequence.modules
    .map(
      (m, idx) => {
        const d = detailById[m.module_id];
        return `## ${idx + 1}. ${m.module_title} (${m.planned_time_min} min, ${m.audience_level})
- Type: ${m.module_type} | Phase: ${m.workshop_phase}
- Must cover: ${(d?.must_cover_points as string[])?.join('; ') || 'Preserve trade-offs and avoid overstatement.'}
- Optional/cuttable: ${(d?.optional_points as string[])?.join('; ') || 'None'}
- If running late: ${(d?.if_running_late as string[])?.join('; ') || 'Shorten examples.'}
- If extra time: ${(d?.if_extra_time as string[])?.join('; ') || 'Add calibration reps.'}
- Practical moment: ${d?.practical_component || 'Taste-flow diagnosis drill.'}`;
      }
    )
    .join('\n\n');

  const feedback = params.feedback.map((f) => `- [P${f.priority}] ${f.note_text}`).join('\n');
  return `# ${params.title}

## Workshop Goal
${params.workshopGoal || 'Build robust, non-dogmatic espresso decision making.'}

## Total Duration
${params.totalDurationMin} minutes

## Setup / Prep
${params.setupPrep.map((x) => `- ${x}`).join('\n')}

## Timing Blocks
${modules}

## Recap
- Re-state trade-off framing and what depends.
- Ask learners which lever they would change first and why.

## Final Q&A
- Which assumptions from your current dial-in routine are most fragile?

## Generation Diagnostics (Operator)
- Active feedback notes: ${params.feedback.length}
- Canonical anchors used: ${params.canonicals.length}
- Teaching views used: ${params.views.length}
${feedback ? `\n### Applied feedback\n${feedback}` : ''}

## Assumption Log
- Missing inputs: ${params.assumptions.missing_input_assumptions.join(' | ')}
- Pacing assumptions: ${params.assumptions.pacing_assumptions.join(' | ')}
- Level assumptions: ${params.assumptions.level_assumptions.join(' | ')}
- Equipment assumptions: ${params.assumptions.equipment_assumptions.join(' | ')}
- Unresolved ambiguities: ${params.assumptions.unresolved_ambiguities.join(' | ')}`;
}

export function buildSlideModel(params: { title: string; sequence: ReturnType<typeof buildWorkshopSequence> }) {
  const slides = [
    {
      slide_type: 'title',
      title: params.title,
      bullets: ['Welcome', 'Today: practical + evidence-aware coffee learning'],
      suggested_visuals: ['Workshop title card']
    }
  ];

  params.sequence.modules.forEach((m, idx) => {
    slides.push({
      slide_type: 'module',
      title: `${idx + 1}. ${m.module_title}`,
      bullets:
        m.workshop_phase === 'slide-heavy'
          ? ['Core concept framing', 'Common mistakes', 'Trade-off reminders']
          : ['Hands-on prompt', 'Taste + flow checkpoints'],
      suggested_visuals:
        m.workshop_phase === 'slide-heavy'
          ? ['Flow/percolation diagram', 'Extraction taste map']
          : ['Station setup photo', 'Shot log template']
    });
  });

  slides.push({
    slide_type: 'recap',
    title: 'Recap',
    bullets: ['What is consensus?', 'What depends?', 'Where to experiment safely?'],
    suggested_visuals: ['Decision tree diagram']
  });
  slides.push({
    slide_type: 'qna',
    title: 'Q&A',
    bullets: ['Ask anything about calibration, milk, workflow, and trade-offs'],
    suggested_visuals: ['Simple coffee cup icon']
  });

  return { title: params.title, slide_count: slides.length, slides };
}
