import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Location } from '@/models/Location';
import { Vehicle } from '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    requireRole(user, ['admin', 'agent']);
    await connectDb();
    const { id } = await params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return NextResponse.json({ message: 'Reservation non trouvee' }, { status: 404 });
    }

    if (reservation.statut !== 'en_cours') {
      return NextResponse.json({ message: 'La reservation doit etre en cours pour terminer' }, { status: 400 });
    }

    // Terminer la reservation
    const before = reservation.toObject();
    reservation.statut = 'terminee';
    await reservation.save();

    // Terminer la location liée si elle existe
    if (reservation.location) {
      const loc = await Location.findById(reservation.location);
      if (loc && loc.statut === 'en_cours') {
        const beforeLoc = loc.toObject();
        loc.statut = 'terminee';
        loc.finReelleAt = new Date();
        await loc.save();
        await recordAudit(user!.id, 'location:end', 'Location', loc._id.toString(), beforeLoc, loc.toObject());
      }
    }

    // Remettre le vehicule disponible
    await Vehicle.findByIdAndUpdate(reservation.vehicle, { statut: 'disponible' });

    await recordAudit(user!.id, 'reservation:update', 'Reservation', reservation._id.toString(), before, reservation.toObject());

    return NextResponse.json({ message: 'Location terminee', reservation });
  } catch (error) {
    console.error('Erreur fin location:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
