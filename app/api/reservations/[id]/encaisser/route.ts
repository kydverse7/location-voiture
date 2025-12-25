import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Payment } from '@/models/Payment';
import { getCurrentUser, requireRole } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    requireRole(user, ['admin', 'agent']);
    await connectDb();
    const { id } = await params;
    const { montant, type } = await req.json();

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return NextResponse.json({ message: 'Reservation non trouvee' }, { status: 404 });
    }

    if (reservation.paiementStatut === 'paye') {
      return NextResponse.json({ message: 'Reservation deja payee' }, { status: 400 });
    }

    const montantEncaisse = Number(montant) || 0;
    const nouveauMontantPaye = (reservation.montantPaye || 0) + montantEncaisse;
    const nouveauMontantRestant = (reservation.montantRestant || 0) - montantEncaisse;

    // Mettre a jour la reservation
    reservation.montantPaye = nouveauMontantPaye;
    reservation.montantRestant = Math.max(0, nouveauMontantRestant);
    reservation.paiementStatut = nouveauMontantRestant <= 0 ? 'paye' : 'partiel';
    await reservation.save();

    // Creer un paiement dans les finances
    await Payment.create({
      reservation: reservation._id,
      type: type || 'especes',
      montant: montantEncaisse,
      statut: 'effectue',
      categorie: 'complement',
      reference: `RES-${reservation._id.toString().slice(-6).toUpperCase()}-CPL`,
      notes: `Complement paiement reservation`
    });

    return NextResponse.json({ 
      message: 'Encaissement effectue', 
      reservation,
      nouveauStatut: reservation.paiementStatut
    });
  } catch (error) {
    console.error('Erreur encaissement:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
