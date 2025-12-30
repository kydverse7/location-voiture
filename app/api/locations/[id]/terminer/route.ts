import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Location } from '@/models/Location';
import { Vehicle } from '@/models/Vehicle';
import { Reservation } from '@/models/Reservation';
import '@/models/Client';
import '@/models/Payment';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();

  const { id } = await params;
  const payload = await req.json().catch(() => ({}));
  const { finReelleAt, notes } = payload;

  const location = await Location.findById(id).populate('vehicle reservation');
  if (!location) {
    return NextResponse.json({ error: 'Location introuvable' }, { status: 404 });
  }

  if (location.statut === 'terminee') {
    return NextResponse.json({ error: 'Location déjà terminée' }, { status: 400 });
  }

  // Mettre à jour la location
  const finDate = finReelleAt ? new Date(finReelleAt) : new Date();
  location.statut = 'terminee';
  location.finReelleAt = finDate;
  if (notes) location.notes = notes;
  await location.save();

  // Remettre le véhicule comme disponible
  await Vehicle.findByIdAndUpdate(location.vehicle, { statut: 'disponible' });

  // Mettre à jour la réservation liée
  if (location.reservation) {
    await Reservation.findByIdAndUpdate(location.reservation, { statut: 'terminee' });
  }

  // Audit
  await recordAudit(user!.id, 'location:end', 'Location', location._id.toString(), null, { finReelleAt: finDate });

  return NextResponse.json({ 
    success: true, 
    location,
    message: 'Location terminée avec succès'
  });
}
