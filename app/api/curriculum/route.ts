import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Entity =
  | 'topic'
  | 'claim'
  | 'source'
  | 'canonicalEntry'
  | 'teachingView'
  | 'moduleTemplate'
  | 'workshopTemplate'
  | 'feedbackNote';

const allowed = new Set<Entity>([
  'topic',
  'claim',
  'source',
  'canonicalEntry',
  'teachingView',
  'moduleTemplate',
  'workshopTemplate',
  'feedbackNote'
]);

function getDelegate(entity: Entity) {
  return (prisma as any)[entity];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entity = body.entity as Entity;
  if (!allowed.has(entity)) return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
  const created = await getDelegate(entity).create({ data: body.data });
  return NextResponse.json({ ok: true, created });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const entity = body.entity as Entity;
  if (!allowed.has(entity)) return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
  const updated = await getDelegate(entity).update({ where: { id: body.id }, data: body.data });
  return NextResponse.json({ ok: true, updated });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const entity = body.entity as Entity;
  if (!allowed.has(entity)) return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
  await getDelegate(entity).delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
