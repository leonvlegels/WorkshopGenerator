import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const workshop = await prisma.workshopStructure.findUnique({
    where: { id: params.id },
    include: {
      manuals: { take: 1, orderBy: { id: 'desc' } },
      slides: { take: 1, orderBy: { id: 'desc' } },
      workshopTemplate: true
    }
  });

  if (!workshop) return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });

  const payload = {
    id: workshop.id,
    title: workshop.title,
    workshopTemplate: {
      id: workshop.workshopTemplate.id,
      slug: workshop.workshopTemplate.slug,
      title: workshop.workshopTemplate.title
    },
    operatorContext: workshop.operator_context_json,
    generatedSequence: workshop.generated_sequence_json,
    totalDurationMin: workshop.total_duration_min,
    reviewState: workshop.review_state,
    manual: workshop.manuals[0]
      ? {
          markdown: workshop.manuals[0].markdown_body,
          assumptions: workshop.manuals[0].assumption_log,
          status: workshop.manuals[0].status
        }
      : null,
    slides: workshop.slides[0]
      ? {
          slideJson: workshop.slides[0].slide_json,
          previewMarkdown: workshop.slides[0].preview_markdown,
          assumptions: workshop.slides[0].assumption_log,
          status: workshop.slides[0].status
        }
      : null
  };

  return NextResponse.json(payload);
}
