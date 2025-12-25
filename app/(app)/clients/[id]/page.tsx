import { notFound } from 'next/navigation';
import { isValidObjectId } from 'mongoose';
import { Client } from '@/models/Client';
import { connectDb } from '@/lib/db';
import ClientForm from '../ClientForm';

export const dynamic = 'force-dynamic';

async function getClient(id: string) {
  await connectDb();
  if (!isValidObjectId(id)) return null;
  const c = await Client.findById(id).lean<any>();
  if (!c || Array.isArray(c)) return null;
  return {
    id: c._id.toString(),
    type: c.type,
    nom: c.nom,
    prenom: c.prenom ?? '',
    documentType: c.documentType,
    documentNumber: c.documentNumber,
    telephone: c.telephone,
    whatsapp: c.whatsapp ?? '',
    notesInternes: c.notesInternes ?? ''
  };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) return notFound();
  const isIncomplete = !client.documentType || !client.documentNumber;
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Client</h1>
          {isIncomplete && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
              Dossier incomplet
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600">Modifier les informations.</p>
      </div>
      <ClientForm mode="edit" client={client} />
    </div>
  );
}
