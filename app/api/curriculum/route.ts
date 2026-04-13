import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { entity, action, data } = body as { entity: string; action: 'create' | 'update' | 'delete'; data: any };

  try {
    if (entity === 'topic') {
      if (action === 'delete') await prisma.topic.delete({ where: { id: data.id } });
      else if (action === 'create') await prisma.topic.create({ data });
      else await prisma.topic.update({ where: { id: data.id }, data });
    }

    if (entity === 'source') {
      if (action === 'delete') await prisma.source.delete({ where: { id: data.id } });
      else if (action === 'create') await prisma.source.create({ data });
      else await prisma.source.update({ where: { id: data.id }, data });
    }

    if (entity === 'claim') {
      if (action === 'delete') await prisma.claim.delete({ where: { id: data.id } });
      else if (action === 'create') await prisma.claim.create({ data });
      else await prisma.claim.update({ where: { id: data.id }, data });
    }

    if (entity === 'canonical') {
      if (action === 'delete') await prisma.canonicalEntry.delete({ where: { id: data.id } });
      else if (action === 'create') await prisma.canonicalEntry.create({ data });
      else await prisma.canonicalEntry.update({ where: { id: data.id }, data });
    }

    if (entity === 'teaching') {
      if (action === 'delete') await prisma.teachingView.delete({ where: { id: data.id } });
      else if (action === 'create') await prisma.teachingView.create({ data });
      else await prisma.teachingView.update({ where: { id: data.id }, data });
    }

    if (entity === 'module') {
      if (action === 'delete') await prisma.moduleTemplate.delete({ where: { id: data.id } });
      else if (action === 'create') await prisma.moduleTemplate.create({ data });
      else await prisma.moduleTemplate.update({ where: { id: data.id }, data });
    }

    if (entity === 'workshop_template') {
      if (action === 'delete') await prisma.workshopTemplate.delete({ where: { id: data.id } });
      else if (action === 'create') await prisma.workshopTemplate.create({ data });
      else await prisma.workshopTemplate.update({ where: { id: data.id }, data });
    }

    if (entity === 'feedback') {
      if (action === 'delete') await prisma.feedbackNote.delete({ where: { id: data.id } });
      else if (action === 'create') await prisma.feedbackNote.create({ data });
      else await prisma.feedbackNote.update({ where: { id: data.id }, data });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed mutation' }, { status: 400 });
  }
}
