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

async function seedTopicWithKnowledge(input: {
  slug: string;
  displayName: string;
  summary: string;
  canonicalText: string;
  tradeoff: string;
  ambiguity: string[];
  teachingBeginner: string;
}) {
  const topic = await prisma.topic.create({
    data: {
      slug: input.slug,
      display_name: input.displayName,
      brew_method: 'espresso',
      equipment_context: 'general',
      canonical_status: CanonicalStatus.canonical,
      summary: input.summary
    }
  });

  await prisma.canonicalEntry.create({
    data: {
      topic_id: topic.id,
      canonical_text: input.canonicalText,
      level_baseline: AudienceLevel.intermediate,
      ambiguity_notes: input.ambiguity,
      allowed_simplifications: ['Keep cause/effect directional, not absolute.'],
      common_misconceptions: ['Single-metric diagnosis is enough.'],
      tradeoff_summary: input.tradeoff,
      version: 1,
      approved_at: new Date()
    }
  });

  await prisma.teachingView.create({
    data: {
      topic_id: topic.id,
      audience_level: AudienceLevel.beginner,
      summary_text: input.teachingBeginner,
      must_include_points: ['State consensus clearly.', 'Label what depends.'],
      optional_depth_points: ['Discuss mechanism nuance if time allows.'],
      avoid_overstatement_points: ['Avoid universal numeric promises.'],
      tradeoff_table: {
        question: `How to teach ${input.displayName} without dogma?`,
        approach_a_name: 'Simple rule-first',
        approach_a_best_for: 'Fast onboarding',
        approach_a_risks: 'Overgeneralization',
        approach_b_name: 'Trade-off-first',
        approach_b_best_for: 'Transferable reasoning',
        approach_b_risks: 'Higher cognitive load',
        what_is_consensus: 'Core mechanism and directional effects.',
        what_depends: 'Coffee, equipment, and service context.'
      },
      example_phrasings: ['Use this as a starting hypothesis, then taste and observe.']
    }
  });

  const claim = await prisma.claim.create({
    data: {
      topic_id: topic.id,
      text: `${input.displayName} meaningfully influences cup outcomes in espresso workflows.`,
      claim_strength: ClaimStrength.strong_heuristic,
      evidence_status: EvidenceStatus.supported,
      consensus_scope: ConsensusScope.moderate
    }
  });

  const source = await prisma.source.findFirst({ where: { title: 'Specialty Coffee Association Education Standards' } });
  if (source) {
    await prisma.claimSource.create({
      data: {
        claim_id: claim.id,
        source_id: source.id,
        support_type: SupportType.indirect_support,
        excerpt_or_note: 'Used as standards-aligned framing reference.'
      }
    });
  }

  return topic;
}

async function main() {
  await prisma.source.createMany({
    data: [
      {
        title: 'Specialty Coffee Association Education Standards',
        source_type: SourceType.standards_body,
        author_or_org: 'Specialty Coffee Association',
        citation_text: 'SCA standards and introductory curriculum references',
        url_or_local_ref: 'https://sca.coffee',
        source_quality_tier: SourceQualityTier.A,
        access_date: new Date()
      },
      {
        title: 'Coffee Quality Institute - Processing Resources',
        source_type: SourceType.educator,
        author_or_org: 'Coffee Quality Institute',
        citation_text: 'CQI educational processing resources',
        url_or_local_ref: 'https://www.coffeeinstitute.org',
        source_quality_tier: SourceQualityTier.B,
        access_date: new Date()
      },
      {
        title: 'Internal Coffee Habits Training Notes',
        source_type: SourceType.internal_doc,
        author_or_org: 'Coffee Habits',
        citation_text: 'Internal operator notes from prior workshops',
        url_or_local_ref: 'internal://training-notes',
        source_quality_tier: SourceQualityTier.C,
        access_date: new Date()
      }
    ]
  });

  const coffeeHistory = await seedTopicWithKnowledge({
    slug: 'coffee_history_overview',
    displayName: 'Coffee History Overview',
    summary: 'Compressed history context including trade, labor, and specialty movement.',
    canonicalText:
      'Coffee history education should include origin geographies, colonial trade dynamics, labor realities, and the modern specialty quality movement without romantic simplification.',
    tradeoff: 'Compression improves pacing but risks erasing labor context; detail improves integrity but consumes workshop time.',
    ambiguity: ['Depth needed depends on audience goals and available time.'],
    teachingBeginner: 'Give a concise timeline, then connect history to present-day quality and ethics choices.'
  });

  const extraction = await seedTopicWithKnowledge({
    slug: 'extraction_fundamentals',
    displayName: 'Extraction Fundamentals',
    summary: 'Extraction as contact, dissolution, and sensory interpretation under constraints.',
    canonicalText:
      'Extraction in espresso is governed by resistance, contact conditions, and dissolved material transfer; useful diagnosis combines taste, flow behavior, and recipe context.',
    tradeoff:
      'Pursuing higher extraction can improve intensity/clarity but can amplify bitterness or channel sensitivity depending on prep and coffee.',
    ambiguity: ['No single extraction metric can fully predict cup quality.'],
    teachingBeginner: 'Use taste + flow together; avoid single-number certainty.'
  });

  const espresso = await seedTopicWithKnowledge({
    slug: 'espresso_basics',
    displayName: 'Espresso Basics',
    summary: 'Dose-yield-time framing and adjustment logic.',
    canonicalText:
      'Dose-yield ratio defines beverage concentration context; time and flow inform diagnosis but should not replace sensory evaluation.',
    tradeoff: 'Ratio-first supports flavor targets; time-first can speed service calibration but may hide recipe mismatch.',
    ambiguity: ['Preferred adjustment order varies by bar workflow and coffee lineup.'],
    teachingBeginner: 'Teach a stable baseline recipe, then adjust with explicit trade-off language.'
  });

  const grind = await seedTopicWithKnowledge({
    slug: 'grind_size_flow_tradeoffs',
    displayName: 'Grind Size / Flow / Taste Trade-offs',
    summary: 'Grind and distribution as major extraction levers.',
    canonicalText:
      'Grind changes resistance and extraction potential; distribution, fines behavior, and puck prep can dominate results at equal nominal settings.',
    tradeoff: 'Finer may increase intensity and extraction but also channel risk; coarser may improve flow and clarity but risk thinness/sourness.',
    ambiguity: ['Cross-grinder comparisons are not directly transferable.'],
    teachingBeginner: 'Interpret grind through both sensory and flow diagnostics.'
  });

  const milk = await seedTopicWithKnowledge({
    slug: 'milk_texturing_basics',
    displayName: 'Milk Texturing Basics',
    summary: 'Steaming phases, texture targets, and pouring readiness.',
    canonicalText:
      'Milk steaming involves controlled aeration and integration phases; target texture depends on beverage style and service expectations.',
    tradeoff: 'More aeration can boost sweetness/body but may reduce precision for fine pour patterns.',
    ambiguity: ['Target temperature and texture vary by milk type and house style.'],
    teachingBeginner: 'Teach clear phase cues and reinforce repeatable pitcher workflow.'
  });

  const workflow = await seedTopicWithKnowledge({
    slug: 'barista_workflow_mindset',
    displayName: 'Barista Workflow & Mindset',
    summary: 'Professional workflow, communication, and iterative diagnosis.',
    canonicalText:
      'Professional bar workflow balances quality, speed, communication, and repeatability; diagnosis should be explicit, not intuitive-only.',
    tradeoff: 'Strict routines improve consistency but may reduce adaptability unless reflection loops are built in.',
    ambiguity: ['Station design and team staffing materially change best practices.'],
    teachingBeginner: 'Use checklists early, then teach controlled adaptation.'
  });

  const modules = await prisma.$transaction([
    prisma.moduleTemplate.create({
      data: {
        topic_id: coffeeHistory.id,
        module_type: ModuleType.concept,
        title: 'Coffee History in 15 Minutes',
        objective: 'Provide accurate compressed context for specialty coffee.',
        canonical_core_ref: 'coffee_history_overview:v1',
        default_sequence_order: 1,
        min_time_min: 10,
        ideal_time_min: 15,
        expandable_time_min: 18,
        cut_priority: 3,
        prerequisites: [],
        suitable_levels: ['beginner', 'intermediate'],
        must_cover_points: ['Origin and trade context', 'Labor and value chain framing'],
        optional_points: ['Detailed timeline of specialty institutions'],
        if_running_late: ['Keep labor and trade context, trim institution chronology'],
        if_extra_time: ['Add local sourcing and transparency examples'],
        practical_component: 'Short discussion prompt on ethical sourcing claims.',
        slide_needs: 'Timeline slide + trade map.',
        visual_needs: 'Global coffee belt map.',
        recap_prompt: 'What part of coffee history still affects today’s bar?',
        qna_hooks: 'How do sourcing claims connect to real labor conditions?',
        workshop_phase: WorkshopPhase.slide_heavy,
        status: ModuleStatus.canonical
      }
    }),
    prisma.moduleTemplate.create({
      data: {
        topic_id: extraction.id,
        module_type: ModuleType.concept,
        title: 'Extraction Fundamentals',
        objective: 'Build diagnostic mental model for extraction.',
        canonical_core_ref: 'extraction_fundamentals:v1',
        default_sequence_order: 2,
        min_time_min: 12,
        ideal_time_min: 16,
        expandable_time_min: 20,
        cut_priority: 1,
        prerequisites: [],
        suitable_levels: ['beginner', 'intermediate', 'advanced'],
        must_cover_points: ['Taste + flow interpreted together', 'Consensus vs heuristic distinction'],
        optional_points: ['Basic TDS/equilibrium caveats'],
        if_running_late: ['Skip TDS tangent'],
        if_extra_time: ['Compare two calibration pathways'],
        practical_component: 'Side-by-side shot tasting diagnostic.',
        slide_needs: 'Extraction spectrum + flow chart.',
        visual_needs: 'Taste axis diagram.',
        recap_prompt: 'What signal changed your diagnosis today?',
        qna_hooks: 'When do we trust flow more than taste and why?',
        workshop_phase: WorkshopPhase.slide_heavy,
        status: ModuleStatus.canonical
      }
    }),
    prisma.moduleTemplate.create({
      data: {
        topic_id: espresso.id,
        module_type: ModuleType.demonstration,
        title: 'Espresso Baseline Recipe + Adjustment',
        objective: 'Teach baseline setup and ratio/time adjustment trade-offs.',
        canonical_core_ref: 'espresso_basics:v1',
        default_sequence_order: 3,
        min_time_min: 14,
        ideal_time_min: 20,
        expandable_time_min: 25,
        cut_priority: 1,
        prerequisites: [],
        suitable_levels: ['beginner', 'intermediate', 'advanced', 'professional'],
        must_cover_points: ['Dose-yield baseline', 'Adjustment logic by trade-offs'],
        optional_points: ['Pressure/flow profiling intro'],
        if_running_late: ['Keep one adjustment pathway only'],
        if_extra_time: ['Demonstrate ratio-first vs time-first on same coffee'],
        practical_component: 'Live dial-in demonstration.',
        slide_needs: 'Recipe matrix slide.',
        visual_needs: 'Shot timer and yield chart.',
        recap_prompt: 'What would you change first and why?',
        qna_hooks: 'What changes when coffee age shifts?',
        workshop_phase: WorkshopPhase.hands_on,
        status: ModuleStatus.canonical
      }
    }),
    prisma.moduleTemplate.create({
      data: {
        topic_id: grind.id,
        module_type: ModuleType.exercise,
        title: 'Grind / Flow / Taste Lab',
        objective: 'Practice grind adjustment with explicit assumptions.',
        canonical_core_ref: 'grind_size_flow_tradeoffs:v1',
        default_sequence_order: 4,
        min_time_min: 14,
        ideal_time_min: 20,
        expandable_time_min: 28,
        cut_priority: 1,
        prerequisites: [],
        suitable_levels: ['beginner', 'intermediate', 'advanced', 'professional'],
        must_cover_points: ['Record assumptions before each adjustment', 'Track taste + flow together'],
        optional_points: ['Discuss PSD and grinder differences'],
        if_running_late: ['Cut second coffee comparison'],
        if_extra_time: ['Run a second grinder comparison'],
        practical_component: 'Small group dial-in exercise.',
        slide_needs: 'Observation log template slide.',
        visual_needs: 'Flow behavior reference chart.',
        recap_prompt: 'Which assumption was wrong and how did you detect it?',
        qna_hooks: 'How do you detect channeling vs recipe mismatch?',
        workshop_phase: WorkshopPhase.hands_on,
        status: ModuleStatus.canonical
      }
    }),
    prisma.moduleTemplate.create({
      data: {
        topic_id: milk.id,
        module_type: ModuleType.demonstration,
        title: 'Milk Texturing Fundamentals',
        objective: 'Teach repeatable steaming phases and texture targets.',
        canonical_core_ref: 'milk_texturing_basics:v1',
        default_sequence_order: 5,
        min_time_min: 12,
        ideal_time_min: 18,
        expandable_time_min: 24,
        cut_priority: 2,
        prerequisites: [],
        suitable_levels: ['beginner', 'intermediate'],
        must_cover_points: ['Stretch and integrate phases', 'Texture cues and corrections'],
        optional_points: ['Alternative milk caveats'],
        if_running_late: ['Focus on one milk type'],
        if_extra_time: ['Add pour pattern fundamentals'],
        practical_component: 'Steaming reps with instructor feedback.',
        slide_needs: 'Steaming phase checklist.',
        visual_needs: 'Milk texture visual ladder.',
        recap_prompt: 'Which cue told you to stop aeration?',
        qna_hooks: 'How does milk temp target vary by service style?',
        workshop_phase: WorkshopPhase.hands_on,
        status: ModuleStatus.canonical
      }
    }),
    prisma.moduleTemplate.create({
      data: {
        topic_id: workflow.id,
        module_type: ModuleType.recap,
        title: 'Workflow / Professional Mindset Recap',
        objective: 'Close with practical transfer and team communication habits.',
        canonical_core_ref: 'barista_workflow_mindset:v1',
        default_sequence_order: 6,
        min_time_min: 8,
        ideal_time_min: 12,
        expandable_time_min: 16,
        cut_priority: 3,
        prerequisites: [],
        suitable_levels: ['beginner', 'intermediate', 'advanced', 'professional'],
        must_cover_points: ['Consistent communication language', 'Iterative improvement loop'],
        optional_points: ['Shift handoff templates'],
        if_running_late: ['Deliver checklist summary only'],
        if_extra_time: ['Role-play handoff scenarios'],
        practical_component: 'Pair reflection and share-out.',
        slide_needs: 'Checklist + recap prompts.',
        visual_needs: 'Workflow board example.',
        recap_prompt: 'What one behavior changes tomorrow?',
        qna_hooks: 'How to coach without overcorrecting?',
        workshop_phase: WorkshopPhase.recap,
        status: ModuleStatus.canonical
      }
    })
  ]);

  const espresso2hSequence = [modules[1].id, modules[2].id, modules[3].id, modules[4].id, modules[5].id];

  await prisma.workshopTemplate.createMany({
    data: [
      {
        slug: 'espresso-foundations-2h',
        title: 'Espresso Foundations (2h)',
        description: 'First hour slide-heavy, second hour hands-on with calibration exercises.',
        default_duration_min: 120,
        intended_audience_range: 'beginner-intermediate',
        module_sequence: espresso2hSequence,
        mandatory_modules: [modules[1].id, modules[2].id, modules[3].id],
        optional_modules: [modules[4].id, modules[5].id],
        pacing_notes: 'Protect extraction + grind lab blocks; trim recap depth if late.',
        status: 'canonical'
      },
      {
        slug: 'coffee-foundations-90',
        title: 'Coffee Foundations (90m)',
        description: 'History + specialty context + extraction basics for new staff onboarding.',
        default_duration_min: 90,
        intended_audience_range: 'beginner',
        module_sequence: [modules[0].id, modules[1].id, modules[5].id],
        mandatory_modules: [modules[0].id, modules[1].id],
        optional_modules: [modules[5].id],
        pacing_notes: 'Keep labor context section concise but present.',
        status: 'canonical'
      }
    ]
  });

  await prisma.feedbackNote.createMany({
    data: [
      {
        scope_type: 'global',
        scope_ref_id: 'global',
        note_text: 'Preserve multiple valid approaches using trade-off language, not single-answer dogma.',
        priority: 1,
        active: true
      },
      {
        scope_type: 'artifact_type',
        scope_ref_id: 'manual',
        note_text: 'Manual should stay outline-style, not a scripted monologue.',
        priority: 2,
        active: true
      }
    ]
  });

  await prisma.expansionRequest.create({
    data: {
      requested_topic_text: 'V60 brew fundamentals',
      requested_by: 'operator',
      context_notes: 'Needed for post-v1 hand brew expansion.',
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
