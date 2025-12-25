"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type PlanningItem = {
  id: string;
  type: 'reservation' | 'location';
  vehicle: string;
  vehicleImmat: string;
  client: string;
  debutAt: string;
  finAt: string;
  statut: string;
};

const statutVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'danger'> = {
  en_attente: 'warning',
  confirmee: 'info',
  en_cours: 'success',
  terminee: 'neutral',
  annulee: 'danger'
};

export default function PlanningPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData(d: string) {
    setLoading(true);
    const res = await fetch(`/api/planning/day?date=${d}`);
    if (res.ok) {
      const data = await res.json();
      const reservations: PlanningItem[] = (data.reservations ?? []).map((r: any) => ({
        id: r._id,
        type: 'reservation',
        vehicle: r.vehicle?.modele ?? 'N/A',
        vehicleImmat: r.vehicle?.immatriculation ?? '',
        client: r.client ? `${r.client.prenom ?? ''} ${r.client.nom}`.trim() : (r.clientInline ? `${r.clientInline.prenom} ${r.clientInline.nom}` : 'N/A'),
        debutAt: r.debutAt,
        finAt: r.finAt,
        statut: r.statut
      }));
      const locations: PlanningItem[] = (data.locations ?? []).map((l: any) => ({
        id: l._id,
        type: 'location',
        vehicle: l.vehicle?.modele ?? 'N/A',
        vehicleImmat: l.vehicle?.immatriculation ?? '',
        client: l.client ? `${l.client.prenom ?? ''} ${l.client.nom}`.trim() : 'N/A',
        debutAt: l.debutAt,
        finAt: l.finPrevueAt,
        statut: l.statut
      }));
      setItems([...reservations, ...locations]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData(date);
  }, [date]);

  const goToday = () => setDate(new Date().toISOString().slice(0, 10));
  const goPrev = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };
  const goNext = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Planning du jour</h1>
          <p className="text-sm text-slate-600">Réservations et locations prévues pour une date.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-slate-200 text-slate-700" onClick={goPrev}>&larr;</Button>
          <input type="date" className="input w-40" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button className="bg-slate-200 text-slate-700" onClick={goNext}>&rarr;</Button>
          <Button onClick={goToday}>Aujourd'hui</Button>
        </div>
      </div>

      <Card>
        <CardHeader title={`Planning du ${new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`} />
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune réservation ou location ce jour.</p>
          ) : (
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Véhicule</th>
                  <th>Client</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>
                      <Badge variant={item.type === 'location' ? 'success' : 'info'}>
                        {item.type === 'location' ? 'Location' : 'Réservation'}
                      </Badge>
                    </td>
                    <td>
                      <div className="font-medium">{item.vehicle}</div>
                      <div className="text-xs text-slate-500">{item.vehicleImmat}</div>
                    </td>
                    <td>{item.client}</td>
                    <td className="text-xs">{new Date(item.debutAt).toLocaleDateString()}</td>
                    <td className="text-xs">{new Date(item.finAt).toLocaleDateString()}</td>
                    <td><Badge variant={statutVariant[item.statut] ?? 'neutral'}>{item.statut}</Badge></td>
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
