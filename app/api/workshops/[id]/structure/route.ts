import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ModuleSchema = z.object({
  module_id: z.string(),
  module_title: z.string(),
  module_type: z.string(),
  workshop_phase: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  planned_time_min: z.coerce.number().min(1),
  min_time_min: z.coerce.number().min(1),
  ideal_time_min: z.coerce.number().min(1),
  expandable_time_min: z.coerce.number().min(1),
  cut_priority: z.coerce.number(),
  must_cover_points: z.array(z.string()),
  optional_points: z.array(z.string()),
  if_running_late: z.array(z.string()),
  if_extra_time: z.array(z.string()),
  practical_component: z.string(),
  slide_needs: z.string(),
  visual_needs: z.string(),
  sequence_index: z.coerce.number().min(1)
});

const PayloadSchema = z.object({
  modules: z.array(ModuleSchema),
  cut_order: z.array(z.string())
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const total = parsed.data.modules.reduce((acc, m) => acc + m.planned_time_min, 0);

  await prisma.workshopStructure.update({
    where: { id: params.id },
    data: {
      generated_sequence_json: {
        modules: parsed.data.modules,
        cut_order: parsed.data.cut_order,
        pacing_summary: { requested_total: total, planned_total: total }
      },
      total_duration_min: total,
      review_state: 'edited_structure'
    }
  });

  return NextResponse.json({ ok: true });
}
