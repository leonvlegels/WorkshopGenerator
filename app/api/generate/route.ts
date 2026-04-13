import { NextRequest, NextResponse } from 'next/server';
import { AudienceLevel } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { buildAssumptionLog, buildWorkshopSequence, StructureModuleInput } from '@/lib/generation';

const SelectedModuleSchema = z.object({
  moduleId: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  locked: z.boolean().optional(),
  enabled: z.boolean().optional()
});

const InputSchema = z.object({
  workshopTemplateId: z.string().min(1),
  title: z.string().min(3),
  totalDurationMin: z.coerce.number().min(30).max(480),
  groupSize: z.coerce.number().min(1),
  teachers: z.coerce.number().min(1),
  equipmentContext: z.string().min(2),
  selectedModules: z.string().min(2)
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const parsed = InputSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  let selectedModules: StructureModuleInput[] = [];
  try {
    const raw = JSON.parse(parsed.data.selectedModules);
    selectedModules = z.array(SelectedModuleSchema).parse(raw).map((x) => ({
      moduleId: x.moduleId,
      level: x.level as AudienceLevel,
      locked: x.locked,
      enabled: x.enabled
    }));
  } catch {
    return NextResponse.json({ error: 'Invalid module selection payload.' }, { status: 400 });
  }

  const template = await prisma.workshopTemplate.findUnique({ where: { id: parsed.data.workshopTemplateId } });
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const modules = await prisma.moduleTemplate.findMany({ where: { id: { in: selectedModules.map((m) => m.moduleId) } } });
  const sequence = buildWorkshopSequence({
    modules,
    selected: selectedModules,
    durationMin: parsed.data.totalDurationMin
  });

  const assumptionLog = buildAssumptionLog({
    durationMin: parsed.data.totalDurationMin,
    equipmentContext: parsed.data.equipmentContext,
    selectedLevels: selectedModules.filter((x) => x.enabled !== false).map((x) => x.level),
    unresolved: []
  });

  const structure = await prisma.workshopStructure.create({
    data: {
      workshop_template_id: parsed.data.workshopTemplateId,
      title: parsed.data.title,
      total_duration_min: parsed.data.totalDurationMin,
      review_state: 'draft_structure',
      operator_context_json: {
        groupSize: parsed.data.groupSize,
        teachers: parsed.data.teachers,
        equipmentContext: parsed.data.equipmentContext,
        selectedModules
      },
      generated_sequence_json: {
        ...sequence,
        assumption_log: assumptionLog
      }
    }
  });

  return NextResponse.redirect(new URL(`/workshops/${structure.id}`, req.url));
}
