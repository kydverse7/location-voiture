import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Location } from '@/models/Location';
import { Payment } from '@/models/Payment';
import '@/models/Client';
import '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();

  const { id } = await params;
  const payload = await req.json();
  const { montant, type, reference, notes, categorie } = payload;

  if (!montant || montant <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  }

  const location = await Location.findById(id).populate('paiements');
  if (!location) {
    return NextResponse.json({ error: 'Location introuvable' }, { status: 404 });
  }

  // Créer le paiement
  const payment = await Payment.create({
    location: location._id,
    reservation: location.reservation,
    type: type || 'especes',
    montant,
    statut: 'effectue',
    reference: reference || undefined,
    notes: notes || undefined,
    categorie: categorie || 'location'
  });

  // Lier le paiement à la location
  await Location.findByIdAndUpdate(id, { $push: { paiements: payment._id } });

  // Audit
  await recordAudit(user!.id, 'payment:create', 'Payment', payment._id.toString(), null, payment);

  // Retourner la location mise à jour avec les paiements
  const updatedLocationDoc = await Location.findById(id)
    .populate('vehicle client paiements')
    .lean();
  
  const updatedLocation = updatedLocationDoc as any;

  // Calculer le total payé
  const paiementsList = updatedLocation?.paiements || [];
  const totalPaye = paiementsList
    .filter((p: any) => p.statut === 'effectue')
    .reduce((sum: number, p: any) => sum + (p.montant || 0), 0);

  const montantRestant = (updatedLocation?.montantTotal || 0) - totalPaye;

  return NextResponse.json({ 
    success: true, 
    payment, 
    location: updatedLocation,
    totalPaye,
    montantRestant
  });
}
