import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';
import { vehicleSchema } from '@/lib/validators';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const { id } = await params;
  const vehicle = await Vehicle.findById(id).lean();
  if (!vehicle) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ vehicle });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const json = await req.json();
  const parsed = vehicleSchema.partial().safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;
  const before = await Vehicle.findById(id).lean();
  const updated = await Vehicle.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await recordAudit(user!.id, 'vehicle:update', 'Vehicle', id, before, updated);
  return NextResponse.json({ vehicle: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin']);
  await connectDb();
  const { id } = await params;
  const before = await Vehicle.findById(id).lean();
  await Vehicle.findByIdAndDelete(id);
  await recordAudit(user!.id, 'vehicle:delete', 'Vehicle', id, before, null);
  return NextResponse.json({ ok: true });
}
