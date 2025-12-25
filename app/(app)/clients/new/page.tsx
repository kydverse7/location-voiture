import ClientForm from '../ClientForm';

export default function NewClientPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Nouveau client</h1>
        <p className="text-sm text-slate-600">Enregistrer un client particulier ou entreprise.</p>
      </div>
      <ClientForm mode="create" />
    </div>
  );
}
