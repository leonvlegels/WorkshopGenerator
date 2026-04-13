import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ModuleSchema = z.object({
  module_id: z.string(),
  module_title: z.string(),
  module_type: z.string(),
  topic_id: z.string(),
  workshop_phase: z.enum(['slide_heavy', 'hands_on', 'recap']),
  locked: z.boolean(),
  enabled: z.boolean(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  planned_time_min: z.coerce.number().min(1),
  min_time_min: z.coerce.number(),
  ideal_time_min: z.coerce.number(),
  expandable_time_min: z.coerce.number(),
  cut_priority: z.coerce.number(),
  must_cover_points: z.array(z.string()),
  optional_points: z.array(z.string()),
  if_running_late: z.array(z.string()),
  if_extra_time: z.array(z.string()),
  practical_component: z.string(),
  visual_needs: z.string()
});

const SequenceSchema = z.object({
  modules: z.array(ModuleSchema),
  cut_order: z.array(z.string())
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = SequenceSchema.safeParse(body.sequence);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.workshopStructure.update({
    where: { id: params.id },
    data: {
      generated_sequence_json: parsed.data,
      total_duration_min: parsed.data.modules.filter((m) => m.enabled).reduce((sum, m) => sum + m.planned_time_min, 0),
      review_state: 'edited'
    }
  });

  return NextResponse.json({ ok: true });
}
