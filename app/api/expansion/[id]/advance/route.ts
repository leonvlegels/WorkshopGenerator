import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const form = await req.formData();
  const stage = String(form.get('stage') ?? 'research');

  const request = await prisma.expansionRequest.findUnique({ where: { id: params.id } });
  if (!request) return NextResponse.json({ error: 'Expansion request not found' }, { status: 404 });

  if (stage === 'draft_knowledge') {
    await prisma.draftKnowledgeEntry.create({
      data: {
        expansion_request_id: request.id,
        topic_slug_proposal: request.requested_topic_text.toLowerCase().replace(/\s+/g, '_').slice(0, 40),
        synthesized_text: `Draft synthesis for ${request.requested_topic_text}.`,
        assumptions: ['Source coverage incomplete pending operator review.'],
        unresolved_questions: ['What is consensus vs strong heuristic in this topic?'],
        source_map_json: { mapped: [] },
        quality_summary: 'Provisional draft based on limited seed references.',
        status: 'awaiting_review'
      }
    });

    await prisma.expansionRequest.update({ where: { id: request.id }, data: { status: 'awaiting_review' } });
  }

  if (stage === 'provisional_module') {
    const draft = await prisma.draftKnowledgeEntry.findFirst({ where: { expansion_request_id: request.id }, orderBy: { id: 'desc' } });
    if (!draft) return NextResponse.json({ error: 'Create draft knowledge entry first.' }, { status: 400 });

    await prisma.provisionalModule.create({
      data: {
        expansion_request_id: request.id,
        draft_knowledge_entry_id: draft.id,
        audience_level: 'beginner',
        module_payload_json: {
          title: `${request.requested_topic_text} (Provisional)`,
          warning_banner: 'Provisional module — not canonical.',
          must_cover_points: ['Clearly label uncertainty and source quality.', 'Collect operator corrections.']
        },
        warning_label: 'PROVISIONAL / NON-CANONICAL',
        status: 'draft'
      }
    });

    await prisma.expansionRequest.update({ where: { id: request.id }, data: { status: 'researching' } });
  }

  if (stage === 'approve_for_ingest') {
    await prisma.expansionRequest.update({ where: { id: request.id }, data: { status: 'approved_for_ingest' } });
  }

  if (stage === 'complete') {
    await prisma.expansionRequest.update({ where: { id: request.id }, data: { status: 'completed' } });
  }

  return NextResponse.redirect(new URL('/expansion', req.url));
}
