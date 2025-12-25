import VehicleForm from '../VehicleForm';

export default function NewVehiclePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Nouveau véhicule</h1>
        <p className="text-sm text-slate-600">Enregistrer un véhicule dans le parc.</p>
      </div>
      <VehicleForm mode="create" />
    </div>
  );
}
