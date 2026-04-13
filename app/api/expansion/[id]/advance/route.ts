import { NextRequest, NextResponse } from 'next/server';
import { AudienceLevel } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const expansion = await prisma.expansionRequest.findUnique({ where: { id: params.id } });
  if (!expansion) return NextResponse.json({ error: 'Expansion request not found' }, { status: 404 });

  const draft = await prisma.draftKnowledgeEntry.create({
    data: {
      expansion_request_id: expansion.id,
      topic_slug_proposal: expansion.requested_topic_text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 50),
      synthesized_text: `Draft synthesis for ${expansion.requested_topic_text}. This is non-canonical until approved.`,
      assumptions: ['Limited source set at initial draft stage.'],
      unresolved_questions: ['Need operator review of conflicting practices.'],
      source_map_json: {
        note: 'No canonical ingest yet. Build source map in review step.'
      },
      quality_summary: 'Provisional draft - under review',
      status: 'draft'
    }
  });

  const provisional = await prisma.provisionalModule.create({
    data: {
      expansion_request_id: expansion.id,
      draft_knowledge_entry_id: draft.id,
      audience_level: AudienceLevel.intermediate,
      module_payload_json: {
        title: `Provisional: ${expansion.requested_topic_text}`,
        warning_banner: 'PROVISIONAL / NON-CANONICAL',
        must_cover: ['State uncertainty explicitly.', 'Mark claims as provisional unless sourced.']
      },
      warning_label: 'PROVISIONAL / NON-CANONICAL',
      status: 'awaiting_review'
    }
  });

  await prisma.expansionRequest.update({ where: { id: expansion.id }, data: { status: 'awaiting_review' } });

  return NextResponse.json({ ok: true, draftId: draft.id, provisionalModuleId: provisional.id });
}
