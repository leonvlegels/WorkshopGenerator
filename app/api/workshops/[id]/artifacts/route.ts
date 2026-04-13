import { NextRequest, NextResponse } from 'next/server';
import { ArtifactStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildAssumptionLog, buildManualMarkdown, buildSlideJson, SequenceModule } from '@/lib/generation';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const workshop = await prisma.workshopStructure.findUnique({ where: { id: params.id } });
  if (!workshop) return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });

  const sequence = workshop.generated_sequence_json as { modules: SequenceModule[]; cut_order: string[] };
  const topicIds = [...new Set(sequence.modules.map((m) => m.topic_id))];
  const moduleIds = [...new Set(sequence.modules.map((m) => m.module_id))];

  const [views, canonicals, feedback] = await Promise.all([
    prisma.teachingView.findMany({ where: { topic_id: { in: topicIds } } }),
    prisma.canonicalEntry.findMany({ where: { topic_id: { in: topicIds }, approved_at: { not: null } } }),
    prisma.feedbackNote.findMany({
      where: {
        active: true,
        OR: [
          { scope_type: 'global', scope_ref_id: 'global' },
          { scope_type: 'artifact_type', scope_ref_id: 'manual' },
          { scope_type: 'artifact_type', scope_ref_id: 'slides' },
          { scope_type: 'workshop_template', scope_ref_id: workshop.workshop_template_id },
          { scope_type: 'topic', scope_ref_id: { in: topicIds } },
          { scope_type: 'module', scope_ref_id: { in: moduleIds } }
        ]
      },
      orderBy: { priority: 'asc' }
    })
  ]);

  const viewsByTopic = new Map<string, typeof views>();
  const canonicalsByTopic = new Map<string, typeof canonicals>();
  views.forEach((v) => viewsByTopic.set(v.topic_id, [...(viewsByTopic.get(v.topic_id) ?? []), v]));
  canonicals.forEach((c) => canonicalsByTopic.set(c.topic_id, [...(canonicalsByTopic.get(c.topic_id) ?? []), c]));

  const assumptions = buildAssumptionLog({
    selectedCount: sequence.modules.length,
    levelMix: sequence.modules.map((m) => m.level),
    equipment: String((workshop.operator_context_json as Record<string, unknown>).equipmentContext ?? ''),
    targetDurationMin: workshop.total_duration_min
  });

  const manual = buildManualMarkdown({
    title: workshop.title,
    totalDurationMin: workshop.total_duration_min,
    goals: ['Teach reliable espresso fundamentals with explicit trade-offs.', 'Support mixed-level participants by module-level framing.'],
    setupPrep: [
      `Group setup: ${String((workshop.operator_context_json as Record<string, unknown>).groupSize ?? 'unknown')}`,
      `Teacher count: ${String((workshop.operator_context_json as Record<string, unknown>).teachers ?? '1')}`,
      `Equipment: ${String((workshop.operator_context_json as Record<string, unknown>).equipmentContext ?? 'general station')}`
    ],
    sequence,
    viewsByTopic,
    canonicalsByTopic,
    feedback,
    assumptions
  });

  const slideJson = buildSlideJson({ title: workshop.title, sequence, totalDurationMin: workshop.total_duration_min });

  await prisma.manualArtifact.create({
    data: {
      workshop_structure_id: workshop.id,
      markdown_body: manual,
      generation_notes: 'Generated from edited workshop structure and canonical topic anchors.',
      assumption_log: assumptions,
      status: ArtifactStatus.draft
    }
  });

  await prisma.slideArtifact.create({
    data: {
      workshop_structure_id: workshop.id,
      slide_json: slideJson,
      preview_markdown: slideJson.slides
        .map((s) => `## ${String(s.heading)}\n- ${Array.isArray(s.bullets) ? s.bullets.join('\n- ') : ''}`)
        .join('\n\n'),
      assumption_log: assumptions,
      status: ArtifactStatus.draft
    }
  });

  await prisma.workshopStructure.update({ where: { id: workshop.id }, data: { review_state: 'artifacts_generated' } });

  return NextResponse.json({ ok: true });
}
