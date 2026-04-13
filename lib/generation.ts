import { AudienceLevel, ModuleTemplate, WorkshopTemplate } from '@prisma/client';

export type GenerationInput = {
  workshopTemplate: WorkshopTemplate;
  modules: ModuleTemplate[];
  title: string;
  totalDurationMin: number;
  groupSize: number;
  numberOfTeachers: number;
  stations: string;
  targetLevel: AudienceLevel;
  mandatoryModuleIds: string[];
  optionalModuleIds: string[];
  specialGoals: string;
};

export function buildWorkshopStructure(input: GenerationInput) {
  const eligible = input.modules
    .filter((m) => JSON.parse(m.suitableLevels).includes(input.targetLevel))
    .sort((a, b) => a.defaultSequenceOrder - b.defaultSequenceOrder);

  const moduleCount = Math.max(eligible.length, 1);
  const baseTime = Math.floor(input.totalDurationMin / moduleCount);

  const modules = eligible.map((module) => ({
    moduleId: module.id,
    title: module.title,
    type: module.moduleType,
    locked: input.mandatoryModuleIds.includes(module.id),
    plannedTimeMin: Math.max(module.minTimeMin, Math.min(module.idealTimeMin, baseTime)),
    workshopPhase: module.workshopPhase
  }));

  return {
    title: input.title,
    totalDurationMin: input.totalDurationMin,
    modules,
    cutOrder: eligible
      .slice()
      .sort((a, b) => b.cutPriority - a.cutPriority)
      .map((m) => m.id)
  };
}

export function buildAssumptionLog(input: GenerationInput) {
  return {
    missing_input_assumptions: [],
    pacing_assumptions: [`Used equalized pacing baseline of ~${Math.floor(input.totalDurationMin / Math.max(input.modules.length, 1))} min/module.`],
    level_assumptions: [`Target level normalized to ${input.targetLevel}.`],
    equipment_assumptions: [`Stations and setup interpreted as: ${input.stations}.`],
    unresolved_ambiguities: input.specialGoals ? [] : ['No special goals provided; defaulted to balanced theory/practical emphasis.']
  };
}

export function buildManualMarkdown(structure: ReturnType<typeof buildWorkshopStructure>, assumptionLog: ReturnType<typeof buildAssumptionLog>) {
  const moduleSections = structure.modules
    .map(
      (m, idx) =>
        `### ${idx + 1}. ${m.title} (${m.plannedTimeMin} min)\n- Type: ${m.type}\n- Teaching focus: Keep claims tied to canonical entries and preserve trade-offs where relevant.\n- If late: reduce optional tangents first.\n- Q&A hook: What changed in taste when we changed only one variable?`
    )
    .join('\n\n');

  return `# ${structure.title}\n\n## Goals\n- Deliver technically accurate coffee instruction with clear trade-offs.\n- Keep consensus vs heuristic claims explicit.\n\n## Timing Blocks\n${moduleSections}\n\n## Recap Prompt\n- Which workflow choices are non-negotiable, and which are context-dependent?\n\n## Assumption Log\n\
\
\
\
\
${JSON.stringify(assumptionLog, null, 2)}\n`;
}

export function buildSlidePreview(structure: ReturnType<typeof buildWorkshopStructure>) {
  const sectionSlides = structure.modules
    .map((m) => `## ${m.title}\n- Key idea\n- Why it matters\n- One practical cue`) 
    .join('\n\n');

  return `# ${structure.title}\n\n## Welcome\n- Warm, practical, nerdy\n\n${sectionSlides}\n\n## Recap\n- Keep cause/effect language precise\n- Preserve multiple valid approaches\n\n## Q&A\n- What's still ambiguous in your setup?`;
}
