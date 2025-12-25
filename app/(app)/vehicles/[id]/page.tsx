import { notFound } from 'next/navigation';
import { isValidObjectId } from 'mongoose';
import { Vehicle } from '@/models/Vehicle';
import { connectDb } from '@/lib/db';
import VehicleForm from '../VehicleForm';

export const dynamic = 'force-dynamic';

async function getVehicle(id: string) {
  await connectDb();
  if (!isValidObjectId(id)) return null;
  const v = await Vehicle.findById(id).lean<any>();
  if (!v || Array.isArray(v)) return null;
  return {
    id: v._id.toString(),
    marque: v.marque,
    modele: v.modele,
    annee: v.annee ?? '',
    carburant: v.carburant,
    boite: v.boite,
    immatriculation: v.immatriculation,
    kilometrage: v.kilometrage ?? 0,
    statut: v.statut,
    photos: v.photos ?? [],
    alerts: {
      vidangeAtKm: v.alerts?.vidangeAtKm ?? '',
      assuranceExpireLe: v.alerts?.assuranceExpireLe ? new Date(v.alerts.assuranceExpireLe).toISOString().split('T')[0] : '',
      vignetteExpireLe: v.alerts?.vignetteExpireLe ? new Date(v.alerts.vignetteExpireLe).toISOString().split('T')[0] : '',
      controleTechniqueExpireLe: v.alerts?.controleTechniqueExpireLe ? new Date(v.alerts.controleTechniqueExpireLe).toISOString().split('T')[0] : ''
    }
  };
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) return notFound();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Véhicule</h1>
        <p className="text-sm text-slate-600">Modifier les infos, le statut et les alertes de maintenance.</p>
      </div>
      <VehicleForm mode="edit" vehicle={vehicle} />
    </div>
  );
}
