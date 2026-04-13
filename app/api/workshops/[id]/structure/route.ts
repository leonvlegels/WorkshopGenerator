import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const UpdateSchema = z.object({
  modules: z.array(
    z.object({
      module_id: z.string(),
      module_title: z.string(),
      module_type: z.string(),
      workshop_phase: z.string(),
      locked: z.boolean(),
      planned_time_min: z.number().int().min(1),
      cut_priority: z.number().int().min(0),
      audience_level: z.string()
    })
  )
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cut_order = [...parsed.data.modules]
    .sort((a, b) => b.cut_priority - a.cut_priority)
    .map((m) => m.module_id);

  await prisma.workshopStructure.update({
    where: { id: params.id },
    data: {
      generated_sequence_json: { modules: parsed.data.modules, cut_order }
    }
  });

  return NextResponse.json({ ok: true });
}
