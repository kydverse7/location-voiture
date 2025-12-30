import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { Location } from '@/models/Location';
import '@/models/Client';
import '@/models/Vehicle';
import '@/models/Reservation';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();

  const { searchParams } = new URL(req.url);
  const reservationId = searchParams.get('reservation');
  const locationId = searchParams.get('location');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const filter: Record<string, unknown> = {};
  if (reservationId) filter.reservation = reservationId;
  if (locationId) filter.location = locationId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) (filter.createdAt as Record<string, Date>).$gte = new Date(startDate);
    if (endDate) (filter.createdAt as Record<string, Date>).$lte = new Date(endDate);
  }

  const payments = await Payment.find(filter)
    .populate({
      path: 'reservation',
      populate: [{ path: 'vehicle', select: 'modele immatriculation' }, { path: 'client', select: 'nom prenom telephone' }]
    })
    .populate({
      path: 'location',
      populate: [{ path: 'vehicle', select: 'modele immatriculation' }, { path: 'client', select: 'nom prenom telephone' }]
    })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ payments });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const payload = await req.json();
  const payment = await Payment.create(payload);
  await Location.findByIdAndUpdate(payment.location, { $push: { paiements: payment._id } });
  await recordAudit(user!.id, 'payment:create', 'Payment', payment._id.toString(), null, payment);
  return NextResponse.json({ payment }, { status: 201 });
}
