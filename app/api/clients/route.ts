import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Client } from '@/models/Client';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';
import { clientSchema } from '@/lib/validators';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const clients = await Client.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const json = await req.json();
  const parsed = clientSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const created = await Client.create(parsed.data);
  await recordAudit(user!.id, 'client:create', 'Client', created._id.toString(), null, created);
  return NextResponse.json({ client: created }, { status: 201 });
}
