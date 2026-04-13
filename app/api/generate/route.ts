import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ArtifactStatus, WorkshopPhase } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildAssumptionLog, buildManualMarkdown, buildWorkshopSequence } from '@/lib/generation';

const InputSchema = z.object({
  workshopTemplateId: z.string().min(1),
  title: z.string().min(3),
  totalDurationMin: z.coerce.number().min(30).max(480),
  groupSize: z.coerce.number().min(1),
  teachers: z.coerce.number().min(1),
  equipmentContext: z.string().min(2),
  audienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional'])
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

  const modules = await prisma.moduleTemplate.findMany({ where: { status: 'canonical' } });
  const views = await prisma.teachingView.findMany({ where: { audience_level: input.audienceLevel } });
  const canonicals = await prisma.canonicalEntry.findMany({ where: { approved_at: { not: null } } });
  const feedback = await prisma.feedbackNote.findMany({ where: { active: true }, orderBy: { priority: 'asc' } });

  const sequence = buildWorkshopSequence(modules, input.totalDurationMin);
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

  const manual = buildManualMarkdown({ title: input.title, sequence, views, canonicals, feedback });

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
      slide_json: {
        title: input.title,
        sections: sequence.modules.map((m) => ({
          heading: m.module_title,
          type: m.module_type,
          phase: humanizePhase(m.workshop_phase as WorkshopPhase)
        }))
      },
      preview_markdown: `# ${input.title}\n\n- Warm, technical, encouraging tone\n- First hour slide-heavy, second hour practical\n- Include recap and final Q&A`,
      assumption_log: assumptionLog,
      status: ArtifactStatus.draft
    }
  });

  return NextResponse.redirect(new URL(`/workshops/${structure.id}`, req.url));
}

function humanizePhase(phase: WorkshopPhase) {
  if (phase === WorkshopPhase.slide_heavy) return 'slide-heavy';
  if (phase === WorkshopPhase.hands_on) return 'hands-on';
  return 'recap';
}
