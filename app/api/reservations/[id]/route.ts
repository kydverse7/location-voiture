import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Vehicle } from '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const payload = await req.json();
  const { id } = await params;
  const before = await Reservation.findById(id).lean();
  const updated = await Reservation.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (payload.statut === 'annulee') {
    await Vehicle.findByIdAndUpdate(updated.vehicle, { statut: 'disponible' });
  }

  await recordAudit(user!.id, 'reservation:update', 'Reservation', id, before, updated);
  return NextResponse.json({ reservation: updated });
}
