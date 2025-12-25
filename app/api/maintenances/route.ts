import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Maintenance } from '@/models/Maintenance';
import { Vehicle } from '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const maints = await Maintenance.find().populate('vehicle').sort({ date: -1 }).lean();
  return NextResponse.json({ maintenances: maints });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const payload = await req.json();
  const created = await Maintenance.create(payload);
  if (payload.type === 'reparation' || payload.type === 'entretien') {
    await Vehicle.findByIdAndUpdate(payload.vehicle, { statut: 'maintenance' });
  }
  await recordAudit(user!.id, 'maintenance:create', 'Maintenance', created._id.toString(), null, created);
  return NextResponse.json({ maintenance: created }, { status: 201 });
}
