import { PrismaClient, AudienceLevel, CanonicalStatus, ModuleStatus, ModuleType, SourceQualityTier, SourceType, ClaimStrength, EvidenceStatus, ConsensusScope, SupportType, ExpansionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const source = await prisma.source.create({
    data: {
      title: 'Specialty Coffee Association Education Standards',
      source_type: SourceType.standards_body,
      author_or_org: 'Specialty Coffee Association',
      citation_text: 'SCA education standards and foundational references',
      url_or_local_ref: 'https://sca.coffee',
      source_quality_tier: SourceQualityTier.A,
      access_date: new Date()
    }
  });

  const topic = await prisma.topic.create({
    data: {
      slug: 'grind_size',
      display_name: 'Grind Size',
      brew_method: 'espresso',
      equipment_context: 'general',
      canonical_status: CanonicalStatus.canonical,
      summary: 'Grind size and particle distribution as extraction levers.'
    }
  });

  const claim = await prisma.claim.create({
    data: {
      topic_id: topic.id,
      text: 'Grind size changes flow resistance and extraction behavior.',
      claim_strength: ClaimStrength.consensus,
      evidence_status: EvidenceStatus.supported,
      consensus_scope: ConsensusScope.broad
    }
  });

  await prisma.claimSource.create({
    data: {
      claim_id: claim.id,
      source_id: source.id,
      support_type: SupportType.direct_support,
      excerpt_or_note: 'Core extraction framing used in intro curricula.'
    }
  });

  await prisma.canonicalEntry.create({
    data: {
      topic_id: topic.id,
      canonical_text:
        'Grind size changes flow resistance, contact conditions, extraction rate, and sensory profile. Particle size distribution and puck prep can dominate outcomes.',
      ambiguity_notes: JSON.stringify([
        'Distribution and fines can matter as much as average size.',
        'Different grinders produce different distributions at similar settings.'
      ]),
      allowed_simplifications: JSON.stringify(['Finer generally increases resistance.', 'Interpret flow and taste together.']),
      common_misconceptions: JSON.stringify(['Finer is always better.', 'Time alone diagnoses extraction quality.']),
      tradeoff_summary:
        'Finer can raise extraction and intensity but increase channel risk; coarser can improve flow and clarity but risk thinness.',
      version: 1,
      approved_at: new Date(),
      level_baseline: AudienceLevel.intermediate
    }
  });

  await prisma.teachingView.create({
    data: {
      topic_id: topic.id,
      audience_level: AudienceLevel.beginner,
      summary_text: 'Use grind as one major lever, then verify with taste and flow together.',
      must_include_points: JSON.stringify(['Grind affects flow and extraction.', 'No single best grind in all contexts.']),
      optional_depth_points: JSON.stringify(['Grinder-dependent particle distribution.']),
      avoid_overstatement_points: JSON.stringify(['Do not promise fixed brew time targets.']),
      tradeoff_table: JSON.stringify({
        question: 'How should we adjust espresso shot performance?',
        approach_a_name: 'Ratio-first',
        approach_a_best_for: 'Stable sensory targets',
        approach_a_risks: 'Can ignore time/flow diagnosis.',
        approach_b_name: 'Time-first',
        approach_b_best_for: 'Fast service calibration',
        approach_b_risks: 'Can hide recipe mismatch.',
        what_is_consensus: 'Taste and extraction indicators should be combined.',
        what_depends: 'Coffee age, roast level, and grinder behavior.'
      }),
      example_phrasings: JSON.stringify(['Finer or coarser is not moral; it is contextual.'])
    }
  });

  const module = await prisma.moduleTemplate.create({
    data: {
      topic_id: topic.id,
      module_type: ModuleType.concept,
      title: 'Grind Size as an Extraction Lever',
      objective: 'Teach grind as a contextual control variable.',
      canonical_core_ref: 'grind_size:v1',
      default_sequence_order: 1,
      min_time_min: 6,
      ideal_time_min: 10,
      expandable_time_min: 14,
      cut_priority: 2,
      prerequisites: JSON.stringify([]),
      suitable_levels: JSON.stringify(['beginner', 'intermediate', 'advanced', 'professional']),
      must_cover_points: JSON.stringify(['Finer/coarser is contextual.', 'Taste and flow interpreted together.']),
      optional_points: JSON.stringify(['Particle distribution nuance.']),
      if_running_late: JSON.stringify(['Skip grinder-design tangent.']),
      if_extra_time: JSON.stringify(['Compare two coffees with same target ratio.']),
      practical_component: 'Dial-in comparison exercise.',
      slide_needs: 'Flow chart and extraction spectrum slide.',
      visual_needs: 'Particle distribution diagram.',
      recap_prompt: 'What signal told you to move finer/coarser?',
      qna_hooks: 'When does bitterness come from channeling versus over-extraction?',
      workshop_phase: 'slide-heavy',
      status: ModuleStatus.canonical
    }
  });

  await prisma.workshopTemplate.create({
    data: {
      slug: 'espresso-foundations-120',
      title: 'Espresso Foundations for Beginners',
      description: 'Slide-heavy first hour, hands-on second hour.',
      default_duration_min: 120,
      intended_audience_range: 'beginner-intermediate',
      module_sequence: JSON.stringify([module.id]),
      mandatory_modules: JSON.stringify([module.id]),
      optional_modules: JSON.stringify([]),
      pacing_notes: 'Reserve 10 min Q&A and troubleshooting.',
      status: 'canonical'
    }
  });

  await prisma.feedbackNote.create({
    data: {
      scope_type: 'global',
      scope_ref_id: 'global',
      note_text: 'Do not flatten trade-offs into single dogmatic rules.',
      priority: 1,
      active: true
    }
  });

  await prisma.expansionRequest.create({
    data: {
      requested_topic_text: 'AeroPress immersion/percolation hybrid',
      requested_by: 'operator',
      context_notes: 'Needed for later v2 alternative brew module.',
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
