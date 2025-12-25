"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  CheckCircle2, 
  Clock, 
  CalendarCheck, 
  Calendar, 
  AlertTriangle,
  Wrench,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  CircleDollarSign,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';

type PendingReservation = {
  id: string;
  vehicle: string;
  vehicleImmat: string;
  client: string | null;
  clientInline: string | null;
  debutAt: string;
  finAt: string;
  prix: number;
  canal: string;
  createdAt: string;
};

type DashboardStats = {
  totalVehicles: number;
  vehiculesLoues: number;
  vehiculesDisponibles: number;
  vehiculesEnMaintenance: number;
  vehiculesReserves: number;
  occupancyRate: number;
  reservationsEnCours: number;
  reservationsEnAttente: number;
  reservationsConfirmees: number;
  reservationsTermineesAujourdhui: number;
  lateReservations: number;
  reservationsPayees: number;
  reservationsPartielles: number;
  reservationsNonPayees: number;
  revenueToday: number;
  revenueMonth: number;
  depensesMois: number;
  beneficeMois: number;
};

type DashboardData = {
  stats: DashboardStats;
  maintenanceAlerts: Array<{
    vehicle: string;
    alerts: Array<{
      type: string;
      message: string;
      severity: 'warning' | 'danger';
    }>;
  }>;
  pendingReservations: PendingReservation[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    const res = await fetch(`/api/reservations/${id}/accept`, { method: 'POST' });
    if (!res.ok) {
      alert('Erreur lors de l\'acceptation');
    }
    setActionLoading(null);
    load();
  };

  const handleReject = async (id: string) => {
    if (!confirm('Refuser cette reservation ?')) return;
    setActionLoading(id);
    const res = await fetch(`/api/reservations/${id}/reject`, { method: 'POST' });
    if (!res.ok) {
      alert('Erreur lors du refus');
    }
    setActionLoading(null);
    load();
  };

  if (loading) return <div className="p-6">Chargement du tableau de bord...</div>;
  if (!data) return <div className="p-6">Erreur de chargement des donnees.</div>;

  const { stats } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-500 to-royal-600 shadow-glow">
          <LayoutDashboard className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-royal-900">Tableau de bord</h1>
          <p className="text-sm text-royal-600">Vue synthétique des opérations quotidiennes</p>
        </div>
      </div>

      {/* Section Vehicules */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Car className="h-5 w-5 text-royal-600" />
          <h2 className="text-lg font-semibold text-royal-800">Flotte de véhicules</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card variant="elevated" className="border-royal-200 bg-gradient-to-br from-royal-50 to-white">
            <CardHeader title="Total véhicules" icon={<Car className="h-4 w-4" />} />
            <CardContent>
              <div className="text-3xl font-bold text-royal-900">{stats.totalVehicles}</div>
              <div className="text-xs text-royal-500">Dans la flotte</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader title="Disponibles" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.vehiculesDisponibles}</div>
              <div className="text-xs text-emerald-500">Prêts à louer</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader title="Réservés" icon={<CalendarCheck className="h-4 w-4 text-purple-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.vehiculesReserves || 0}</div>
              <div className="text-xs text-purple-500">Réservation en cours</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader title="Loués" icon={<Car className="h-4 w-4 text-blue-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.vehiculesLoues}</div>
              <div className="text-xs text-blue-500">En location</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader title="Maintenance" icon={<Wrench className="h-4 w-4 text-amber-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.vehiculesEnMaintenance}</div>
              <div className="text-xs text-amber-500">En réparation</div>
            </CardContent>
          </Card>
          <Card variant="glow" className="border-royal-300 bg-gradient-to-br from-royal-100 to-royal-50">
            <CardHeader title="Taux occupation" icon={<BarChart3 className="h-4 w-4 text-royal-600" />} />
            <CardContent>
              <div className="text-3xl font-bold text-royal-700">{stats.occupancyRate}%</div>
              <div className="text-xs text-royal-500">Véhicules loués</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Reservations */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-royal-600" />
          <h2 className="text-lg font-semibold text-royal-800">Réservations</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card variant="elevated" className={stats.reservationsEnAttente > 0 ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white ring-2 ring-amber-200' : ''}>
            <CardHeader title="En attente" icon={<Clock className="h-4 w-4 text-amber-500" />} />
            <CardContent>
              <div className={`text-3xl font-bold ${stats.reservationsEnAttente > 0 ? 'text-amber-600' : 'text-royal-900'}`}>
                {stats.reservationsEnAttente}
              </div>
              <div className="text-xs text-royal-500">À confirmer</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader title="Confirmées" icon={<CalendarCheck className="h-4 w-4 text-blue-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.reservationsConfirmees}</div>
              <div className="text-xs text-blue-500">À venir</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader title="En cours" icon={<Sparkles className="h-4 w-4 text-emerald-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.reservationsEnCours}</div>
              <div className="text-xs text-emerald-500">Actives</div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader title="Terminées aujourd'hui" icon={<CheckCircle2 className="h-4 w-4 text-royal-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-royal-900">{stats.reservationsTermineesAujourdhui}</div>
              <div className="text-xs text-royal-500">Retours du jour</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className={stats.lateReservations > 0 ? 'border-red-300 bg-gradient-to-br from-red-50 to-white ring-2 ring-red-200' : ''}>
            <CardHeader title="En retard" icon={<AlertTriangle className="h-4 w-4 text-red-500" />} />
            <CardContent>
              <div className={`text-3xl font-bold ${stats.lateReservations > 0 ? 'text-red-600' : 'text-royal-900'}`}>
                {stats.lateReservations}
              </div>
              <div className="text-xs text-royal-500">Dépassement</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Paiements */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-royal-600" />
          <h2 className="text-lg font-semibold text-royal-800">Statut paiements réservations</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card variant="elevated" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader title="Payées" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.reservationsPayees}</div>
              <div className="text-xs text-emerald-500">100% réglé</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader title="Paiement partiel" icon={<CircleDollarSign className="h-4 w-4 text-amber-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.reservationsPartielles}</div>
              <div className="text-xs text-amber-500">Acompte versé</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className={stats.reservationsNonPayees > 0 ? 'border-red-200 bg-gradient-to-br from-red-50 to-white ring-2 ring-red-200' : ''}>
            <CardHeader title="Non payées" icon={<Wallet className="h-4 w-4 text-red-500" />} />
            <CardContent>
              <div className={`text-3xl font-bold ${stats.reservationsNonPayees > 0 ? 'text-red-600' : 'text-royal-900'}`}>
                {stats.reservationsNonPayees}
              </div>
              <div className="text-xs text-royal-500">En attente</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Finances */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-royal-600" />
          <h2 className="text-lg font-semibold text-royal-800">Finances</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="glow" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader title="CA du jour" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">+{stats.revenueToday.toLocaleString()} MAD</div>
              <div className="text-xs text-emerald-500">Aujourd'hui</div>
            </CardContent>
          </Card>
          <Card variant="glow" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader title="CA du mois" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">+{stats.revenueMonth.toLocaleString()} MAD</div>
              <div className="text-xs text-emerald-500">Ce mois</div>
            </CardContent>
          </Card>
          <Card variant="elevated" className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader title="Dépenses du mois" icon={<TrendingDown className="h-4 w-4 text-red-500" />} />
            <CardContent>
              <div className="text-3xl font-bold text-red-600">-{stats.depensesMois.toLocaleString()} MAD</div>
              <div className="text-xs text-red-500">Ce mois</div>
            </CardContent>
          </Card>
          <Card variant="glow" className={stats.beneficeMois >= 0 ? 'border-royal-300 bg-gradient-to-br from-royal-100 to-royal-50 ring-2 ring-royal-200' : 'border-red-200 bg-gradient-to-br from-red-50 to-white'}>
            <CardHeader title="Bénéfice du mois" icon={<Sparkles className="h-4 w-4 text-royal-600" />} />
            <CardContent>
              <div className={`text-3xl font-bold ${stats.beneficeMois >= 0 ? 'text-royal-700' : 'text-red-600'}`}>
                {stats.beneficeMois >= 0 ? '+' : ''}{stats.beneficeMois.toLocaleString()} MAD
              </div>
              <div className="text-xs text-royal-500">Net</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demandes de reservation en attente */}
      {data.pendingReservations && data.pendingReservations.length > 0 && (
        <Card variant="glow" className="border-amber-300 ring-2 ring-amber-200">
          <CardHeader 
            title={`Demandes de réservation en attente (${data.pendingReservations.length})`}
            icon={<Clock className="h-5 w-5 text-amber-500" />}
          />
          <CardContent>
            {/* Vue Desktop - Tableau */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-royal-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Véhicule</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Période</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Prix</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Canal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pendingReservations.map((r) => (
                    <tr key={r.id} className="border-b border-royal-50 transition-colors hover:bg-royal-50/50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-royal-900">{r.vehicle}</span>
                        <span className="block text-xs text-royal-500">{r.vehicleImmat}</span>
                      </td>
                      <td className="px-4 py-3 text-royal-700">{r.client || r.clientInline || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs text-royal-600">
                        {new Date(r.debutAt).toLocaleDateString()} - {new Date(r.finAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-royal-800">{r.prix.toLocaleString()} MAD</td>
                      <td className="px-4 py-3"><Badge variant={r.canal === 'public' ? 'info' : 'neutral'}>{r.canal}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(r.id)}
                            disabled={actionLoading === r.id}
                            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {actionLoading === r.id ? '...' : 'Accepter'}
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            disabled={actionLoading === r.id}
                            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:from-red-600 hover:to-red-700 hover:shadow-md disabled:opacity-50"
                          >
                            Refuser
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vue Mobile - Cards */}
            <div className="lg:hidden space-y-3">
              {data.pendingReservations.map((r) => (
                <div key={r.id} className="rounded-xl border border-royal-100 bg-gradient-to-r from-royal-50 to-white p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-semibold text-royal-900">{r.vehicle}</span>
                      <span className="block text-xs text-royal-500">{r.vehicleImmat}</span>
                    </div>
                    <Badge variant={r.canal === 'public' ? 'info' : 'neutral'}>{r.canal}</Badge>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-royal-500">Client</span>
                      <span className="text-royal-800 font-medium">{r.client || r.clientInline || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-royal-500">Période</span>
                      <span className="text-royal-800 text-xs">
                        {new Date(r.debutAt).toLocaleDateString()} - {new Date(r.finAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-royal-500">Prix</span>
                      <span className="text-royal-800 font-bold">{r.prix.toLocaleString()} MAD</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(r.id)}
                      disabled={actionLoading === r.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {actionLoading === r.id ? '...' : 'Accepter'}
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={actionLoading === r.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-red-600 hover:to-red-700 disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader title="Alertes maintenance" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} />
          <CardContent>
            {data.maintenanceAlerts.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                Aucune alerte de maintenance
              </div>
            ) : (
              <ul className="space-y-3">
                {data.maintenanceAlerts.map((item, idx) => (
                  <li key={idx} className="rounded-xl border border-royal-100 bg-gradient-to-r from-royal-50 to-white p-3">
                    <span className="font-medium text-royal-800">{item.vehicle}</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.alerts.map((alert, i) => (
                        <Badge key={i} variant={alert.severity}>{alert.message}</Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader title="Actions rapides" icon={<Sparkles className="h-5 w-5 text-royal-500" />} />
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a href="/reservations" className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-royal-500 to-royal-600 p-4 text-sm font-medium text-white shadow-md transition-all hover:from-royal-600 hover:to-royal-700 hover:shadow-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Nouvelle Réservation
                </div>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="/vehicles" className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-royal-100 to-royal-50 p-4 text-sm font-medium text-royal-700 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Gérer Véhicules
                </div>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="/clients" className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-royal-100 to-royal-50 p-4 text-sm font-medium text-royal-700 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ajouter Client
                </div>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="/finances" className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-royal-100 to-royal-50 p-4 text-sm font-medium text-royal-700 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Voir Finances
                </div>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
