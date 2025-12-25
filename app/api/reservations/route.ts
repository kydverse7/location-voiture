import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Vehicle } from '@/models/Vehicle';
import { Payment } from '@/models/Payment';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';
import { reservationSchema } from '@/lib/validators';
import { sendNotification } from '@/lib/notifications';
import { differenceInCalendarDays } from 'date-fns';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const reservations = await Reservation.find().populate('vehicle client').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ reservations });
}

export async function POST(req: Request) {
  const json = await req.json();

  // Canal public: pas d'auth, mais validation stricte + rate limit via IP.
  if (json?.canal === 'public') {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    // 5 demandes/minute/IP
    const { rateLimit } = await import('@/lib/rateLimit');
    if (!rateLimit(`public-reservation:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez' }, { status: 429 });
    }

    await connectDb();
    const parsed = reservationSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    if (!parsed.data.clientInline) {
      return NextResponse.json({ error: 'clientInline requis pour une réservation publique' }, { status: 400 });
    }

    const created = await Reservation.create({
      ...parsed.data,
      statut: 'en_attente',
      paiementStatut: 'plus_tard',
      montantPaye: 0,
      montantRestant: parsed.data.prix?.totalEstime ?? 0,
      typePaiement: 'especes'
    });

    await sendNotification({
      type: 'whatsapp',
      canal: 'interne',
      to: 'agent',
      message: `Nouvelle demande de réservation publique (RES-${created._id.toString().slice(-6).toUpperCase()})`
    });

    return NextResponse.json({ reservation: created }, { status: 201 });
  }

  // Canal interne: auth requise
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const parsed = reservationSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const debut = new Date(parsed.data.debutAt);
  const fin = new Date(parsed.data.finAt);
  const days = Math.max(1, differenceInCalendarDays(fin, debut) || 1);
  const { parJour = 0, parSemaine = 0, parMois = 0 } = parsed.data.prix ?? {};
  const weekly = parSemaine ? Math.floor(days / 7) * parSemaine : 0;
  const monthly = parMois ? Math.floor(days / 30) * parMois : 0;
  const remainingDays = days - Math.floor(days / 7) * 7 - Math.floor(days / 30) * 30;
  const daily = remainingDays * parJour;
  const totalEstime = json.prix?.totalEstime || (monthly + weekly + daily);

  // Preparer les donnees de la reservation
  const reservationData: any = {
    ...parsed.data,
    prix: { ...parsed.data.prix, totalEstime },
    createdBy: user!.id,
    statut: 'en_attente',
    paiementStatut: json.paiementStatut || 'plus_tard',
    montantPaye: json.montantPaye || 0,
    montantRestant: json.montantRestant ?? totalEstime,
    typePaiement: json.typePaiement || 'especes'
  };

  // Auto statut vehicule => reserve
  await Vehicle.findByIdAndUpdate(parsed.data.vehicle, { statut: 'reserve' });
  
  const created = await Reservation.create(reservationData);

  // Si paiement effectue, creer un Payment
  if (json.paiementStatut === 'paye' || json.paiementStatut === 'partiel') {
    const montantPaye = json.paiementStatut === 'paye' ? totalEstime : (json.montantPaye || 0);
    if (montantPaye > 0) {
      await Payment.create({
        reservation: created._id,
        type: json.typePaiement || 'especes',
        montant: montantPaye,
        statut: 'effectue',
        categorie: 'location',
        reference: `RES-${created._id.toString().slice(-6).toUpperCase()}`,
        notes: json.paiementStatut === 'paye' ? 'Paiement complet reservation' : 'Acompte reservation'
      });
    }
  }

  await recordAudit(user!.id, 'reservation:create', 'Reservation', created._id.toString(), null, created);
  await sendNotification({
    type: 'whatsapp',
    canal: 'reservation',
    to: 'client',
    message: `Reservation confirmee pour le vehicule ${parsed.data.vehicle}`
  });
  return NextResponse.json({ reservation: created }, { status: 201 });
}
