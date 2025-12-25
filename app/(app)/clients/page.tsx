"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, UserPlus, Phone, FileText, AlertCircle, CheckCircle, Edit } from 'lucide-react';

type Client = {
  _id: string;
  nom: string;
  prenom?: string;
  telephone: string;
  type: string;
  documentType?: string;
  documentNumber?: string;
  blacklist?: { actif: boolean };
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        setClients(data.clients ?? []);
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
            <Users className="h-6 w-6 text-white sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-royal-900 sm:text-2xl">Clients</h1>
            <p className="text-xs text-royal-600 sm:text-sm">Particuliers et entreprises avec historique</p>
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/clients/new" className="flex items-center justify-center gap-2">
            <UserPlus className="h-4 w-4" />
            Ajouter client
          </Link>
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader title="Liste des clients" icon={<Users className="h-5 w-5 text-royal-600" />} />
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-200 border-t-royal-600"></div>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-royal-500 px-4">
              <Users className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">Aucun client enregistré</p>
              <Link href="/clients/new" className="mt-3 text-sm text-royal-600 underline hover:text-royal-700">
                Ajouter un client
              </Link>
            </div>
          ) : (
            <>
              {/* Vue Desktop - Tableau */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-royal-100">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Nom</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">
                        <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> Téléphone</span>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">
                        <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Document</span>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-royal-700">Statut</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr key={c._id} className="border-b border-royal-50 transition-colors hover:bg-royal-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-royal-900">{c.prenom} {c.nom}</span>
                            {(!c.documentType || !c.documentNumber) && (
                              <Badge variant="warning" size="sm">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Incomplet
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-royal-100 px-2.5 py-1 text-xs font-medium text-royal-700">
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-royal-600">{c.telephone}</td>
                        <td className="px-4 py-3">
                          {c.documentType && c.documentNumber ? (
                            <span className="font-mono text-sm text-royal-700">{c.documentType.toUpperCase()} {c.documentNumber}</span>
                          ) : (
                            <span className="text-xs text-royal-400">Non renseigné</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.blacklist?.actif ? (
                            <Badge variant="danger">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Blacklist
                            </Badge>
                          ) : (
                            <Badge variant="success">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              OK
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            href={`/clients/${c._id}`} 
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
                {clients.map((c) => (
                  <div key={c._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-royal-900">{c.prenom} {c.nom}</div>
                        <div className="text-xs text-royal-600">{c.telephone}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-full bg-royal-100 px-2.5 py-0.5 text-xs font-medium text-royal-700">
                          {c.type}
                        </span>
                        {c.blacklist?.actif ? (
                          <Badge variant="danger" size="sm">Blacklist</Badge>
                        ) : (
                          <Badge variant="success" size="sm">OK</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Document:</span>
                      {c.documentType && c.documentNumber ? (
                        <span className="font-mono text-xs text-royal-700">{c.documentType.toUpperCase()} {c.documentNumber}</span>
                      ) : (
                        <Badge variant="warning" size="sm">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Non renseigné
                        </Badge>
                      )}
                    </div>
                    
                    <Link 
                      href={`/clients/${c._id}`} 
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
