import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';
import { sendNotification } from '@/lib/notifications';
import { addDays, isBefore } from 'date-fns';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const soon = addDays(new Date(), 7);
  const vehicles = await Vehicle.find({}).lean<any>();
  const alerts: Array<{ vehicleId: string; type: string; due: Date }> = [];

  for (const v of vehicles) {
    if (v.alerts?.assuranceExpireLe && isBefore(new Date(v.alerts.assuranceExpireLe), soon)) {
      alerts.push({ vehicleId: v._id.toString(), type: 'assurance', due: new Date(v.alerts.assuranceExpireLe) });
    }
    if (v.alerts?.vignetteExpireLe && isBefore(new Date(v.alerts.vignetteExpireLe), soon)) {
      alerts.push({ vehicleId: v._id.toString(), type: 'vignette', due: new Date(v.alerts.vignetteExpireLe) });
    }
    if (v.alerts?.controleTechniqueExpireLe && isBefore(new Date(v.alerts.controleTechniqueExpireLe), soon)) {
      alerts.push({ vehicleId: v._id.toString(), type: 'controle_technique', due: new Date(v.alerts.controleTechniqueExpireLe) });
    }
  }

  for (const alert of alerts) {
    await sendNotification({
      type: 'whatsapp',
      canal: 'interne',
      to: 'maintenance',
      message: `Alerte ${alert.type} pour véhicule ${alert.vehicleId} avant le ${alert.due.toLocaleDateString('fr-MA')}`
    });
  }

  return NextResponse.json({ alerts });
}