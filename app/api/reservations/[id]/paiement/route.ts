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
    const body = await req.json().catch(() => ({}));
    const paiementStatut = body?.paiementStatut as 'paye' | 'partiel' | 'plus_tard';
    const montantInput = body?.montant;
    const typeInput = body?.type as 'especes' | 'carte' | 'virement' | 'cheque' | undefined;

    if (!['paye', 'partiel', 'plus_tard'].includes(paiementStatut)) {
      return NextResponse.json({ message: 'Statut de paiement invalide' }, { status: 400 });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return NextResponse.json({ message: 'Reservation non trouvee' }, { status: 404 });
    }

    const total = Number(reservation.prix?.totalEstime ?? 0);
    const montantPayeActuel = Number(reservation.montantPaye ?? 0);
    const restantActuel = Math.max(0, total - montantPayeActuel);

    if (typeInput && !['especes', 'carte', 'virement', 'cheque'].includes(typeInput)) {
      return NextResponse.json({ message: 'Type de paiement invalide' }, { status: 400 });
    }
    if (typeInput) {
      reservation.typePaiement = typeInput;
    }

    if (paiementStatut === 'plus_tard') {
      if (montantPayeActuel > 0) {
        return NextResponse.json(
          { message: 'Impossible de repasser à non payé: des montants sont déjà encaissés.' },
          { status: 400 }
        );
      }
      reservation.paiementStatut = 'plus_tard';
      reservation.montantRestant = total;
      await reservation.save();
      return NextResponse.json({ message: 'Statut de paiement mis a jour', reservation });
    }

    let montantEncaisse = 0;
    if (montantInput === null || montantInput === undefined || String(montantInput).trim() === '') {
      montantEncaisse = paiementStatut === 'paye' ? restantActuel : 0;
    } else {
      montantEncaisse = Number(montantInput);
    }

    if (!Number.isFinite(montantEncaisse) || montantEncaisse <= 0) {
      return NextResponse.json({ message: 'Montant encaissé invalide' }, { status: 400 });
    }
    if (montantEncaisse > restantActuel && total > 0) {
      return NextResponse.json({ message: 'Le montant dépasse le restant à payer' }, { status: 400 });
    }

    const paiement = await Payment.create({
      reservation: reservation._id,
      type: typeInput || reservation.typePaiement || 'especes',
      montant: montantEncaisse,
      statut: 'effectue',
      categorie: montantPayeActuel > 0 ? 'complement' : 'location',
      reference: `RES-${reservation._id.toString().slice(-6).toUpperCase()}${montantPayeActuel > 0 ? '-CPL' : ''}`,
      notes: paiementStatut === 'paye' ? 'Paiement reservation (règlement)' : 'Paiement reservation (acompte)'
    });

    const nouveauMontantPaye = montantPayeActuel + montantEncaisse;
    const nouveauMontantRestant = Math.max(0, total - nouveauMontantPaye);
    reservation.montantPaye = nouveauMontantPaye;
    reservation.montantRestant = nouveauMontantRestant;
    reservation.paiementStatut = nouveauMontantRestant <= 0 && (total > 0 || nouveauMontantPaye > 0) ? 'paye' : 'partiel';
    await reservation.save();

    return NextResponse.json({ message: 'Statut de paiement mis a jour', reservation, paiement });
  } catch (error) {
    console.error('Erreur mise a jour paiement:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
