import { NextRequest, NextResponse } from 'next/server';
import { ArtifactStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildAssumptionLog, buildManualMarkdown, buildSlideModel } from '@/lib/generation';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const structure = await prisma.workshopStructure.findUnique({ where: { id: params.id } });
  if (!structure) return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });

  const context = structure.operator_context_json as any;
  const sequence = structure.generated_sequence_json as any;

  const modules = await prisma.moduleTemplate.findMany({ where: { id: { in: sequence.modules.map((m: any) => m.module_id) } } });
  const canonicals = await prisma.canonicalEntry.findMany({ where: { approved_at: { not: null } } });
  const views = await prisma.teachingView.findMany();
  const feedback = await prisma.feedbackNote.findMany({ where: { active: true }, orderBy: { priority: 'asc' } });
  const assumptionLog = buildAssumptionLog({
    level: context.audienceLevel,
    equipment: context.equipmentContext,
    targetDurationMin: structure.total_duration_min
  });

  const manual = buildManualMarkdown({
    title: structure.title,
    totalDurationMin: structure.total_duration_min,
    setupPrep: ['Re-use saved station setup from structure context'],
    sequence,
    views,
    canonicals,
    feedback,
    moduleDetails: modules,
    assumptions: assumptionLog
  });
  const slideModel = buildSlideModel({ title: structure.title, sequence });

  await prisma.manualArtifact.create({
    data: {
      workshop_structure_id: structure.id,
      markdown_body: manual,
      generation_notes: 'Regenerated from edited structure',
      assumption_log: assumptionLog,
      status: ArtifactStatus.draft
    }
  });

  await prisma.slideArtifact.create({
    data: {
      workshop_structure_id: structure.id,
      slide_json: slideModel,
      preview_markdown: slideModel.slides.map((s: any) => `- ${s.title}`).join('\n'),
      assumption_log: assumptionLog,
      status: ArtifactStatus.draft
    }
  });

  return NextResponse.json({ ok: true });
}
