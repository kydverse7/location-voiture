import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { Expense } from '@/models/Expense';
import { Reservation } from '@/models/Reservation';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const now = new Date();
  const dayFilter = { createdAt: { $gte: startOfDay(now), $lte: endOfDay(now) } };
  const monthFilter = { createdAt: { $gte: startOfMonth(now), $lte: endOfMonth(now) } };

  const [dayPayments, monthPayments, dayExpenses, monthExpenses, reservationsPayees, reservationsPartielles, reservationsNonPayees] = await Promise.all([
    Payment.aggregate([{ $match: dayFilter }, { $group: { _id: null, total: { $sum: '$montant' } } }]),
    Payment.aggregate([{ $match: monthFilter }, { $group: { _id: null, total: { $sum: '$montant' } } }]),
    Expense.aggregate([{ $match: dayFilter }, { $group: { _id: null, total: { $sum: '$montant' } } }]),
    Expense.aggregate([{ $match: monthFilter }, { $group: { _id: null, total: { $sum: '$montant' } } }]),
    Reservation.countDocuments({ paiementStatut: 'paye' }),
    Reservation.countDocuments({ paiementStatut: 'partiel' }),
    Reservation.countDocuments({ paiementStatut: 'plus_tard' })
  ]);

  return NextResponse.json({
    recettesJour: dayPayments[0]?.total ?? 0,
    recettesMois: monthPayments[0]?.total ?? 0,
    depensesJour: dayExpenses[0]?.total ?? 0,
    depensesMois: monthExpenses[0]?.total ?? 0,
    reservationsPayees,
    reservationsPartielles,
    reservationsNonPayees
  });
}