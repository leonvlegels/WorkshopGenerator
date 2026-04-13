import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildAssumptionLog, buildManualMarkdown, buildSlidePreview, buildWorkshopStructure } from '@/lib/generation';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  workshopTemplateId: z.string(),
  title: z.string().min(3),
  totalDurationMin: z.number().int().positive(),
  groupSize: z.number().int().positive(),
  numberOfTeachers: z.number().int().positive(),
  stations: z.string().min(1),
  targetLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  mandatoryModuleIds: z.array(z.string()),
  optionalModuleIds: z.array(z.string()),
  specialGoals: z.string().default('')
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const template = await prisma.workshopTemplate.findUnique({ where: { id: input.workshopTemplateId } });
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const linkRows = await prisma.workshopTemplateModule.findMany({
    where: { workshopTemplateId: template.id },
    include: { moduleTemplate: true }
  });

  const generationInput = {
    workshopTemplate: template,
    modules: linkRows.map((l) => l.moduleTemplate),
    title: input.title,
    totalDurationMin: input.totalDurationMin,
    groupSize: input.groupSize,
    numberOfTeachers: input.numberOfTeachers,
    stations: input.stations,
    targetLevel: input.targetLevel,
    mandatoryModuleIds: input.mandatoryModuleIds,
    optionalModuleIds: input.optionalModuleIds,
    specialGoals: input.specialGoals
  };

  const structure = buildWorkshopStructure(generationInput);
  const assumptionLog = buildAssumptionLog(generationInput);
  const manualBody = buildManualMarkdown(structure, assumptionLog);
  const slidePreview = buildSlidePreview(structure);

  const savedStructure = await prisma.workshopStructure.create({
    data: {
      workshopTemplateId: template.id,
      title: structure.title,
      operatorContextJson: JSON.stringify(input),
      generatedSequenceJson: JSON.stringify(structure),
      totalDurationMin: structure.totalDurationMin,
      reviewState: 'draft'
    }
  });

  const [manual, slides] = await Promise.all([
    prisma.manualArtifact.create({
      data: {
        workshopStructureId: savedStructure.id,
        markdownBody: manualBody,
        generationNotes: 'Generated from canonical entries, module templates, and level framing.',
        assumptionLog: JSON.stringify(assumptionLog),
        status: 'draft'
      }
    }),
    prisma.slideArtifact.create({
      data: {
        workshopStructureId: savedStructure.id,
        slideJson: JSON.stringify({ title: structure.title, modules: structure.modules }),
        previewMarkdown: slidePreview,
        assumptionLog: JSON.stringify(assumptionLog),
        status: 'draft'
      }
    })
  ]);

  return NextResponse.json({ structure, manual, slides });
}
