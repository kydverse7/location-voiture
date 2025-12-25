"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

type FinanceData = {
  recettesJour: number;
  recettesMois: number;
  depensesJour: number;
  depensesMois: number;
  reservationsPayees: number;
  reservationsPartielles: number;
};

type PaymentItem = {
  _id: string;
  type: string;
  montant: number;
  createdAt: string;
};

type ExpenseItem = {
  _id: string;
  type: string;
  montant: number;
  date: string;
};

const paymentTypes: Record<string, string> = {
  especes: 'Espèces',
  carte: 'Carte',
  virement: 'Virement',
  cheque: 'Chèque'
};

const expenseTypes: Record<string, string> = {
  entretien: 'Entretien',
  assurance: 'Assurance',
  carburant: 'Carburant',
  reparation: 'Réparation',
  vidange: 'Vidange',
  pneus: 'Pneus',
  lavage: 'Lavage',
  parking: 'Parking',
  amende: 'Amende',
  taxe: 'Taxe',
  autre: 'Autre'
};

export default function FinancesPage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [resFinances, resPayments, resExpenses] = await Promise.all([
        fetch('/api/finances/summary'),
        fetch('/api/payments'),
        fetch('/api/expenses')
      ]);
      
      if (resFinances.ok) {
        setData(await resFinances.json());
      }
      if (resPayments.ok) {
        const pData = await resPayments.json();
        setPayments(pData.payments || []);
      }
      if (resExpenses.ok) {
        const eData = await resExpenses.json();
        setExpenses(eData.expenses || []);
      }
    } catch {
      console.error('Erreur chargement finances');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-200 border-t-royal-600"></div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-royal-500">
        <Wallet className="mb-3 h-12 w-12 opacity-30" />
        <p className="text-sm">Erreur de chargement des données</p>
      </div>
    );
  }

  const soldeMois = data.recettesMois - data.depensesMois;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-500 to-royal-600 shadow-glow">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-royal-900">Finances</h1>
            <p className="text-sm text-royal-600">Résumé des recettes et dépenses</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/payments">
            <Button className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 sm:w-auto">
              <CreditCard className="h-4 w-4" />
              Voir paiements
            </Button>
          </Link>
          <Link href="/expenses">
            <Button className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 sm:w-auto">
              <Receipt className="h-4 w-4" />
              Voir dépenses
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader title="Recettes Jour" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
          <CardContent className="text-2xl sm:text-3xl font-bold text-emerald-600">
            +{data.recettesJour.toLocaleString()} MAD
          </CardContent>
        </Card>
        <Card variant="elevated" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader title="Recettes Mois" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
          <CardContent className="text-3xl font-bold text-emerald-600">
            +{data.recettesMois.toLocaleString()} MAD
          </CardContent>
        </Card>
        <Card variant="elevated" className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader title="Dépenses Mois" icon={<TrendingDown className="h-4 w-4 text-red-500" />} />
          <CardContent className="text-3xl font-bold text-red-600">
            -{data.depensesMois.toLocaleString()} MAD
          </CardContent>
        </Card>
        <Card variant="glow" className={soldeMois >= 0 ? 'border-royal-300 bg-gradient-to-br from-royal-100 to-royal-50 ring-2 ring-royal-200' : 'border-red-300 bg-gradient-to-br from-red-100 to-red-50'}>
          <CardHeader title="Solde du Mois" icon={<Sparkles className="h-4 w-4 text-royal-600" />} />
          <CardContent className={`text-3xl font-bold ${soldeMois >= 0 ? 'text-royal-700' : 'text-red-600'}`}>
            {soldeMois > 0 ? '+' : ''}{soldeMois.toLocaleString()} MAD
          </CardContent>
        </Card>
      </div>

      {/* Statut paiements réservations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="elevated" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader title="Réservations payées" icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} />
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600">{data.reservationsPayees}</div>
            <p className="text-sm text-emerald-600">Paiement complet reçu</p>
          </CardContent>
        </Card>
        <Card variant="elevated" className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader title="Paiements partiels" icon={<Clock className="h-4 w-4 text-amber-500" />} />
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">{data.reservationsPartielles}</div>
            <p className="text-sm text-amber-600">Acompte versé</p>
          </CardContent>
        </Card>
      </div>

      {/* Aperçu derniers paiements / dépenses */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card variant="elevated">
          <CardHeader title="Derniers paiements" icon={<CreditCard className="h-5 w-5 text-emerald-500" />} />
          <CardContent>
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-royal-400">
                <CreditCard className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm">Aucun paiement enregistré</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {payments.slice(0, 5).map((p) => (
                  <li key={p._id} className="flex justify-between rounded-xl border border-royal-100 bg-gradient-to-r from-royal-50 to-white p-3">
                    <div>
                      <span className="font-medium text-royal-800">{paymentTypes[p.type] || p.type}</span>
                      <span className="ml-2 text-xs text-royal-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="font-bold text-emerald-600">+{p.montant.toLocaleString()} MAD</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/payments" className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-royal-100 p-3 text-sm font-medium text-royal-700 transition-colors hover:bg-royal-200">
              Voir tous les paiements
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader title="Dernières dépenses" icon={<Receipt className="h-5 w-5 text-red-500" />} />
          <CardContent>
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-royal-400">
                <Receipt className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm">Aucune dépense enregistrée</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {expenses.slice(0, 5).map((e) => (
                  <li key={e._id} className="flex justify-between rounded-xl border border-royal-100 bg-gradient-to-r from-royal-50 to-white p-3">
                    <div>
                      <span className="font-medium text-royal-800">{expenseTypes[e.type] || e.type}</span>
                      <span className="ml-2 text-xs text-royal-500">{new Date(e.date).toLocaleDateString()}</span>
                    </div>
                    <span className="font-bold text-red-600">-{e.montant.toLocaleString()} MAD</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/expenses" className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-royal-100 p-3 text-sm font-medium text-royal-700 transition-colors hover:bg-royal-200">
              Voir toutes les dépenses
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
