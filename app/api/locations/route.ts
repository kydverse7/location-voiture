import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Location } from '@/models/Location';
import { Vehicle } from '@/models/Vehicle';
import { Payment } from '@/models/Payment';
import '@/models/Client';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';
import { generateContractPdf, streamToBuffer } from '@/lib/pdf';
import { saveFile } from '@/lib/storage';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const locations = await Location.find()
    .populate('vehicle client reservation paiements')
    .sort({ createdAt: -1 })
    .lean();

  // Calculer le total payé et restant pour chaque location
  const locationsWithPayments = locations.map((loc: any) => {
    const totalPaye = (loc.paiements || [])
      .filter((p: any) => p.statut === 'effectue')
      .reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
    const montantRestant = (loc.montantTotal || 0) - totalPaye;
    return {
      ...loc,
      totalPaye,
      montantRestant,
      paiementStatut: montantRestant <= 0 ? 'paye' : totalPaye > 0 ? 'partiel' : 'non_paye'
    };
  });

  return NextResponse.json({ locations: locationsWithPayments });
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

  // Récupérer les paiements déjà effectués sur la réservation et les lier à la location
  const existingPayments = await Payment.find({ reservation: reservation._id });
  if (existingPayments.length > 0) {
    const paymentIds = existingPayments.map(p => p._id);
    // Mettre à jour les paiements pour les lier aussi à la location
    await Payment.updateMany(
      { reservation: reservation._id },
      { $set: { location: created._id } }
    );
    // Ajouter les IDs de paiements à la location
    await Location.findByIdAndUpdate(created._id, { $set: { paiements: paymentIds } });
  }

  await Reservation.findByIdAndUpdate(reservation._id, { statut: 'en_cours', location: created._id, contratPdfUrl: pdfPath });
  await recordAudit(user!.id, 'location:start', 'Location', created._id.toString(), null, created);
  return NextResponse.json({ location: created }, { status: 201 });
}
