import { NextRequest, NextResponse } from 'next/server';
import { ArtifactStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildManualMarkdown, buildSlideDeck } from '@/lib/generation';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const workshop = await prisma.workshopStructure.findUnique({ where: { id: params.id } });
  if (!workshop) return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });

  const sequencePayload = workshop.generated_sequence_json as {
    modules: any[];
    cut_order: string[];
    assumption_log?: any;
  };

  const modules = await prisma.moduleTemplate.findMany({
    where: { id: { in: sequencePayload.modules.map((m) => m.module_id) } },
    include: { topic: true }
  });
  const topics = [...new Set(modules.map((m) => m.topic_id))];

  const [canonicals, feedback] = await Promise.all([
    prisma.canonicalEntry.findMany({ where: { topic_id: { in: topics }, approved_at: { not: null } } }),
    prisma.feedbackNote.findMany({ where: { active: true }, orderBy: { priority: 'asc' } })
  ]);

  const manual = buildManualMarkdown({
    title: workshop.title,
    durationMin: workshop.total_duration_min,
    workshopGoal: 'Build reliable diagnostic skills without flattening coffee trade-offs into dogma.',
    setupPrep: ['Calibrate grinders', 'Prepare tasting cups + water', 'Set baseline recipe for demo coffee'],
    sequence: {
      modules: sequencePayload.modules,
      cut_order: sequencePayload.cut_order,
      pacing_summary: { requested_total: workshop.total_duration_min, planned_total: workshop.total_duration_min }
    },
    assumptionLog: sequencePayload.assumption_log ?? {
      missing_input_assumptions: [],
      pacing_assumptions: [],
      level_assumptions: [],
      equipment_assumptions: [],
      unresolved_ambiguities: []
    },
    feedback
  });

  const slideDeck = buildSlideDeck({
    title: workshop.title,
    sequence: {
      modules: sequencePayload.modules,
      cut_order: sequencePayload.cut_order,
      pacing_summary: { requested_total: workshop.total_duration_min, planned_total: workshop.total_duration_min }
    }
  });

  await prisma.manualArtifact.create({
    data: {
      workshop_structure_id: workshop.id,
      markdown_body: manual,
      generation_notes: `Generated from ${canonicals.length} canonical entries with scoped feedback constraints.`,
      assumption_log: sequencePayload.assumption_log ?? {},
      status: ArtifactStatus.draft
    }
  });

  await prisma.slideArtifact.create({
    data: {
      workshop_structure_id: workshop.id,
      slide_json: slideDeck,
      preview_markdown: slideDeck.slides
        .map((s) => `## ${(s as any).title}\n${Array.isArray((s as any).bullets) ? (s as any).bullets.map((b: string) => `- ${b}`).join('\n') : ''}`)
        .join('\n\n'),
      assumption_log: sequencePayload.assumption_log ?? {},
      status: ArtifactStatus.draft
    }
  });

  await prisma.workshopStructure.update({ where: { id: workshop.id }, data: { review_state: 'artifacts_generated' } });

  return NextResponse.redirect(new URL(`/workshops/${workshop.id}`, req.url));
}
