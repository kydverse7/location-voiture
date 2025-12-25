import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Location } from '@/models/Location';
import { Vehicle } from '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';
import { generateContractPdf, streamToBuffer } from '@/lib/pdf';
import { saveFile } from '@/lib/storage';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const locations = await Location.find().populate('vehicle client reservation').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ locations });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const payload = await req.json();
  const reservationId = payload?.reservation;
  if (!reservationId) {
    return NextResponse.json({ error: 'reservation requis' }, { status: 400 });
  }

  const reservation = await Reservation.findById(reservationId).populate('client vehicle');
  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  if (!reservation.client) {
    return NextResponse.json({ error: 'Client manquant sur la réservation' }, { status: 400 });
  }
  if (reservation.statut !== 'confirmee') {
    return NextResponse.json({ error: 'La réservation doit être confirmée' }, { status: 400 });
  }

  await Vehicle.findByIdAndUpdate(reservation.vehicle, { statut: 'loue' });

  // Génération contrat
  const pdf = generateContractPdf({
    client: { nom: (reservation.client as any).nom, prenom: (reservation.client as any).prenom },
    vehicle: { modele: (reservation.vehicle as any).modele, immatriculation: (reservation.vehicle as any).immatriculation },
    dates: { debut: reservation.debutAt, fin: reservation.finAt },
    montant: reservation.prix?.totalEstime ?? 0
  });
  const pdfBuffer = await streamToBuffer(pdf);
  const pdfPath = await saveFile('contrat.pdf', pdfBuffer, 'application/pdf');

  const created = await Location.create({
    reservation: reservation._id,
    vehicle: reservation.vehicle,
    client: reservation.client,
    statut: 'en_cours',
    debutAt: reservation.debutAt,
    finPrevueAt: reservation.finAt,
    montantTotal: reservation.prix?.totalEstime ?? 0,
    caution: reservation.caution,
    contratPdfUrl: pdfPath
  });

  await Reservation.findByIdAndUpdate(reservation._id, { statut: 'en_cours', location: created._id, contratPdfUrl: pdfPath });
  await recordAudit(user!.id, 'location:start', 'Location', created._id.toString(), null, created);
  return NextResponse.json({ location: created }, { status: 201 });
}
