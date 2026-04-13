import { NextRequest, NextResponse } from 'next/server';
import { Packer, Paragraph, Document } from 'docx';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const manual = await prisma.manualArtifact.findUnique({ where: { id: params.id } });
  if (!manual) {
    return NextResponse.json({ error: 'Manual artifact not found' }, { status: 404 });
  }

  const doc = new Document({
    sections: [
      {
        children: manual.markdown_body.split('\n').map((line) => new Paragraph({ text: line || ' ' }))
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const bytes = await blob.arrayBuffer();

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="manual-${params.id}.docx"`
    }
  });
}
