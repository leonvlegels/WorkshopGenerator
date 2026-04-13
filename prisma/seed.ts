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

async function main() {
  await prisma.claimSource.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.source.deleteMany();
  await prisma.provisionalModule.deleteMany();
  await prisma.draftKnowledgeEntry.deleteMany();
  await prisma.researchBrief.deleteMany();
  await prisma.expansionRequest.deleteMany();
  await prisma.manualArtifact.deleteMany();
  await prisma.slideArtifact.deleteMany();
  await prisma.reviewEvent.deleteMany();
  await prisma.workshopStructure.deleteMany();
  await prisma.moduleTemplate.deleteMany();
  await prisma.teachingView.deleteMany();
  await prisma.canonicalEntry.deleteMany();
  await prisma.feedbackNote.deleteMany();
  await prisma.workshopTemplate.deleteMany();
  await prisma.topic.deleteMany();

  const sources = await Promise.all([
    prisma.source.create({
      data: {
        title: 'Specialty Coffee Association Education Resources',
        source_type: SourceType.standards_body,
        author_or_org: 'Specialty Coffee Association',
        citation_text: 'SCA foundational educational references',
        url_or_local_ref: 'https://sca.coffee',
        source_quality_tier: SourceQualityTier.A,
        access_date: new Date()
      }
    }),
    prisma.source.create({
      data: {
        title: 'Coffee Quality Institute references',
        source_type: SourceType.educator,
        author_or_org: 'Coffee Quality Institute',
        citation_text: 'CQI curriculum-related framing',
        url_or_local_ref: 'https://www.coffeeinstitute.org/',
        source_quality_tier: SourceQualityTier.B,
        access_date: new Date()
      }
    }),
    prisma.source.create({
      data: {
        title: 'Coffee Habits internal playbook',
        source_type: SourceType.internal_doc,
        author_or_org: 'Coffee Habits',
        citation_text: 'Internal training guide',
        url_or_local_ref: 'local://coffee-habits-playbook',
        source_quality_tier: SourceQualityTier.C,
        access_date: new Date()
      }
    })
  ]);

  const topicInputs = [
    ['coffee_history', 'Coffee History & Specialty Context'],
    ['extraction_fundamentals', 'Extraction Fundamentals'],
    ['espresso_fundamentals', 'Espresso Fundamentals'],
    ['grind_size', 'Grind Size & Flow'],
    ['milk_texturing', 'Milk Texturing Basics'],
    ['workflow_service', 'Barista Workflow & Professionalism']
  ];

  const topics = new Map<string, any>();
  for (const [slug, name] of topicInputs) {
    const topic = await prisma.topic.create({
      data: {
        slug,
        display_name: name,
        brew_method: slug === 'coffee_history' ? 'general' : 'espresso',
        equipment_context: 'general',
        canonical_status: CanonicalStatus.canonical,
        summary: `${name} canonical starter entry.`
      }
    });
    topics.set(slug, topic);
  }

  const claims = [
    {
      topic: 'extraction_fundamentals',
      text: 'Extraction outcomes depend on recipe, grind, flow conditions, and coffee properties.',
      strength: ClaimStrength.consensus,
      status: EvidenceStatus.supported,
      scope: ConsensusScope.broad
    },
    {
      topic: 'grind_size',
      text: 'Finer settings can increase resistance and extraction potential but may increase channel sensitivity.',
      strength: ClaimStrength.strong_heuristic,
      status: EvidenceStatus.supported,
      scope: ConsensusScope.moderate
    },
    {
      topic: 'espresso_fundamentals',
      text: 'Ratio-first and time-first approaches can both be valid, depending on context and goals.',
      strength: ClaimStrength.strong_heuristic,
      status: EvidenceStatus.mixed,
      scope: ConsensusScope.moderate
    },
    {
      topic: 'milk_texturing',
      text: 'Milk texturing quality is linked to stretch timing, whirlpooling, and target temperature management.',
      strength: ClaimStrength.consensus,
      status: EvidenceStatus.supported,
      scope: ConsensusScope.broad
    }
  ];

  for (const c of claims) {
    const claim = await prisma.claim.create({
      data: {
        topic_id: topics.get(c.topic).id,
        text: c.text,
        claim_strength: c.strength,
        evidence_status: c.status,
        consensus_scope: c.scope
      }
    });
    await prisma.claimSource.create({
      data: {
        claim_id: claim.id,
        source_id: sources[0].id,
        support_type: SupportType.direct_support,
        excerpt_or_note: 'Seed-level supporting linkage.'
      }
    });
  }

  for (const [slug, topic] of topics.entries()) {
    await prisma.canonicalEntry.create({
      data: {
        topic_id: topic.id,
        canonical_text: `${topic.display_name} canonical core. Preserve nuance and explicit trade-offs where evidence permits.`,
        ambiguity_notes: ['Avoid overstating precision in practical café environments.'],
        allowed_simplifications: ['Use clear diagnostic heuristics while preserving uncertainty labels.'],
        common_misconceptions: ['Single-variable thinking explains all outcomes.'],
        tradeoff_summary: 'Approach choices have context-specific gains and risks.',
        version: 1,
        approved_at: new Date(),
        level_baseline: AudienceLevel.intermediate
      }
    });

    for (const level of [AudienceLevel.beginner, AudienceLevel.intermediate, AudienceLevel.advanced]) {
      await prisma.teachingView.create({
        data: {
          topic_id: topic.id,
          audience_level: level,
          summary_text: `${topic.display_name} for ${level}.`,
          must_include_points: ['Core mechanism', 'Diagnostic mindset'],
          optional_depth_points: ['Measurement caveats', 'Contextual edge cases'],
          avoid_overstatement_points: ['Do not claim one universal recipe.'],
          tradeoff_table: {
            question: 'Which approach is best?',
            approach_a_name: 'Consistency-first',
            approach_a_best_for: 'Training repeatability',
            approach_a_risks: 'Can underfit unique coffees',
            approach_b_name: 'Adaptation-first',
            approach_b_best_for: 'Dynamic calibration',
            approach_b_risks: 'Can reduce team consistency',
            what_is_consensus: 'Track taste + process signals together.',
            what_depends: 'Coffee, grinder, equipment and service context.'
          },
          example_phrasings: ['This is a structured heuristic, not immutable law.']
        }
      });
    }
  }

  const moduleDefs = [
    ['coffee_history', 'Coffee History in 15 Minutes', ModuleType.concept, 10, WorkshopPhase.slide_heavy],
    ['extraction_fundamentals', 'Extraction Levers Overview', ModuleType.concept, 12, WorkshopPhase.slide_heavy],
    ['espresso_fundamentals', 'Espresso Ratio & Time Basics', ModuleType.demonstration, 14, WorkshopPhase.slide_heavy],
    ['grind_size', 'Grind Size as an Extraction Lever', ModuleType.exercise, 12, WorkshopPhase.hands_on],
    ['milk_texturing', 'Milk Stretch + Texture Control', ModuleType.exercise, 14, WorkshopPhase.hands_on],
    ['workflow_service', 'Workflow and Professional Mindset', ModuleType.discussion, 10, WorkshopPhase.recap],
    ['espresso_fundamentals', 'Troubleshooting Drill', ModuleType.troubleshooting, 10, WorkshopPhase.hands_on],
    ['extraction_fundamentals', 'Pacing Buffer', ModuleType.pacing_buffer, 8, WorkshopPhase.recap]
  ] as const;

  const moduleByTitle = new Map<string, any>();
  let order = 1;
  for (const [topicSlug, title, type, ideal, phase] of moduleDefs) {
    const module = await prisma.moduleTemplate.create({
      data: {
        topic_id: topics.get(topicSlug).id,
        module_type: type,
        title,
        objective: `Objective for ${title}`,
        canonical_core_ref: `${topicSlug}:v1`,
        default_sequence_order: order++,
        min_time_min: Math.max(6, ideal - 4),
        ideal_time_min: ideal,
        expandable_time_min: ideal + 5,
        cut_priority: type === ModuleType.pacing_buffer ? 5 : 2,
        prerequisites: [],
        suitable_levels: ['beginner', 'intermediate', 'advanced', 'professional'],
        must_cover_points: ['Core point 1', 'Core point 2'],
        optional_points: ['Optional nuance'],
        if_running_late: ['Keep one demo and one diagnosis checkpoint.'],
        if_extra_time: ['Run a second comparative tasting.'],
        practical_component: 'Hands-on cue card',
        slide_needs: 'Module headline + two bullets',
        visual_needs: 'Simple process diagram',
        recap_prompt: 'What changed in your decision tree?',
        qna_hooks: 'Where do you still feel uncertainty?',
        workshop_phase: phase,
        status: ModuleStatus.canonical
      }
    });
    moduleByTitle.set(title, module);
  }

  const fullWorkshopModules = [
    'Coffee History in 15 Minutes',
    'Extraction Levers Overview',
    'Espresso Ratio & Time Basics',
    'Grind Size as an Extraction Lever',
    'Milk Stretch + Texture Control',
    'Workflow and Professional Mindset',
    'Troubleshooting Drill',
    'Pacing Buffer'
  ].map((t) => moduleByTitle.get(t).id);

  await prisma.workshopTemplate.create({
    data: {
      slug: 'espresso-foundations-2h',
      title: 'Espresso Foundations (2h)',
      description: 'Slide-heavy first hour, hands-on second hour.',
      default_duration_min: 120,
      intended_audience_range: 'beginner-intermediate',
      module_sequence: fullWorkshopModules,
      mandatory_modules: fullWorkshopModules.slice(0, 6),
      optional_modules: fullWorkshopModules.slice(6),
      pacing_notes: 'Preserve recap + Q&A.',
      status: 'canonical'
    }
  });

  await prisma.workshopTemplate.create({
    data: {
      slug: 'milk-service-90',
      title: 'Milk + Service Block (90m)',
      description: 'Focused practical block with workflow emphasis.',
      default_duration_min: 90,
      intended_audience_range: 'beginner-professional',
      module_sequence: [moduleByTitle.get('Milk Stretch + Texture Control').id, moduleByTitle.get('Workflow and Professional Mindset').id],
      mandatory_modules: [moduleByTitle.get('Milk Stretch + Texture Control').id],
      optional_modules: [moduleByTitle.get('Workflow and Professional Mindset').id],
      pacing_notes: 'Use extra time for rep-based steaming.',
      status: 'draft'
    }
  });

  await prisma.feedbackNote.createMany({
    data: [
      {
        scope_type: 'global',
        scope_ref_id: 'global',
        note_text: 'Preserve multiple valid approaches with trade-off framing.',
        priority: 1,
        active: true
      },
      {
        scope_type: 'artifact_type',
        scope_ref_id: 'manual',
        note_text: 'Manual should be outline-oriented and avoid script tone.',
        priority: 2,
        active: true
      },
      {
        scope_type: 'artifact_type',
        scope_ref_id: 'slide',
        note_text: 'Slides should be warm and concise without presenter notes.',
        priority: 2,
        active: true
      }
    ]
  });

  const request = await prisma.expansionRequest.create({
    data: {
      requested_topic_text: 'V60 pour-over fundamentals',
      requested_by: 'operator',
      context_notes: 'Needed for future alternative brew method track.',
      status: ExpansionStatus.queued
    }
  });

  await prisma.researchBrief.create({
    data: {
      expansion_request_id: request.id,
      scope_text: 'V60 beginner-to-intermediate teaching baseline',
      proposed_questions: ['What consensus claims exist for pour-over flow control?', 'Which claims are heuristic only?'],
      proposed_source_types: ['standards_body', 'educator', 'official_doc'],
      risk_notes: 'Clearly separate consensus extraction principles from recipe dogma.',
      status: 'draft'
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
