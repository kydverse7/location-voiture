import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isValidObjectId } from 'mongoose';
import { Vehicle } from '@/models/Vehicle';
import { connectDb } from '@/lib/db';
import PublicBookingForm from './PublicBookingForm';
import VehicleGallery from './VehicleGallery';

export const dynamic = 'force-dynamic';

async function getVehicle(id: string) {
  await connectDb();
  if (!isValidObjectId(id)) return null;
  const v = await Vehicle.findById(id).lean<any>();
  if (!v || Array.isArray(v)) return null;
  return {
    id: v._id.toString(),
    modele: v.modele,
    immatriculation: v.immatriculation,
    carburant: v.carburant,
    boite: v.boite,
    photos: v.photos ?? []
  };
}

export default async function PublicVehiclePage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await params;
  const vehicle = await getVehicle(vehicleId);
  if (!vehicle) return notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link href="/public-site" className="text-sm text-primary hover:underline">
        ← Retour catalogue
      </Link>
      
      {/* Galerie photos */}
      {vehicle.photos.length > 0 && (
        <VehicleGallery photos={vehicle.photos} modele={vehicle.modele} />
      )}
      
      <div className="card space-y-3 p-6">
        <h1 className="text-2xl font-bold text-slate-900">{vehicle.modele}</h1>
        <div className="text-sm text-slate-600">{vehicle.immatriculation} • {vehicle.carburant} • {vehicle.boite}</div>
      </div>
      <PublicBookingForm vehicleId={vehicle.id} />
    </div>
  );
}
