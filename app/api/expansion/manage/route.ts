import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const isJson = (req.headers.get('content-type') || '').includes('application/json');
  let expansionRequestId = '';
  let action = '';
  if (isJson) {
    const body = await req.json();
    expansionRequestId = body.expansionRequestId;
    action = body.action;
  } else {
    const form = await req.formData();
    expansionRequestId = String(form.get('expansionRequestId') || '');
    action = String(form.get('action') || '');
  }

  if (action === 'to_researching') {
    await prisma.expansionRequest.update({ where: { id: expansionRequestId }, data: { status: 'researching' } });
  }

  if (action === 'create_draft_knowledge') {
    await prisma.draftKnowledgeEntry.create({
      data: {
        expansion_request_id: expansionRequestId,
        topic_slug_proposal: `draft-${Date.now()}`,
        synthesized_text: 'Draft synthesized knowledge. Marked non-canonical.',
        assumptions: ['Needs source validation'],
        unresolved_questions: ['Consensus boundaries'],
        source_map_json: { source_quality: 'mixed' },
        quality_summary: 'Under review',
        status: 'draft'
      }
    });
    await prisma.expansionRequest.update({ where: { id: expansionRequestId }, data: { status: 'awaiting_review' } });
  }

  if (action === 'create_provisional_module') {
    const draft = await prisma.draftKnowledgeEntry.findFirst({ where: { expansion_request_id: expansionRequestId }, orderBy: { id: 'desc' } });
    if (!draft) return NextResponse.json({ error: 'No draft knowledge entry found' }, { status: 400 });

    await prisma.provisionalModule.create({
      data: {
        expansion_request_id: expansionRequestId,
        draft_knowledge_entry_id: draft.id,
        audience_level: 'beginner',
        module_payload_json: { title: 'Provisional module', warning: true },
        warning_label: 'PROVISIONAL: non-canonical until approved',
        status: 'provisional'
      }
    });
  }

  if (action === 'approve_for_ingest') {
    await prisma.expansionRequest.update({ where: { id: expansionRequestId }, data: { status: 'approved_for_ingest' } });
  }

  if (isJson) return NextResponse.json({ ok: true });
  return NextResponse.redirect(new URL('/expansion', req.url));
}
