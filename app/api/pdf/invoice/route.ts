import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Location } from '@/models/Location';
import { generateContractPdf, streamToBuffer } from '@/lib/pdf';
import { getCurrentUser, requireRole } from '@/lib/auth';

// Génère une facture PDF à partir d'une réservation ou location (IDs)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();

  const body = await req.json();
  const { reservationId, locationId } = body;

  let client: { nom: string; prenom?: string } | null = null;
  let vehicle: { modele: string; immatriculation: string } | null = null;
  let dates: { debut: Date; fin: Date } | null = null;
  let montant = 0;

  if (reservationId) {
    const reservation = await Reservation.findById(reservationId).populate('client vehicle').lean() as any;
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }
    client = reservation.client;
    vehicle = reservation.vehicle;
    dates = { debut: reservation.debutAt, fin: reservation.finAt };
    montant = reservation.prix?.totalEstime ?? reservation.montantPaye ?? 0;
  } else if (locationId) {
    const location = await Location.findById(locationId).populate('client vehicle').lean() as any;
    if (!location) {
      return NextResponse.json({ error: 'Location introuvable' }, { status: 404 });
    }
    client = location.client;
    vehicle = location.vehicle;
    dates = { debut: location.debutAt, fin: location.finReelleAt ?? location.finPrevueAt };
    montant = location.montantTotal ?? 0;
  } else {
    return NextResponse.json({ error: 'reservationId ou locationId requis' }, { status: 400 });
  }

  const pdf = generateContractPdf({
    client: { nom: client?.nom ?? 'N/A', prenom: client?.prenom },
    vehicle: { modele: vehicle?.modele ?? 'N/A', immatriculation: vehicle?.immatriculation ?? '' },
    dates: dates!,
    montant
  });
  const buffer = await streamToBuffer(pdf);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="facture.pdf"'
    }
  });
}
