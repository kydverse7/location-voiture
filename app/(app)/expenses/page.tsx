"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type ExpenseDisplay = {
  id: string;
  type: string;
  montant: number;
  date: string;
  description?: string;
  vehicleId?: string;
};

const typeLabels: Record<string, string> = {
  entretien: 'Entretien',
  carburant: 'Carburant',
  assurance: 'Assurance',
  reparation: 'Réparation',
  taxe: 'Taxe',
  autre: 'Autre'
};

const typeVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'danger'> = {
  entretien: 'info',
  carburant: 'warning',
  assurance: 'success',
  reparation: 'danger',
  taxe: 'neutral',
  autre: 'neutral'
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'entretien', montant: 0, date: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    const res = await fetch('/api/expenses');
    if (res.ok) {
      const data = await res.json();
      const mapped = (data.expenses as any[]).map((e) => ({
        id: e._id,
        type: e.type,
        montant: e.montant,
        date: e.date,
        description: e.description,
        vehicleId: e.vehicle
      }));
      setExpenses(mapped);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Erreur');
      setSubmitting(false);
      return;
    }
    setForm({ type: 'entretien', montant: 0, date: '', description: '' });
    setShowForm(false);
    loadData();
    setSubmitting(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.montant, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dépenses</h1>
          <p className="text-sm text-slate-600">Suivi des dépenses (carburant, entretien, assurances, etc.).</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouvelle dépense'}
        </Button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

      {/* Formulaire ajout */}
      {showForm && (
        <Card>
          <CardHeader title="Nouvelle dépense" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                    <option value="entretien">Entretien</option>
                    <option value="carburant">Carburant</option>
                    <option value="assurance">Assurance</option>
                    <option value="reparation">Réparation</option>
                    <option value="taxe">Taxe</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Montant (MAD) *</label>
                  <input type="number" className="input" value={form.montant}
                    onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })} required min={1} />
                </div>
                <div>
                  <label className="text-sm font-medium">Date *</label>
                  <input type="date" className="input" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <input type="text" className="input" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" className="bg-slate-200 text-slate-700" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Total dépenses</p>
            <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} MAD</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Nombre d'entrées</p>
            <p className="text-2xl font-bold">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      <Card>
        <CardHeader title="Liste des dépenses" />
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune dépense enregistrée.</p>
          ) : (
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="text-xs">{e.date ? new Date(e.date).toLocaleDateString() : '-'}</td>
                    <td><Badge variant={typeVariant[e.type] ?? 'neutral'}>{typeLabels[e.type] ?? e.type}</Badge></td>
                    <td>{e.description || '-'}</td>
                    <td className="font-medium text-red-600">{e.montant.toLocaleString()} MAD</td>
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
