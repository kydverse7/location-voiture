import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  
  const now = new Date();
  const inOneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // Récupérer les véhicules avec leurs alertes
  const vehicles = await Vehicle.find({}, {
    modele: 1,
    immatriculation: 1,
    kilometrage: 1,
    alerts: 1
  }).lean<any>();

  const alerts: Array<{
    type: string;
    label: string;
    vehicle: string;
    vehicleId: string;
    urgence: 'high' | 'medium' | 'low';
    detail: string;
  }> = [];

  for (const v of vehicles) {
    const vehicleName = `${v.modele} (${v.immatriculation})`;
    const vid = v._id.toString();
    
    // Alerte vidange (basée sur km)
    if (v.alerts?.vidangeAtKm && v.kilometrage >= v.alerts.vidangeAtKm - 1000) {
      const diff = v.alerts.vidangeAtKm - v.kilometrage;
      alerts.push({
        type: 'vidange',
        label: 'Vidange',
        vehicle: vehicleName,
        vehicleId: vid,
        urgence: diff <= 0 ? 'high' : diff <= 500 ? 'medium' : 'low',
        detail: diff <= 0 ? `Dépassé de ${Math.abs(diff)} km` : `Dans ${diff} km`
      });
    }
    
    // Alerte assurance
    if (v.alerts?.assuranceExpireLe) {
      const expDate = new Date(v.alerts.assuranceExpireLe);
      if (expDate <= inOneMonth) {
        const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          type: 'assurance',
          label: 'Assurance',
          vehicle: vehicleName,
          vehicleId: vid,
          urgence: daysLeft <= 0 ? 'high' : daysLeft <= 7 ? 'medium' : 'low',
          detail: daysLeft <= 0 ? 'Expirée' : `J-${daysLeft}`
        });
      }
    }
    
    // Alerte vignette
    if (v.alerts?.vignetteExpireLe) {
      const expDate = new Date(v.alerts.vignetteExpireLe);
      if (expDate <= inOneMonth) {
        const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          type: 'vignette',
          label: 'Vignette',
          vehicle: vehicleName,
          vehicleId: vid,
          urgence: daysLeft <= 0 ? 'high' : daysLeft <= 7 ? 'medium' : 'low',
          detail: daysLeft <= 0 ? 'Expirée' : `J-${daysLeft}`
        });
      }
    }
    
    // Alerte contrôle technique
    if (v.alerts?.controleTechniqueExpireLe) {
      const expDate = new Date(v.alerts.controleTechniqueExpireLe);
      if (expDate <= inOneMonth) {
        const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          type: 'controle_technique',
          label: 'Contrôle technique',
          vehicle: vehicleName,
          vehicleId: vid,
          urgence: daysLeft <= 0 ? 'high' : daysLeft <= 7 ? 'medium' : 'low',
          detail: daysLeft <= 0 ? 'Expiré' : `J-${daysLeft}`
        });
      }
    }
  }
  
  // Trier par urgence (high d'abord)
  const order = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => order[a.urgence] - order[b.urgence]);

  return NextResponse.json({ alerts });
}
