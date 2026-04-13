import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { manualArtifactId } = (await req.json()) as { manualArtifactId?: string };
  if (!manualArtifactId) return NextResponse.json({ error: 'manualArtifactId required' }, { status: 400 });

  const manual = await prisma.manualArtifact.findUnique({ where: { id: manualArtifactId } });
  if (!manual) return NextResponse.json({ error: 'Manual not found' }, { status: 404 });

  const lines = manual.markdownBody.split('\n');
  const doc = new Document({
    sections: [
      {
        children: lines.map((line) => new Paragraph({ children: [new TextRun(line.replace(/^#+\s*/, ''))] }))
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="manual.docx"'
    }
  });
}
