import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';
import { vehicleSchema } from '@/lib/validators';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const vehicles = await Vehicle.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ vehicles });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const json = await req.json();
  const parsed = vehicleSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const created = await Vehicle.create(parsed.data);
  await recordAudit(user!.id, 'vehicle:create', 'Vehicle', created._id.toString(), null, created);
  return NextResponse.json({ vehicle: created }, { status: 201 });
}
