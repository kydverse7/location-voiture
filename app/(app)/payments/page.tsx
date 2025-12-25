"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type PaymentDisplay = {
  id: string;
  type: string;
  montant: number;
  statut: string;
  categorie: string;
  reference?: string;
  createdAt: string;
  reservationId?: string;
  locationId?: string;
  vehicle?: string;
  client?: string;
};

const typeLabels: Record<string, string> = {
  especes: 'Espèces',
  carte: 'Carte',
  virement: 'Virement',
  cheque: 'Chèque'
};

const statutVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  effectue: 'success',
  en_attente: 'warning',
  annule: 'danger'
};

const categorieLabels: Record<string, string> = {
  location: 'Location',
  caution: 'Caution',
  complement: 'Complément',
  autre: 'Autre'
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function loadData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const res = await fetch(`/api/payments?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      const mapped = (data.payments as any[]).map((p) => ({
        id: p._id,
        type: p.type,
        montant: p.montant,
        statut: p.statut,
        categorie: p.categorie ?? 'location',
        reference: p.reference,
        createdAt: p.createdAt,
        reservationId: p.reservation?._id ?? p.reservation,
        locationId: p.location?._id ?? p.location,
        vehicle: p.reservation?.vehicle?.modele || p.location?.vehicle?.modele || '-',
        client: p.reservation?.client
          ? `${p.reservation.client.prenom ?? ''} ${p.reservation.client.nom}`.trim()
          : p.reservation?.clientInline
            ? `${p.reservation.clientInline.prenom ?? ''} ${p.reservation.clientInline.nom ?? ''}`.trim() || p.reservation.clientInline.telephone || '-'
            : p.location?.client
              ? `${p.location.client.prenom ?? ''} ${p.location.client.nom}`.trim()
              : '-'
      }));
      setPayments(mapped);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => loadData();

  const handleDownloadInvoice = async (p: PaymentDisplay) => {
    const body = p.reservationId ? { reservationId: p.reservationId } : { locationId: p.locationId };
    const res = await fetch('/api/pdf/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      alert('Erreur génération facture');
    }
  };

  const totalFiltered = payments.reduce((sum, p) => sum + (p.statut === 'effectue' ? p.montant : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Paiements & Factures</h1>
          <p className="text-sm text-slate-600">Historique des paiements et génération de factures.</p>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 items-end py-4">
          <div>
            <label className="text-sm font-medium">Du</label>
            <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Au</label>
            <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button onClick={handleFilter}>Filtrer</Button>
          <Button className="bg-slate-200 text-slate-700" onClick={() => { setStartDate(''); setEndDate(''); loadData(); }}>Réinitialiser</Button>
        </CardContent>
      </Card>

      {/* Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Total encaissé (période)</p>
            <p className="text-2xl font-bold text-green-600">{totalFiltered.toLocaleString()} MAD</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Nombre de paiements</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      <Card>
        <CardHeader title="Liste des paiements" />
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun paiement.</p>
          ) : (
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Type</th>
                  <th>Catégorie</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{p.client}</td>
                    <td>{p.vehicle}</td>
                    <td>{typeLabels[p.type] ?? p.type}</td>
                    <td>{categorieLabels[p.categorie] ?? p.categorie}</td>
                    <td className="font-medium">{p.montant.toLocaleString()} MAD</td>
                    <td><Badge variant={statutVariant[p.statut] ?? 'neutral'}>{p.statut}</Badge></td>
                    <td>
                      {(p.reservationId || p.locationId) && (
                        <button onClick={() => handleDownloadInvoice(p)} className="text-xs text-blue-600 hover:underline">
                          Facture PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
