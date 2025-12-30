"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CreditCard, Wallet, X } from 'lucide-react';

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
  totalPaye: number;
  montantRestant: number;
  paiementStatut: string;
  contratPdfUrl?: string;
};

const statutVariant: Record<string, 'success' | 'warning' | 'neutral'> = {
  en_cours: 'success',
  terminee: 'neutral',
  annulee: 'warning'
};

const paiementStatutVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  paye: 'success',
  partiel: 'warning',
  non_paye: 'danger'
};

const paiementStatutLabels: Record<string, string> = {
  paye: 'Payé',
  partiel: 'Partiel',
  non_paye: 'Non payé'
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationDisplay[]>([]);
  const [filter, setFilter] = useState<'all' | 'en_cours' | 'terminee'>('all');
  const [loading, setLoading] = useState(true);
  const [prolongId, setProlongId] = useState<string | null>(null);
  const [prolongForm, setProlongForm] = useState({ nouvelleFin: '', montantSup: 0 });
  const [prolongLoading, setProlongLoading] = useState(false);

  // État pour le modal de paiement
  const [paymentModal, setPaymentModal] = useState<LocationDisplay | null>(null);
  const [paymentForm, setPaymentForm] = useState({ montant: 0, type: 'especes', reference: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // État pour terminer une location
  const [terminateModal, setTerminateModal] = useState<LocationDisplay | null>(null);
  const [terminateLoading, setTerminateLoading] = useState(false);

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
        totalPaye: l.totalPaye ?? 0,
        montantRestant: l.montantRestant ?? l.montantTotal ?? 0,
        paiementStatut: l.paiementStatut ?? 'non_paye',
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

  const openPaymentModal = (loc: LocationDisplay) => {
    setPaymentModal(loc);
    setPaymentForm({ montant: loc.montantRestant, type: 'especes', reference: '' });
  };

  const handleAddPayment = async () => {
    if (!paymentModal) return;
    if (paymentForm.montant <= 0) {
      alert('Montant invalide');
      return;
    }
    setPaymentLoading(true);
    const res = await fetch(`/api/locations/${paymentModal.id}/paiement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentForm)
    });
    if (!res.ok) {
      alert('Erreur lors de l\'encaissement');
    }
    setPaymentLoading(false);
    setPaymentModal(null);
    loadData();
  };

  const handleTerminateLocation = async () => {
    if (!terminateModal) return;
    if (!confirm(`Terminer la location de ${terminateModal.vehicle} ?`)) return;
    setTerminateLoading(true);
    const res = await fetch(`/api/locations/${terminateModal.id}/terminer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finReelleAt: new Date().toISOString() })
    });
    if (!res.ok) {
      alert('Erreur lors de la fin de location');
    }
    setTerminateLoading(false);
    setTerminateModal(null);
    loadData();
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
                  <th>Montant</th>
                  <th>Payé</th>
                  <th>Restant</th>
                  <th>Paiement</th>
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
                    <td className="font-medium">{l.montantTotal.toLocaleString()} MAD</td>
                    <td className="text-green-600 font-medium">{l.totalPaye.toLocaleString()} MAD</td>
                    <td className={`font-medium ${l.montantRestant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {l.montantRestant.toLocaleString()} MAD
                    </td>
                    <td>
                      <Badge variant={paiementStatutVariant[l.paiementStatut] ?? 'danger'}>
                        {paiementStatutLabels[l.paiementStatut] ?? 'Non payé'}
                      </Badge>
                    </td>
                    <td><Badge variant={statutVariant[l.statut] ?? 'neutral'}>{l.statut}</Badge></td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {l.statut === 'en_cours' && (
                          <button 
                            onClick={() => setTerminateModal(l)} 
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          >
                            Terminer
                          </button>
                        )}
                        {l.montantRestant > 0 && l.statut === 'en_cours' && (
                          <button onClick={() => openPaymentModal(l)} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            Encaisser
                          </button>
                        )}
                        {l.contratPdfUrl && (
                          <a href={l.contratPdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            Voir contrat
                          </a>
                        )}
                        {l.statut === 'en_cours' && (
                          <button onClick={() => openProlong(l)} className="text-xs text-amber-600 hover:underline">
                            Prolonger
                          </button>
                        )}
                        {l.statut === 'terminee' && l.finReelleAt && (
                          <span className="text-xs text-slate-500">
                            Terminée le {new Date(l.finReelleAt).toLocaleDateString()}
                          </span>
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

      {/* Modal Terminer Location */}
      {terminateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setTerminateModal(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Terminer la location</h2>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Véhicule: <strong>{terminateModal.vehicle}</strong></p>
              <p className="text-sm text-slate-600">Client: <strong>{terminateModal.client}</strong></p>
              <p className="text-sm text-slate-600 mt-2">
                Montant total: <strong>{terminateModal.montantTotal.toLocaleString()} MAD</strong>
              </p>
              <p className="text-sm text-slate-600">
                Payé: <strong className="text-green-600">{terminateModal.totalPaye.toLocaleString()} MAD</strong>
              </p>
              {terminateModal.montantRestant > 0 && (
                <p className="text-sm text-red-600 font-medium mt-1">
                  ⚠️ Reste à encaisser: {terminateModal.montantRestant.toLocaleString()} MAD
                </p>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Le véhicule sera remis en statut "disponible" et la réservation sera marquée comme terminée.
            </p>
            <div className="flex gap-2 justify-end">
              <Button className="bg-slate-200 text-slate-700" onClick={() => setTerminateModal(null)}>
                Annuler
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700" 
                onClick={handleTerminateLocation} 
                disabled={terminateLoading}
              >
                {terminateLoading ? 'Terminer...' : 'Confirmer la fin'}
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal Paiement */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPaymentModal(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                Encaisser un paiement
              </h2>
              <button onClick={() => setPaymentModal(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Location: <strong>{paymentModal.vehicle}</strong></p>
              <p className="text-sm text-slate-600">Client: <strong>{paymentModal.client}</strong></p>
              <div className="mt-2 flex justify-between text-sm">
                <span>Montant total:</span>
                <span className="font-medium">{paymentModal.montantTotal.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Déjà payé:</span>
                <span className="font-medium text-green-600">{paymentModal.totalPaye.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-1 mt-1">
                <span>Restant à payer:</span>
                <span className="font-bold text-red-600">{paymentModal.montantRestant.toLocaleString()} MAD</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Montant à encaisser (MAD)</label>
                <input
                  type="number"
                  className="input"
                  value={paymentForm.montant}
                  max={paymentModal.montantRestant}
                  onChange={(e) => setPaymentForm({ ...paymentForm, montant: Number(e.target.value) })}
                />
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setPaymentForm({ ...paymentForm, montant: paymentModal.montantRestant })}
                  >
                    Montant total restant
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Mode de paiement</label>
                <select
                  className="input"
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                >
                  <option value="especes">Espèces</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Référence (optionnel)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="N° chèque, référence virement..."
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button className="bg-slate-200 text-slate-700" onClick={() => setPaymentModal(null)}>
                  Annuler
                </Button>
                <Button onClick={handleAddPayment} disabled={paymentLoading || paymentForm.montant <= 0}>
                  {paymentLoading ? 'Encaissement...' : `Encaisser ${paymentForm.montant.toLocaleString()} MAD`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
