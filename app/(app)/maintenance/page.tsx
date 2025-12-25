"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  ArrowRight,
  Car,
  Shield,
  Calendar,
  Gauge
} from 'lucide-react';

type Alert = {
  type: string;
  label: string;
  vehicle: string;
  vehicleId: string;
  urgence: 'high' | 'medium' | 'low';
  detail: string;
};

const urgenceVariant: Record<string, 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info'
};

const urgenceIcon: Record<string, React.ReactNode> = {
  high: <AlertTriangle className="h-4 w-4" />,
  medium: <Calendar className="h-4 w-4" />,
  low: <Gauge className="h-4 w-4" />
};

export default function MaintenancePage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/maintenance/alerts')
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.alerts ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-500 to-royal-600 shadow-glow">
          <Wrench className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-royal-900">Maintenance & Alertes</h1>
          <p className="text-sm text-royal-600">Planning entretien, assurances, vignettes, contrôles techniques</p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader title="Alertes actives" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-200 border-t-royal-600"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
              <CheckCircle className="h-6 w-6" />
              <div>
                <p className="font-medium">Aucune alerte</p>
                <p className="text-sm opacity-80">Tous les véhicules sont à jour</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-xl border border-royal-100 bg-gradient-to-r from-royal-50 to-white p-4 transition-colors hover:border-royal-200">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      a.urgence === 'high' ? 'bg-red-100 text-red-600' :
                      a.urgence === 'medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {urgenceIcon[a.urgence]}
                    </div>
                    <div>
                      <div className="font-medium text-royal-800">{a.label}</div>
                      <Link href={`/vehicles/${a.vehicleId}`} className="flex items-center gap-1 text-xs text-royal-600 hover:text-royal-700 hover:underline">
                        <Car className="h-3 w-3" />
                        {a.vehicle}
                      </Link>
                    </div>
                  </div>
                  <Badge variant={urgenceVariant[a.urgence]}>{a.detail}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader title="Configurer les alertes" icon={<Settings className="h-5 w-5 text-royal-600" />} />
        <CardContent>
          <div className="rounded-xl bg-gradient-to-r from-royal-50 to-white p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-royal-600" />
              <div>
                <p className="text-sm text-royal-700">
                  Les alertes sont configurées dans la fiche de chaque véhicule (dates d'expiration assurance, vignette, contrôle technique, et kilométrage de vidange).
                </p>
                <Link href="/vehicles" className="group mt-3 inline-flex items-center gap-2 text-sm font-medium text-royal-600 hover:text-royal-700">
                  Gérer les véhicules
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
