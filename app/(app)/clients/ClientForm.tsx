"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';

export default function ClientForm({ mode, client }: { mode: 'create' | 'edit'; client?: any }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isIncomplete = !client?.documentType || !client?.documentNumber;
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ?? {
      type: 'particulier',
      nom: '',
      prenom: '',
      documentType: 'cin',
      documentNumber: '',
      telephone: ''
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    setError('');
    const res = await fetch(mode === 'create' ? '/api/clients' : `/api/clients/${client.id}`, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      setError('Erreur lors de la sauvegarde');
      return;
    }
    router.push('/clients');
    router.refresh();
  });

  const handleDelete = async () => {
    if (!confirm('Supprimer ce client ?')) return;
    setDeleting(true);
    const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Erreur lors de la suppression');
      setDeleting(false);
      return;
    }
    router.push('/clients');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-4">
      {mode === 'edit' && isIncomplete && (
        <div className="rounded border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
          Dossier incomplet : merci de renseigner le CIN/Passeport et le numéro.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Type</label>
          <select className="select" {...register('type')}>
            <option value="particulier">Particulier</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Nom</label>
          <input className="input" {...register('nom')} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Prénom</label>
          <input className="input" {...register('prenom')} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Document</label>
          <select className="select" {...register('documentType')}>
            <option value="">(Non renseigné)</option>
            <option value="cin">CIN</option>
            <option value="passeport">Passeport</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">N° Document</label>
          <input className="input" {...register('documentNumber')} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Téléphone</label>
          <input className="input" {...register('telephone')} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">WhatsApp</label>
          <input className="input" {...register('whatsapp')} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Notes internes</label>
          <textarea className="textarea" {...register('notesInternes')} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Mettre à jour'}
        </Button>
        {mode === 'edit' && (
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        )}
      </div>
    </form>
  );
}
