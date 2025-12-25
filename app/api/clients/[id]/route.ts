import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Client } from '@/models/Client';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';
import { clientSchema } from '@/lib/validators';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const { id } = await params;
  const client = await Client.findById(id).lean();
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const json = await req.json();
  const parsed = clientSchema.partial().safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;
  const before = await Client.findById(id).lean();
  const updated = await Client.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await recordAudit(user!.id, 'client:update', 'Client', id, before, updated);
  return NextResponse.json({ client: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin']);
  await connectDb();
  const { id } = await params;
  const before = await Client.findById(id).lean();
  await Client.findByIdAndDelete(id);
  await recordAudit(user!.id, 'client:delete', 'Client', id, before, null);
  return NextResponse.json({ ok: true });
}
