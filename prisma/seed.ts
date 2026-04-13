import {
  PrismaClient,
  AudienceLevel,
  CanonicalStatus,
  ModuleStatus,
  ModuleType,
  SourceQualityTier,
  SourceType,
  ClaimStrength,
  EvidenceStatus,
  ConsensusScope,
  SupportType,
  ExpansionStatus,
  WorkshopPhase
} from '@prisma/client';

const prisma = new PrismaClient();

async function createTopicPack(input: {
  slug: string;
  display: string;
  summary: string;
  canonical: string;
  tradeoff: string;
  beginnerView: string;
  moduleTitle: string;
  moduleType: ModuleType;
  modulePhase: WorkshopPhase;
  sequence: number;
}) {
  const topic = await prisma.topic.create({
    data: {
      slug: input.slug,
      display_name: input.display,
      brew_method: 'espresso',
      equipment_context: 'general',
      canonical_status: CanonicalStatus.canonical,
      summary: input.summary
    }
  });

  const claim = await prisma.claim.create({
    data: {
      topic_id: topic.id,
      text: input.canonical,
      claim_strength: ClaimStrength.consensus,
      evidence_status: EvidenceStatus.supported,
      consensus_scope: ConsensusScope.moderate
    }
  });

  await prisma.canonicalEntry.create({
    data: {
      topic_id: topic.id,
      canonical_text: input.canonical,
      ambiguity_notes: ['Context and equipment modify outcomes.'],
      allowed_simplifications: ['Start with robust heuristics, then test in cup.'],
      common_misconceptions: ['Single variables alone explain all outcomes.'],
      tradeoff_summary: input.tradeoff,
      version: 1,
      approved_at: new Date(),
      level_baseline: AudienceLevel.intermediate
    }
  });

  await prisma.teachingView.create({
    data: {
      topic_id: topic.id,
      audience_level: AudienceLevel.beginner,
      summary_text: input.beginnerView,
      must_include_points: ['What changes', 'What to observe', 'What depends'],
      optional_depth_points: ['Measurement caveats'],
      avoid_overstatement_points: ['Avoid absolute language where context matters.'],
      tradeoff_table: {
        question: `How to teach ${input.display}?`,
        approach_a_name: 'Rule-of-thumb first',
        approach_a_best_for: 'New operators',
        approach_a_risks: 'Can hide edge cases.',
        approach_b_name: 'Nuance-first',
        approach_b_best_for: 'Advanced groups',
        approach_b_risks: 'Can overload beginners.',
        what_is_consensus: 'Use cup feedback and repeatable process.',
        what_depends: 'Coffee, grinder, machine, workflow constraints.'
      },
      example_phrasings: ['This is a practical heuristic, not a universal law.']
    }
  });

  const module = await prisma.moduleTemplate.create({
    data: {
      topic_id: topic.id,
      module_type: input.moduleType,
      title: input.moduleTitle,
      objective: `Teach ${input.display} in actionable, conservative terms.`,
      canonical_core_ref: `${input.slug}:v1`,
      default_sequence_order: input.sequence,
      min_time_min: 8,
      ideal_time_min: 12,
      expandable_time_min: 18,
      cut_priority: 2,
      prerequisites: [],
      suitable_levels: ['beginner', 'intermediate', 'advanced', 'professional'],
      must_cover_points: ['Core concept', 'Observed signals', 'Trade-off framing'],
      optional_points: ['Edge cases', 'Equipment variance examples'],
      if_running_late: ['Keep only must-cover points and one example.'],
      if_extra_time: ['Add side-by-side comparison exercise.'],
      practical_component: 'Guided taste + process observation exercise.',
      slide_needs: '1 core model slide + 1 signal checklist slide',
      visual_needs: 'Simple process diagram',
      recap_prompt: 'What was consensus and what depended on context?',
      qna_hooks: 'Which variable are you most uncertain about?',
      workshop_phase: input.modulePhase,
      status: ModuleStatus.canonical
    }
  });

  return { topic, claim, module };
}

async function main() {
  const sourceSca = await prisma.source.create({
    data: {
      title: 'Specialty Coffee Association Learning Resources',
      source_type: SourceType.standards_body,
      author_or_org: 'Specialty Coffee Association',
      citation_text: 'SCA foundational training references',
      url_or_local_ref: 'https://sca.coffee',
      source_quality_tier: SourceQualityTier.A,
      access_date: new Date()
    }
  });

  const sourceBh = await prisma.source.create({
    data: {
      title: 'Barista Hustle educational articles',
      source_type: SourceType.educator,
      author_or_org: 'Barista Hustle',
      citation_text: 'Applied barista training heuristics and measurements',
      url_or_local_ref: 'https://www.baristahustle.com',
      source_quality_tier: SourceQualityTier.B,
      access_date: new Date()
    }
  });

  const packs = await Promise.all([
    createTopicPack({
      slug: 'coffee_history_context',
      display: 'Coffee History & Specialty Context',
      summary: 'Short teachable history with labor/trade context.',
      canonical:
        'Coffee history in training should include origin, colonial trade pathways, labor dynamics, and modern specialty quality framing without reducing complexity to a single narrative.',
      tradeoff: 'Compression aids pacing but risks oversimplification; nuance improves ethics and context but uses time.',
      beginnerView: 'Use a 10-15 minute history arc and be explicit about what is simplified.',
      moduleTitle: 'Coffee History in 15 Minutes',
      moduleType: ModuleType.concept,
      modulePhase: WorkshopPhase.slide_heavy,
      sequence: 1
    }),
    createTopicPack({
      slug: 'extraction_fundamentals',
      display: 'Extraction Fundamentals',
      summary: 'Extraction as process + sensory outcomes.',
      canonical:
        'Extraction outcomes should be interpreted by combining process variables and cup results; single-metric optimization often fails across coffees and contexts.',
      tradeoff: 'Tighter targets improve repeatability but can hide sensory nuance.',
      beginnerView: 'Start with a repeatable recipe, then adjust one variable at a time.',
      moduleTitle: 'Extraction Basics that Transfer',
      moduleType: ModuleType.concept,
      modulePhase: WorkshopPhase.slide_heavy,
      sequence: 2
    }),
    createTopicPack({
      slug: 'espresso_basics',
      display: 'Espresso Fundamentals',
      summary: 'Dose, yield, time, and taste interpretation.',
      canonical:
        'Espresso dialing should prioritize clear taste goals, stable prep workflow, and explicit trade-offs between strength, extraction, clarity, and service consistency.',
      tradeoff: 'Ratio-first and time-first both work with explicit checks.',
      beginnerView: 'Use ratio-first for stability, then validate with flow/time and taste.',
      moduleTitle: 'Espresso Dial-In Foundations',
      moduleType: ModuleType.demonstration,
      modulePhase: WorkshopPhase.slide_heavy,
      sequence: 3
    }),
    createTopicPack({
      slug: 'grind_flow_tradeoffs',
      display: 'Grind, Flow, and Taste Trade-offs',
      summary: 'Grind setting and flow diagnostics.',
      canonical:
        'Grind changes resistance and extraction potential; distribution, puck prep, and grinder particle profile can dominate outcomes at equal nominal settings.',
      tradeoff: 'Finer may increase extraction/intensity but raise channel sensitivity; coarser may improve flow/clarity but risk thinness.',
      beginnerView: 'Interpret flow and taste together before changing grind.',
      moduleTitle: 'Grind as a Contextual Lever',
      moduleType: ModuleType.exercise,
      modulePhase: WorkshopPhase.hands_on,
      sequence: 4
    }),
    createTopicPack({
      slug: 'milk_texturing_basics',
      display: 'Milk Texturing Fundamentals',
      summary: 'Steaming phases and texture signals.',
      canonical:
        'Milk texturing should be taught as staged temperature and aeration control with explicit sensory and visual targets rather than one-size-fits-all pitcher choreography.',
      tradeoff: 'More detailed foam taxonomy improves diagnostics but can overwhelm beginners.',
      beginnerView: 'Teach stretch, roll, and stop cues with one cup target first.',
      moduleTitle: 'Milk Texturing Core Skills',
      moduleType: ModuleType.demonstration,
      modulePhase: WorkshopPhase.hands_on,
      sequence: 5
    }),
    createTopicPack({
      slug: 'barista_workflow_professionalism',
      display: 'Barista Workflow & Professionalism',
      summary: 'Workflow reliability and communication habits.',
      canonical:
        'Professional bar workflow combines repeatable prep standards, communication, and station hygiene to reduce variability and cognitive load under service pressure.',
      tradeoff: 'Strict standards improve consistency but need adaptation for different cafe realities.',
      beginnerView: 'Use checklists and role clarity to stabilize quality under pace.',
      moduleTitle: 'Workflow Under Pressure',
      moduleType: ModuleType.discussion,
      modulePhase: WorkshopPhase.recap,
      sequence: 6
    })
  ]);

  for (const pack of packs) {
    await prisma.claimSource.create({
      data: {
        claim_id: pack.claim.id,
        source_id: sourceSca.id,
        support_type: SupportType.indirect_support,
        excerpt_or_note: 'Consensus-aligned training framing.'
      }
    });

    await prisma.claimSource.create({
      data: {
        claim_id: pack.claim.id,
        source_id: sourceBh.id,
        support_type: SupportType.context_only,
        excerpt_or_note: 'Applied educator heuristics for bar workflow.'
      }
    });
  }

  const espressoWorkshopModules = packs.slice(0, 6).map((p) => p.module.id);

  await prisma.workshopTemplate.create({
    data: {
      slug: 'espresso-foundations-120',
      title: 'Espresso Foundations (2h)',
      description: 'Slide-heavy first hour, hands-on second hour.',
      default_duration_min: 120,
      intended_audience_range: 'beginner-intermediate',
      module_sequence: espressoWorkshopModules,
      mandatory_modules: [packs[1].module.id, packs[2].module.id, packs[3].module.id],
      optional_modules: [packs[0].module.id, packs[5].module.id],
      pacing_notes: 'Preserve first-hour conceptual grounding, second-hour practical reps.',
      status: 'canonical'
    }
  });

  await prisma.workshopTemplate.create({
    data: {
      slug: 'milk-and-workflow-90',
      title: 'Milk + Workflow Intensive (90m)',
      description: 'Reusable module subset for service-quality coaching.',
      default_duration_min: 90,
      intended_audience_range: 'beginner-advanced',
      module_sequence: [packs[4].module.id, packs[5].module.id],
      mandatory_modules: [packs[4].module.id],
      optional_modules: [packs[5].module.id],
      pacing_notes: 'Run more hands-on repetitions if group is small.',
      status: 'canonical'
    }
  });

  await prisma.feedbackNote.createMany({
    data: [
      {
        scope_type: 'global',
        scope_ref_id: 'global',
        note_text: 'Preserve multiple valid approaches when evidence supports them.',
        priority: 1,
        active: true
      },
      {
        scope_type: 'artifact_type',
        scope_ref_id: 'manual',
        note_text: 'Manuals should be outlines with pacing controls, not scripts.',
        priority: 1,
        active: true
      },
      {
        scope_type: 'artifact_type',
        scope_ref_id: 'slides',
        note_text: 'Slides should stay warm and encouraging while technically conservative.',
        priority: 1,
        active: true
      }
    ]
  });

  await prisma.expansionRequest.create({
    data: {
      requested_topic_text: 'AeroPress hybrid immersion-percolation teaching block',
      requested_by: 'operator',
      context_notes: 'Needed for future alternative brew pathway.',
      status: ExpansionStatus.queued
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
