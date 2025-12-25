"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type LocationDisplay = {
  id: string;
  vehicle: string;
  vehicleImmat: string;
  client: string;
  debutAt: string;
  finPrevueAt: string;
  finReelleAt: string | null;
  statut: string;
  montantTotal: number;
  contratPdfUrl?: string;
};

const statutVariant: Record<string, 'success' | 'warning' | 'neutral'> = {
  en_cours: 'success',
  terminee: 'neutral',
  annulee: 'warning'
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationDisplay[]>([]);
  const [filter, setFilter] = useState<'all' | 'en_cours' | 'terminee'>('all');
  const [loading, setLoading] = useState(true);
  const [prolongId, setProlongId] = useState<string | null>(null);
  const [prolongForm, setProlongForm] = useState({ nouvelleFin: '', montantSup: 0 });
  const [prolongLoading, setProlongLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    const res = await fetch('/api/locations');
    if (res.ok) {
      const data = await res.json();
      const mapped = (data.locations as any[]).map((l) => ({
        id: l._id,
        vehicle: l.vehicle?.modele ?? 'N/A',
        vehicleImmat: l.vehicle?.immatriculation ?? '',
        client: l.client ? `${l.client.prenom ?? ''} ${l.client.nom}`.trim() : 'N/A',
        debutAt: l.debutAt,
        finPrevueAt: l.finPrevueAt,
        finReelleAt: l.finReelleAt,
        statut: l.statut,
        montantTotal: l.montantTotal ?? 0,
        contratPdfUrl: l.contratPdfUrl
      }));
      setLocations(mapped);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = filter === 'all' ? locations : locations.filter((l) => l.statut === filter);

  const handleProlong = async () => {
    if (!prolongId) return;
    setProlongLoading(true);
    const res = await fetch(`/api/locations/${prolongId}/prolong`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prolongForm)
    });
    if (!res.ok) {
      alert('Erreur lors de la prolongation');
    }
    setProlongLoading(false);
    setProlongId(null);
    loadData();
  };

  const openProlong = (loc: LocationDisplay) => {
    setProlongId(loc.id);
    const nextDay = new Date(loc.finPrevueAt);
    nextDay.setDate(nextDay.getDate() + 1);
    setProlongForm({ nouvelleFin: nextDay.toISOString().slice(0, 10), montantSup: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Locations</h1>
          <p className="text-sm text-slate-600">Suivi des locations en cours et terminées.</p>
        </div>
        <div className="flex gap-2">
          <Button className={filter === 'all' ? '' : 'bg-slate-200 text-slate-700'} onClick={() => setFilter('all')}>Toutes</Button>
          <Button className={filter === 'en_cours' ? '' : 'bg-slate-200 text-slate-700'} onClick={() => setFilter('en_cours')}>En cours</Button>
          <Button className={filter === 'terminee' ? '' : 'bg-slate-200 text-slate-700'} onClick={() => setFilter('terminee')}>Terminées</Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Liste des locations" />
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune location.</p>
          ) : (
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Véhicule</th>
                  <th>Client</th>
                  <th>Début</th>
                  <th>Fin prévue</th>
                  <th>Fin réelle</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div className="font-medium">{l.vehicle}</div>
                      <div className="text-xs text-slate-500">{l.vehicleImmat}</div>
                    </td>
                    <td>{l.client}</td>
                    <td className="text-xs">{new Date(l.debutAt).toLocaleDateString()}</td>
                    <td className="text-xs">{new Date(l.finPrevueAt).toLocaleDateString()}</td>
                    <td className="text-xs">{l.finReelleAt ? new Date(l.finReelleAt).toLocaleDateString() : '-'}</td>
                    <td className="font-medium">{l.montantTotal.toLocaleString()} MAD</td>
                    <td><Badge variant={statutVariant[l.statut] ?? 'neutral'}>{l.statut}</Badge></td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {l.contratPdfUrl && (
                          <a href={l.contratPdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            Voir contrat
                          </a>
                        )}
                        {l.statut === 'en_cours' && (
                          <button onClick={() => openProlong(l)} className="text-xs text-green-600 hover:underline">
                            Prolonger
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal Prolongation */}
      {prolongId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setProlongId(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Prolonger la location</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nouvelle date de fin</label>
                <input type="date" className="input" value={prolongForm.nouvelleFin}
                  onChange={(e) => setProlongForm({ ...prolongForm, nouvelleFin: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Montant supplémentaire (MAD)</label>
                <input type="number" className="input" value={prolongForm.montantSup}
                  onChange={(e) => setProlongForm({ ...prolongForm, montantSup: Number(e.target.value) })} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button className="bg-slate-200 text-slate-700" onClick={() => setProlongId(null)}>Annuler</Button>
                <Button onClick={handleProlong} disabled={prolongLoading}>
                  {prolongLoading ? 'Prolongation...' : 'Prolonger'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
