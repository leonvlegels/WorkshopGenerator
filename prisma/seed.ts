import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.claimSource.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.source.deleteMany();
  await prisma.teachingView.deleteMany();
  await prisma.canonicalEntry.deleteMany();
  await prisma.workshopTemplateModule.deleteMany();
  await prisma.moduleTemplate.deleteMany();
  await prisma.workshopTemplate.deleteMany();
  await prisma.topic.deleteMany();

  const topics = await Promise.all([
    prisma.topic.create({ data: { slug: 'coffee_history', displayName: 'Coffee History Overview', brewMethod: 'general', equipmentContext: 'general', canonicalStatus: 'canonical', summary: 'Compressed history including labor and trade context.' } }),
    prisma.topic.create({ data: { slug: 'specialty_coffee', displayName: 'Specialty Coffee Foundations', brewMethod: 'general', equipmentContext: 'general', canonicalStatus: 'canonical', summary: 'Specialty framework and quality language.' } }),
    prisma.topic.create({ data: { slug: 'freshness_storage', displayName: 'Freshness and Storage', brewMethod: 'general', equipmentContext: 'general', canonicalStatus: 'canonical', summary: 'Roast age and storage impacts.' } }),
    prisma.topic.create({ data: { slug: 'extraction_fundamentals', displayName: 'Extraction Fundamentals', brewMethod: 'espresso', equipmentContext: 'general', canonicalStatus: 'canonical', summary: 'Strength, extraction, flow resistance, and sensory interpretation.' } }),
    prisma.topic.create({ data: { slug: 'espresso_fundamentals', displayName: 'Espresso Fundamentals', brewMethod: 'espresso', equipmentContext: 'machine', canonicalStatus: 'canonical', summary: 'Dose/yield/time and diagnosis.' } }),
    prisma.topic.create({ data: { slug: 'milk_texturing', displayName: 'Milk Texturing Fundamentals', brewMethod: 'espresso', equipmentContext: 'steam_wand', canonicalStatus: 'canonical', summary: 'Steaming phases and texture signals.' } }),
    prisma.topic.create({ data: { slug: 'workflow_professionalism', displayName: 'Workflow and Professionalism', brewMethod: 'general', equipmentContext: 'bar', canonicalStatus: 'canonical', summary: 'Service flow and repeatability.' } }),
    prisma.topic.create({ data: { slug: 'troubleshooting', displayName: 'Troubleshooting Block', brewMethod: 'espresso', equipmentContext: 'general', canonicalStatus: 'canonical', summary: 'Taste/flow diagnosis and fixes.' } })
  ]);

  const source = await prisma.source.create({
    data: {
      title: 'Coffee Habits Internal Curriculum Notes',
      sourceType: 'internal_doc',
      authorOrOrg: 'Coffee Habits',
      sourceQualityTier: 'B',
      citationText: 'Coffee Habits internal educator standards v1',
      accessDate: new Date()
    }
  });

  for (const topic of topics) {
    const claim = await prisma.claim.create({
      data: {
        topicId: topic.id,
        text: `${topic.displayName} should preserve consensus claims and annotate trade-offs where multiple valid approaches exist.`,
        claimStrength: 'consensus',
        evidenceStatus: 'supported',
        consensusScope: 'broad'
      }
    });

    await prisma.claimSource.create({
      data: {
        claimId: claim.id,
        sourceId: source.id,
        supportType: 'direct_support',
        excerptOrNote: 'Internal standards emphasize explicit uncertainty and diagnostics.'
      }
    });

    await prisma.canonicalEntry.create({
      data: {
        topicId: topic.id,
        canonicalText: `${topic.displayName} canonical core: provide dense, technical explanation while preserving valid trade-off spaces rather than single-answer dogma.`,
        ambiguityNotes: JSON.stringify(['Context and equipment can alter optimal decision boundaries.']),
        allowedSimplifications: JSON.stringify(['Use one primary lever at a time for beginner framing.']),
        commonMisconceptions: JSON.stringify(['Single-variable causality explains everything.']),
        tradeoffSummary: 'There are usually at least two workable approaches; preference depends on goals and constraints.',
        levelBaseline: 'intermediate',
        approvedAt: new Date()
      }
    });

    await prisma.teachingView.create({
      data: {
        topicId: topic.id,
        audienceLevel: 'beginner',
        summaryText: `${topic.displayName} in practical language for novice operators.`,
        mustIncludePoints: JSON.stringify(['Name the variable', 'Name the expected sensory effect', 'State what remains uncertain']),
        optionalDepthPoints: JSON.stringify(['Mechanistic edge cases by grinder and coffee age']),
        avoidOverstatementPoints: JSON.stringify(['Avoid universal claims without context']),
        tradeoffTable: JSON.stringify({
          question: 'Which adjustment order is best?',
          approach_a_name: 'ratio-first',
          approach_a_best_for: 'clean baseline diagnosis',
          approach_a_risks: 'can underreact to flow anomalies',
          approach_b_name: 'time-first',
          approach_b_best_for: 'busy bar speed',
          approach_b_risks: 'can hide dose/yield mismatch',
          what_is_consensus: 'both are valid with clear intent',
          what_depends: 'equipment, grinder consistency, service context'
        }),
        examplePhrasings: JSON.stringify(['Try this first, then evaluate taste + flow together.'])
      }
    });
  }

  const modulePayload = [
    { topic: 'coffee_history', title: 'Coffee History in 15 Minutes', type: 'concept', min: 10, ideal: 15, exp: 20, cut: 1, phase: 'slide_heavy' },
    { topic: 'specialty_coffee', title: 'Specialty Coffee Framework', type: 'concept', min: 8, ideal: 12, exp: 16, cut: 1, phase: 'slide_heavy' },
    { topic: 'freshness_storage', title: 'Roast, Freshness, and Storage', type: 'concept', min: 8, ideal: 10, exp: 14, cut: 2, phase: 'slide_heavy' },
    { topic: 'extraction_fundamentals', title: 'Extraction Fundamentals', type: 'concept', min: 10, ideal: 14, exp: 18, cut: 1, phase: 'slide_heavy' },
    { topic: 'espresso_fundamentals', title: 'Espresso Ratio and Diagnosis', type: 'demonstration', min: 12, ideal: 18, exp: 24, cut: 1, phase: 'hands_on' },
    { topic: 'milk_texturing', title: 'Milk Texturing Fundamentals', type: 'exercise', min: 12, ideal: 16, exp: 24, cut: 2, phase: 'hands_on' },
    { topic: 'workflow_professionalism', title: 'Workflow and Professionalism', type: 'discussion', min: 8, ideal: 12, exp: 16, cut: 3, phase: 'hands_on' },
    { topic: 'troubleshooting', title: 'Troubleshooting Scenarios', type: 'troubleshooting', min: 12, ideal: 16, exp: 20, cut: 1, phase: 'recap' }
  ] as const;

  const modules = [];
  for (const item of modulePayload) {
    const topic = topics.find((t) => t.slug === item.topic)!;
    const created = await prisma.moduleTemplate.create({
      data: {
        topicId: topic.id,
        moduleType: item.type,
        title: item.title,
        objective: `Enable operator to teach ${topic.displayName} with practical diagnostic cues.`,
        canonicalCoreRef: topic.slug,
        defaultSequenceOrder: modules.length + 1,
        minTimeMin: item.min,
        idealTimeMin: item.ideal,
        expandableTimeMin: item.exp,
        cutPriority: item.cut,
        prerequisites: JSON.stringify([]),
        suitableLevels: JSON.stringify(['beginner', 'intermediate', 'advanced', 'professional']),
        workshopPhase: item.phase,
        mustCoverPoints: JSON.stringify(['State the core variable.', 'Include one trade-off.', 'Name one common misconception.']),
        optionalPoints: JSON.stringify(['Include grinder-specific nuance if time permits.']),
        ifRunningLate: JSON.stringify(['Drop optional tangent content first.']),
        ifExtraTime: JSON.stringify(['Run paired tasting comparison.']),
        practicalComponent: 'Hands-on diagnosis where relevant.',
        slideNeeds: '1-2 anchor visuals + one checklist slide.',
        visualNeeds: 'Flow/percolation diagram for extraction blocks.',
        recapPrompt: 'What changed, why, and what remains uncertain?',
        qnaHooks: 'What would you change first on your bar?',
        status: 'canonical'
      }
    });
    modules.push(created);
  }

  const template = await prisma.workshopTemplate.create({
    data: {
      slug: 'espresso-foundations-beginner',
      title: 'Espresso Foundations for Beginners',
      description: 'Slide-heavy first hour and hands-on second hour for beginner espresso classes.',
      defaultDurationMin: 120,
      intendedAudienceRange: 'beginner to intermediate',
      moduleSequence: JSON.stringify(modules.map((m) => m.id)),
      mandatoryModules: JSON.stringify(modules.slice(0, 5).map((m) => m.id)),
      optionalModules: JSON.stringify(modules.slice(5).map((m) => m.id)),
      pacingNotes: 'First hour slide-heavy. Second hour practical reps with sparse reminder slides.',
      status: 'canonical'
    }
  });

  for (let i = 0; i < modules.length; i += 1) {
    await prisma.workshopTemplateModule.create({
      data: {
        workshopTemplateId: template.id,
        moduleTemplateId: modules[i].id,
        sequenceOrder: i + 1,
        isMandatory: i < 5
      }
    });
  }

  console.log('Seed complete.');
}

main().finally(() => prisma.$disconnect());
