import { NextRequest, NextResponse } from 'next/server';
import { AudienceLevel } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { buildAssumptionLog, buildWorkshopSequence, ModuleSelection } from '@/lib/generation';

const SelectionSchema = z.array(
  z.object({
    moduleId: z.string(),
    enabled: z.boolean(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
    locked: z.boolean().optional(),
    plannedTimeMin: z.number().optional()
  })
);

const InputSchema = z.object({
  workshopTemplateId: z.string().min(1),
  title: z.string().min(3),
  totalDurationMin: z.coerce.number().min(30).max(480),
  groupSize: z.coerce.number().min(1),
  teachers: z.coerce.number().min(1),
  equipmentContext: z.string().min(2),
  specialGoals: z.string().optional(),
  moduleSelections: z.string().optional()
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const parsed = InputSchema.safeParse(Object.fromEntries(form.entries()));

  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const input = parsed.data;
  const template = await prisma.workshopTemplate.findUnique({ where: { id: input.workshopTemplateId } });
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const templateModuleIds = Array.isArray(template.module_sequence) ? (template.module_sequence as string[]) : [];
  const modules = await prisma.moduleTemplate.findMany({
    where: {
      id: templateModuleIds.length ? { in: templateModuleIds } : undefined,
      status: 'canonical'
    },
    orderBy: { default_sequence_order: 'asc' }
  });

  const parsedSelections = input.moduleSelections ? SelectionSchema.parse(JSON.parse(input.moduleSelections)) : [];
  const fallbackSelections: ModuleSelection[] = modules.map((m) => ({
    moduleId: m.id,
    enabled: true,
    level: AudienceLevel.beginner
  }));
  const selections = parsedSelections.length ? parsedSelections : fallbackSelections;

  const sequence = buildWorkshopSequence({ modules, selections, durationMin: input.totalDurationMin });

  const assumptionLog = buildAssumptionLog({
    selectedCount: selections.filter((s) => s.enabled).length,
    levelMix: selections.filter((s) => s.enabled).map((s) => s.level),
    equipment: input.equipmentContext,
    targetDurationMin: input.totalDurationMin
  });

  const structure = await prisma.workshopStructure.create({
    data: {
      workshop_template_id: input.workshopTemplateId,
      title: input.title,
      total_duration_min: input.totalDurationMin,
      review_state: 'draft',
      operator_context_json: {
        groupSize: input.groupSize,
        teachers: input.teachers,
        equipmentContext: input.equipmentContext,
        specialGoals: input.specialGoals || ''
      },
      generated_sequence_json: sequence
    }
  });

  await prisma.feedbackNote.create({
    data: {
      scope_type: 'artifact_type',
      scope_ref_id: 'workshop_structure',
      note_text: `Assumption log: ${assumptionLog.unresolved_ambiguities.join('; ')}`,
      priority: 5,
      active: true
    }
  });

  return NextResponse.redirect(new URL(`/workshops/${structure.id}`, req.url));
}
