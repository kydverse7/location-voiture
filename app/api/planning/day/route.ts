import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Location } from '@/models/Location';
import { getCurrentUser, requireRole } from '@/lib/auth';

// Renvoie les réservations et locations qui recouvrent une date donnée
export async function GET(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');
  const date = dateStr ? new Date(dateStr) : new Date();

  // Début et fin de la journée
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Réservations qui recouvrent ce jour (debut <= dayEnd && fin >= dayStart)
  const reservations = await Reservation.find({
    debutAt: { $lte: dayEnd },
    finAt: { $gte: dayStart },
    statut: { $in: ['en_attente', 'confirmee', 'en_cours'] }
  })
    .populate('vehicle', 'modele immatriculation statut')
    .populate('client', 'nom prenom telephone')
    .sort({ debutAt: 1 })
    .lean();

  // Locations en cours ce jour
  const locations = await Location.find({
    debutAt: { $lte: dayEnd },
    $or: [
      { finReelleAt: { $gte: dayStart } },
      { finReelleAt: null, finPrevueAt: { $gte: dayStart } }
    ],
    statut: 'en_cours'
  })
    .populate('vehicle', 'modele immatriculation statut')
    .populate('client', 'nom prenom telephone')
    .sort({ debutAt: 1 })
    .lean();

  return NextResponse.json({ date: date.toISOString().slice(0, 10), reservations, locations });
}
