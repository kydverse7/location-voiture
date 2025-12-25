import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Reservation } from '@/models/Reservation';

export async function GET(_: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  await connectDb();
  const { vehicleId } = await params;
  const reservations = await Reservation.find({ vehicle: vehicleId, statut: { $ne: 'annulee' } })
    .select('debutAt finAt statut')
    .lean();
  return NextResponse.json({ reservations });
}