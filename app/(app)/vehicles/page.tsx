"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Car, Plus, Fuel, Settings, Edit, Gauge } from 'lucide-react';

type Vehicle = {
  _id: string;
  marque: string;
  modele: string;
  immatriculation: string;
  statut: string;
  carburant: string;
  boite: string;
  kilometrage: number;
};

const statutVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  // Canonique (DB)
  disponible: 'success',
  loue: 'info',
  reserve: 'warning',
  maintenance: 'danger',
  // Anciennes variantes (UI/legacy)
  'loué': 'info',
  'réservé': 'warning',
  'en maintenance': 'danger'
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data.vehicles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-royal-500 to-royal-600 shadow-glow sm:h-14 sm:w-14 sm:rounded-2xl">
            <Car className="h-6 w-6 text-white sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-royal-900 sm:text-2xl">Véhicules</h1>
            <p className="text-xs text-royal-600 sm:text-sm">Gestion du parc et statuts en temps réel</p>
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/vehicles/new" className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Nouveau véhicule</span>
          </Link>
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader title="Parc automobile" icon={<Car className="h-5 w-5 text-royal-600" />} />
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-200 border-t-royal-600"></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-royal-500 px-4">
              <Car className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">Aucun véhicule enregistré</p>
              <Link href="/vehicles/new" className="mt-3 text-sm text-royal-600 underline hover:text-royal-700">
                Ajouter un véhicule
              </Link>
            </div>
          ) : (
            <>
              {/* Vue Desktop - Tableau */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-royal-100">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Marque</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Modèle</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Immat.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">
                        <span className="flex items-center gap-1"><Fuel className="h-4 w-4" /> Carburant</span>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">
                        <span className="flex items-center gap-1"><Settings className="h-4 w-4" /> Boîte</span>
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-royal-700">
                        <span className="flex items-center justify-end gap-1"><Gauge className="h-4 w-4" /> Km</span>
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v._id} className="border-b border-royal-50 transition-colors hover:bg-royal-50/50">
                        <td className="px-4 py-3 font-medium text-royal-900">{v.marque}</td>
                        <td className="px-4 py-3 text-royal-700">{v.modele}</td>
                        <td className="px-4 py-3 font-mono text-sm text-royal-600">{v.immatriculation}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statutVariant[v.statut] ?? 'neutral'}>{v.statut}</Badge>
                        </td>
                        <td className="px-4 py-3 text-royal-600">{v.carburant}</td>
                        <td className="px-4 py-3 text-royal-600">{v.boite}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-royal-700">{(v.kilometrage ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Link 
                            href={`/vehicles/${v._id}`} 
                            className="inline-flex items-center gap-1 rounded-lg bg-royal-100 px-3 py-1.5 text-sm font-medium text-royal-700 transition-colors hover:bg-royal-200"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Modifier
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vue Mobile/Tablet - Cards */}
              <div className="lg:hidden divide-y divide-royal-100">
                {vehicles.map((v) => (
                  <div key={v._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-royal-900">{v.marque} {v.modele}</div>
                        <div className="text-xs font-mono text-royal-600">{v.immatriculation}</div>
                      </div>
                      <Badge variant={statutVariant[v.statut] ?? 'neutral'}>{v.statut}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-royal-50 text-royal-700">
                        <Fuel className="h-3 w-3" /> {v.carburant}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-royal-50 text-royal-700">
                        <Settings className="h-3 w-3" /> {v.boite}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-royal-50 text-royal-700">
                        <Gauge className="h-3 w-3" /> {(v.kilometrage ?? 0).toLocaleString()} km
                      </span>
                    </div>
                    
                    <Link 
                      href={`/vehicles/${v._id}`} 
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-royal-100 px-3 py-2 text-sm font-medium text-royal-700 transition-colors hover:bg-royal-200"
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
