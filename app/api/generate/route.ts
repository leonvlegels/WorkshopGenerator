import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ArtifactStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildAssumptionLog, buildManualMarkdown, buildSlideModel, buildWorkshopSequence } from '@/lib/generation';

const InputSchema = z.object({
  workshopTemplateId: z.string().min(1),
  title: z.string().min(3),
  totalDurationMin: z.coerce.number().min(30).max(480),
  groupSize: z.coerce.number().min(1),
  teachers: z.coerce.number().min(1),
  equipmentContext: z.string().min(2),
  audienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  moduleSelections: z.string().optional()
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const parsed = InputSchema.safeParse(Object.fromEntries(form.entries()));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;

  const template = await prisma.workshopTemplate.findUnique({ where: { id: input.workshopTemplateId } });
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const parsedSelection = input.moduleSelections ? JSON.parse(input.moduleSelections) : [];
  const selectedModuleIds = parsedSelection.map((x: { moduleId: string }) => x.moduleId);
  const moduleLevelMap = Object.fromEntries(
    parsedSelection.map((x: { moduleId: string; audienceLevel: string }) => [x.moduleId, x.audienceLevel])
  );

  const modules = await prisma.moduleTemplate.findMany({
    where: { status: 'canonical', ...(selectedModuleIds.length ? { id: { in: selectedModuleIds } } : {}) }
  });
  const views = await prisma.teachingView.findMany({
    where: { audience_level: { in: [...new Set(Object.values(moduleLevelMap).concat(input.audienceLevel))] as any } }
  });
  const canonicals = await prisma.canonicalEntry.findMany({ where: { approved_at: { not: null } } });
  const feedback = await prisma.feedbackNote.findMany({
    where: {
      active: true,
      OR: [
        { scope_type: 'global' },
        { scope_type: 'workshop_template', scope_ref_id: template.id },
        { scope_type: 'artifact_type', scope_ref_id: 'manual' },
        { scope_type: 'artifact_type', scope_ref_id: 'slide' },
        { scope_type: 'module', scope_ref_id: { in: modules.map((m) => m.id) } }
      ]
    },
    orderBy: { priority: 'asc' }
  });

  const sequence = buildWorkshopSequence(modules, input.totalDurationMin, moduleLevelMap);
  const assumptionLog = buildAssumptionLog({
    level: input.audienceLevel,
    equipment: input.equipmentContext,
    targetDurationMin: input.totalDurationMin
  });

  const structure = await prisma.workshopStructure.create({
    data: {
      workshop_template_id: input.workshopTemplateId,
      title: input.title,
      total_duration_min: input.totalDurationMin,
      review_state: 'pending',
      operator_context_json: {
        groupSize: input.groupSize,
        teachers: input.teachers,
        equipmentContext: input.equipmentContext,
        audienceLevel: input.audienceLevel
      },
      generated_sequence_json: sequence
    }
  });

  const manual = buildManualMarkdown({
    title: input.title,
    workshopGoal: 'Build foundational espresso understanding with explicit trade-off reasoning.',
    totalDurationMin: input.totalDurationMin,
    setupPrep: ['Prepare dial-in coffee + milk', 'Shot timers + scale ready', 'Tasting cups arranged by station'],
    sequence,
    views,
    canonicals,
    feedback,
    moduleDetails: modules,
    assumptions: assumptionLog
  });
  const slideModel = buildSlideModel({ title: input.title, sequence });

  await prisma.manualArtifact.create({
    data: {
      workshop_structure_id: structure.id,
      markdown_body: manual,
      generation_notes: 'Generated from canonical entries + teaching views + active feedback notes.',
      assumption_log: assumptionLog,
      status: ArtifactStatus.draft
    }
  });

  await prisma.slideArtifact.create({
    data: {
      workshop_structure_id: structure.id,
      slide_json: slideModel,
      preview_markdown: slideModel.slides
        .map((s: any, idx: number) => `## ${idx + 1}. ${s.title}\n- ${s.bullets.join('\n- ')}`)
        .join('\n\n'),
      assumption_log: assumptionLog,
      status: ArtifactStatus.draft
    }
  });

  return NextResponse.redirect(new URL(`/workshops/${structure.id}`, req.url));
}
