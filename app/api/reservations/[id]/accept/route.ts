import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Vehicle } from '@/models/Vehicle';
import { Client } from '@/models/Client';
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
  
  if (reservation.statut !== 'en_attente') {
    return NextResponse.json({ error: 'Cette réservation ne peut plus être acceptée' }, { status: 400 });
  }

  // Auto-création client (demande publique) si manquant
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
  }

  if (!reservation.client) {
    return NextResponse.json({ error: 'Aucun client associé' }, { status: 400 });
  }

  const before = reservation.toObject();
  
  // Mettre à jour la réservation en "confirmee"
  reservation.statut = 'confirmee';
  await reservation.save();
  
  // Marquer le véhicule comme réservé (pas encore loué tant que la location n'a pas démarré)
  await Vehicle.findByIdAndUpdate(reservation.vehicle, { statut: 'reserve' });
  
  await recordAudit(user!.id, 'reservation:accept', 'Reservation', id, before, reservation.toObject());
  
  return NextResponse.json({ ok: true, reservation });
}
