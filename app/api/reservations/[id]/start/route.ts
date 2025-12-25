import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Location } from '@/models/Location';
import { Vehicle } from '@/models/Vehicle';
import { Client } from '@/models/Client';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { generateContractPdf, streamToBuffer } from '@/lib/pdf';
import { saveFile } from '@/lib/storage';
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

    // Auto-création client (au cas où) si manquant
    if (!reservation.client && reservation.clientInline) {
      const inline = reservation.clientInline;
      const existing = await Client.findOne({
        telephone: inline.telephone,
        nom: inline.nom,
        prenom: inline.prenom
      });
      const createdClient = existing
        ? existing
        : await Client.create({
            type: 'particulier',
            nom: inline.nom,
            prenom: inline.prenom,
            telephone: inline.telephone
          });
      if (!existing) {
        await recordAudit(user!.id, 'client:create:auto', 'Client', createdClient._id.toString(), null, createdClient.toObject());
      }
      reservation.client = createdClient._id as any;
      reservation.clientInline = undefined;
      await reservation.save();
    }

    if (!reservation.client) {
      return NextResponse.json({ message: 'Aucun client associé' }, { status: 400 });
    }

    if (reservation.statut !== 'confirmee') {
      return NextResponse.json({ message: 'La reservation doit etre confirmee pour demarrer' }, { status: 400 });
    }

    // Eviter de recréer une location si déjà démarrée
    if (reservation.location) {
      const existing = await Location.findById(reservation.location);
      if (existing && existing.statut === 'en_cours') {
        return NextResponse.json({ message: 'Location déjà démarrée', reservation }, { status: 200 });
      }
    }

    // Générer contrat PDF (basique)
    const vehicleDoc = await Vehicle.findById(reservation.vehicle).lean<any>();
    const pdf = generateContractPdf({
      client: { nom: (reservation as any).clientInline?.nom ?? 'Client', prenom: (reservation as any).clientInline?.prenom },
      vehicle: { modele: vehicleDoc?.modele ?? 'Véhicule', immatriculation: vehicleDoc?.immatriculation ?? '' },
      dates: { debut: reservation.debutAt, fin: reservation.finAt },
      montant: reservation.prix?.totalEstime ?? 0
    });
    const pdfBuffer = await streamToBuffer(pdf);
    const contratPdfUrl = await saveFile(`contrat-${reservation._id.toString().slice(-6)}.pdf`, pdfBuffer, 'application/pdf');

    // Créer Location
    const location = await Location.create({
      reservation: reservation._id,
      vehicle: reservation.vehicle,
      client: reservation.client,
      statut: 'en_cours',
      debutAt: reservation.debutAt,
      finPrevueAt: reservation.finAt,
      montantTotal: reservation.prix?.totalEstime ?? 0,
      contratPdfUrl
    });

    // Mettre la reservation en cours + pointer vers la location
    const before = reservation.toObject();
    reservation.statut = 'en_cours';
    reservation.location = location._id as any;
    reservation.contratPdfUrl = contratPdfUrl;
    await reservation.save();

    // Mettre le vehicule en loue
    await Vehicle.findByIdAndUpdate(reservation.vehicle, { statut: 'loue' });

    await recordAudit(user!.id, 'location:start', 'Location', location._id.toString(), null, location.toObject());
    await recordAudit(user!.id, 'reservation:update', 'Reservation', reservation._id.toString(), before, reservation.toObject());

    return NextResponse.json({ message: 'Location demarree', reservation, location });
  } catch (error) {
    console.error('Erreur demarrage location:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
