import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ReviewSchema = z.object({
  artifactType: z.string().min(1),
  artifactId: z.string().min(1),
  outcome: z.enum(['approve', 'approve_with_edits', 'reject']),
  accuracy: z.coerce.number().min(1).max(5),
  depth: z.coerce.number().min(1).max(5),
  usefulness: z.coerce.number().min(1).max(5),
  notes: z.string().min(2)
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const parsed = ReviewSchema.safeParse(Object.fromEntries(form.entries()));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;

  await prisma.reviewEvent.create({
    data: {
      artifact_type: input.artifactType,
      artifact_id: input.artifactId,
      outcome: input.outcome,
      accuracy_score: input.accuracy,
      depth_score: input.depth,
      usefulness_score: input.usefulness,
      operator_notes: input.notes,
      exemplar_flag: input.outcome === 'approve'
    }
  });

  return NextResponse.redirect(new URL('/', req.url));
}
