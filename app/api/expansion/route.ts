import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ExpansionSchema = z.object({
  requestedTopicText: z.string().min(3),
  requestedBy: z.string().min(1),
  contextNotes: z.string().min(3)
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ExpansionSchema.safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const reqEntry = await prisma.expansionRequest.create({
    data: {
      requested_topic_text: parsed.data.requestedTopicText,
      requested_by: parsed.data.requestedBy,
      context_notes: parsed.data.contextNotes,
      status: 'queued'
    }
  });

  await prisma.researchBrief.create({
    data: {
      expansion_request_id: reqEntry.id,
      scope_text: parsed.data.requestedTopicText,
      proposed_questions: [
        'What claims are consensus vs provisional?',
        'Which variables are method-specific versus broadly transferable?'
      ],
      proposed_source_types: ['official_doc', 'standards_body', 'educator'],
      risk_notes: 'Mark non-consensus claims and request operator review before ingest.',
      status: 'draft'
    }
  });

  return NextResponse.json({ ok: true, expansionRequestId: reqEntry.id });
}
