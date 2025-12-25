import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Vehicle } from '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  
  const { id } = await params;
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
  }
  
  if (reservation.statut === 'annulee') {
    return NextResponse.json({ error: 'Cette réservation est déjà annulée' }, { status: 400 });
  }

  const before = reservation.toObject();
  
  // Annuler la réservation
  reservation.statut = 'annulee';
  await reservation.save();
  
  // Remettre le véhicule en "disponible"
  await Vehicle.findByIdAndUpdate(reservation.vehicle, { statut: 'disponible' });
  
  await recordAudit(user!.id, 'reservation:reject', 'Reservation', id, before, reservation.toObject());
  
  return NextResponse.json({ ok: true, reservation });
}
