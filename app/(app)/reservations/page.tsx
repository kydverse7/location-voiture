"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type ReservationDisplay = {
  id: string;
  vehicleId: string;
  vehicle: string;
  vehicleImmat: string;
  clientId: string;
  client: string | null;
  clientDossierIncomplet?: boolean;
  clientInline?: { nom: string; prenom: string; telephone: string };
  debutAt: string;
  finAt: string;
  statut: string;
  paiementStatut: string;
  montantPaye: number;
  montantRestant: number;
  typePaiement: string;
  canal: string;
  prix?: { parJour?: number; totalEstime?: number };
};

type VehicleOption = { _id: string; modele: string; immatriculation: string; prixParJour?: number; statut?: string };
type ClientOption = { _id: string; nom: string; prenom?: string };

const statutVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  en_attente: 'warning',
  confirmee: 'info',
  en_cours: 'success',
  terminee: 'neutral',
  annulee: 'danger'
};

const paiementVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  paye: 'success',
  partiel: 'warning',
  plus_tard: 'danger'
};

const paiementLabels: Record<string, string> = {
  paye: 'Paye',
  partiel: 'Partiel',
  plus_tard: 'Non paye'
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationDisplay[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Formulaire nouvelle reservation
  const [showForm, setShowForm] = useState(false);
  const [clientMode, setClientMode] = useState<'existant' | 'nouveau'>('existant');
  const [form, setForm] = useState({
    vehicle: '',
    client: '',
    clientInline: { prenom: '', nom: '', telephone: '' },
    debutAt: '',
    finAt: '',
    prixParJour: 0,
    paiementStatut: 'plus_tard' as 'paye' | 'partiel' | 'plus_tard',
    montantPaye: 0,
    typePaiement: 'especes'
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal édition réservation
  const [showEditModal, setShowEditModal] = useState<ReservationDisplay | null>(null);
  const [editForm, setEditForm] = useState({
    debutAt: '',
    finAt: '',
    prixParJour: 0,
    vehicle: ''
  });

  // Modal encaissement reste
  const [showEncaissement, setShowEncaissement] = useState<ReservationDisplay | null>(null);
  const [encaissementForm, setEncaissementForm] = useState({ montant: 0, type: 'especes' });

  // Modal changer statut paiement
  const [showPaiementModal, setShowPaiementModal] = useState<ReservationDisplay | null>(null);
  const [paiementStatutForm, setPaiementStatutForm] = useState<'paye' | 'partiel' | 'plus_tard'>('paye');
  const [paiementMontantForm, setPaiementMontantForm] = useState<string>('');
  const [paiementTypeForm, setPaiementTypeForm] = useState<'especes' | 'carte' | 'virement' | 'cheque'>('especes');

  // Convertir une demande publique (clientInline) en Client enregistré
  const [showCreateClient, setShowCreateClient] = useState<ReservationDisplay | null>(null);
  const [createClientError, setCreateClientError] = useState('');
  const [createClientSubmitting, setCreateClientSubmitting] = useState(false);
  const [createClientForm, setCreateClientForm] = useState({
    type: 'particulier' as 'particulier' | 'entreprise',
    nom: '',
    prenom: '',
    telephone: '',
    documentType: 'cin' as 'cin' | 'passeport',
    documentNumber: ''
  });

  const totalEstime = (() => {
    if (!form.debutAt || !form.finAt) return 0;
    const debut = new Date(form.debutAt);
    const fin = new Date(form.finAt);
    const days = Math.max(1, Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)));
    return (form.prixParJour || 0) * days;
  })();

  const montantRestant = totalEstime - (form.montantPaye || 0);

  async function loadData() {
    const [resReservations, resVehicles, resClients] = await Promise.all([
      fetch('/api/reservations'),
      fetch('/api/vehicles'),
      fetch('/api/clients')
    ]);
    if (resReservations.ok) {
      const data = await resReservations.json();
      const mapped = (data.reservations as any[]).map((r) => ({
        id: r._id,
        vehicleId: r.vehicle?._id ?? r.vehicle,
        vehicle: r.vehicle?.modele ?? 'N/A',
        vehicleImmat: r.vehicle?.immatriculation ?? '',
        clientId: r.client?._id ?? r.client,
        client: r.client?.nom ? `${r.client.prenom ?? ''} ${r.client.nom}`.trim() : null,
        clientDossierIncomplet: !!r.client && (!r.client.documentType || !r.client.documentNumber),
        clientInline: r.clientInline,
        debutAt: r.debutAt,
        finAt: r.finAt,
        statut: r.statut,
        paiementStatut: r.paiementStatut ?? 'plus_tard',
        montantPaye: r.montantPaye ?? 0,
        montantRestant: r.montantRestant ?? 0,
        typePaiement: r.typePaiement ?? 'especes',
        canal: r.canal ?? 'interne',
        prix: r.prix
      }));
      setReservations(mapped);
    }
    if (resVehicles.ok) {
      const data = await resVehicles.json();
      setVehicles(data.vehicles ?? []);
    }
    if (resClients.ok) {
      const data = await resClients.json();
      setClients(data.clients ?? []);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Quand on selectionne un vehicule, mettre le prix par jour
  const handleVehicleChange = (vehicleId: string) => {
    setForm({ ...form, vehicle: vehicleId });
    const v = vehicles.find(v => v._id === vehicleId);
    if (v?.prixParJour) {
      setForm(f => ({ ...f, vehicle: vehicleId, prixParJour: v.prixParJour || 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload: any = {
      vehicle: form.vehicle,
      debutAt: form.debutAt,
      finAt: form.finAt,
      prix: { parJour: form.prixParJour, totalEstime },
      paiementStatut: form.paiementStatut,
      montantPaye: form.paiementStatut === 'paye' ? totalEstime : (form.paiementStatut === 'partiel' ? form.montantPaye : 0),
      montantRestant: form.paiementStatut === 'paye' ? 0 : (form.paiementStatut === 'partiel' ? montantRestant : totalEstime),
      typePaiement: form.typePaiement,
      canal: 'interne'
    };

    if (clientMode === 'existant' && form.client) {
      payload.client = form.client;
    } else if (clientMode === 'nouveau') {
      payload.clientInline = form.clientInline;
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Erreur lors de la creation');
        setSubmitting(false);
        return;
      }
      setForm({
        vehicle: '', client: '', clientInline: { prenom: '', nom: '', telephone: '' },
        debutAt: '', finAt: '', prixParJour: 0, paiementStatut: 'plus_tard', montantPaye: 0, typePaiement: 'especes'
      });
      setShowForm(false);
      loadData();
    } catch {
      setError('Erreur reseau');
    }
    setSubmitting(false);
  };

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    const res = await fetch(`/api/reservations/${id}/accept`, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || data.message || 'Erreur');
    }
    setActionLoading(null);
    loadData();
  };

  const handleReject = async (id: string) => {
    if (!confirm('Annuler cette reservation ?')) return;
    setActionLoading(id);
    await fetch(`/api/reservations/${id}/reject`, { method: 'POST' });
    setActionLoading(null);
    loadData();
  };

  // Mettre en location (en_cours) et vehicule en loue
  const handleStartLocation = async (id: string) => {
    setActionLoading(id);
    const res = await fetch(`/api/reservations/${id}/start`, { method: 'POST' });
    if (!res.ok) {
      alert('Erreur lors du demarrage de la location');
    }
    setActionLoading(null);
    loadData();
  };

  // Terminer la location
  const handleEndLocation = async (id: string) => {
    if (!confirm('Terminer cette location et remettre le vehicule disponible ?')) return;
    setActionLoading(id);
    const res = await fetch(`/api/reservations/${id}/end`, { method: 'POST' });
    if (!res.ok) {
      alert('Erreur lors de la fin de location');
    }
    setActionLoading(null);
    loadData();
  };

  const handleEditSubmit = async () => {
    if (!showEditModal) return;
    setActionLoading(showEditModal.id);
    
    // Recalculer total estimé
    const debut = new Date(editForm.debutAt);
    const fin = new Date(editForm.finAt);
    const days = Math.max(1, Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)));
    const totalEstime = (editForm.prixParJour || 0) * days;

    const payload = {
      debutAt: editForm.debutAt,
      finAt: editForm.finAt,
      vehicle: editForm.vehicle,
      prix: { parJour: editForm.prixParJour, totalEstime }
    };

    const res = await fetch(`/api/reservations/${showEditModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert('Erreur modification réservation');
    }
    setShowEditModal(null);
    setActionLoading(null);
    loadData();
  };

  const openEditModal = (r: ReservationDisplay) => {
    setShowEditModal(r);
    setEditForm({
      debutAt: r.debutAt.slice(0, 10),
      finAt: r.finAt.slice(0, 10),
      prixParJour: r.prix?.parJour ?? 0,
      vehicle: r.vehicleId
    });
  };

  // Encaisser le reste
  const handleEncaissement = async () => {
    if (!showEncaissement) return;
    setActionLoading(showEncaissement.id);
    const res = await fetch(`/api/reservations/${showEncaissement.id}/encaisser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encaissementForm)
    });
    if (!res.ok) {
      alert('Erreur lors de l\'encaissement');
    }
    setShowEncaissement(null);
    setActionLoading(null);
    loadData();
  };

  // Changer statut paiement via endpoint dédié
  const handleChangePaiementStatut = async () => {
    if (!showPaiementModal) return;
    setActionLoading(showPaiementModal.id);

    const montantNum = paiementMontantForm.trim() === '' ? null : Number(paiementMontantForm);
    if (paiementStatutForm === 'partiel' && (!montantNum || montantNum <= 0)) {
      alert('Veuillez saisir le montant encaissé (paiement partiel).');
      setActionLoading(null);
      return;
    }

    const res = await fetch(`/api/reservations/${showPaiementModal.id}/paiement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paiementStatut: paiementStatutForm, montant: montantNum, type: paiementTypeForm })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Erreur changement statut paiement');
    }
    setShowPaiementModal(null);
    setActionLoading(null);
    loadData();
  };

  // Télécharger facture PDF
  const handleDownloadInvoice = async (r: ReservationDisplay) => {
    const res = await fetch('/api/pdf/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: r.id })
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      alert('Erreur génération facture');
    }
  };

  const getClientDisplay = (r: ReservationDisplay) => {
    if (r.client) return r.client;
    if (r.clientInline) return `${r.clientInline.prenom} ${r.clientInline.nom}`;
    return 'N/A';
  };

  const openCreateClient = (r: ReservationDisplay) => {
    setCreateClientError('');
    setShowCreateClient(r);
    setCreateClientForm({
      type: 'particulier',
      nom: r.clientInline?.nom ?? '',
      prenom: r.clientInline?.prenom ?? '',
      telephone: r.clientInline?.telephone ?? '',
      documentType: 'cin',
      documentNumber: ''
    });
  };

  const handleCreateClientAndLink = async () => {
    if (!showCreateClient) return;
    setCreateClientError('');
    setCreateClientSubmitting(true);
    try {
      if (!createClientForm.nom || !createClientForm.telephone || !createClientForm.documentNumber) {
        setCreateClientError('Nom, téléphone et numéro de document requis');
        setCreateClientSubmitting(false);
        return;
      }

      const resClient = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createClientForm)
      });
      if (!resClient.ok) {
        const data = await resClient.json().catch(() => ({}));
        setCreateClientError(data.error?.message || data.error || 'Erreur création client');
        setCreateClientSubmitting(false);
        return;
      }
      const dataClient = await resClient.json();
      const clientId = dataClient?.client?._id || dataClient?.client?.id;
      if (!clientId) {
        setCreateClientError('Client créé mais id introuvable');
        setCreateClientSubmitting(false);
        return;
      }

      const resLink = await fetch(`/api/reservations/${showCreateClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: clientId, clientInline: null })
      });
      if (!resLink.ok) {
        const data = await resLink.json().catch(() => ({}));
        setCreateClientError(data.error || data.message || 'Erreur liaison réservation');
        setCreateClientSubmitting(false);
        return;
      }

      setShowCreateClient(null);
      await loadData();
    } catch {
      setCreateClientError('Erreur réseau');
    } finally {
      setCreateClientSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold sm:text-xl">Réservations</h1>
          <p className="text-xs text-slate-600 sm:text-sm">Gestion des réservations et locations.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          {showForm ? 'Annuler' : '+ Nouvelle Réservation'}
        </Button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      {/* Formulaire nouvelle reservation */}
      {showForm && (
        <Card>
          <CardHeader title="Nouvelle Reservation" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Vehicule */}
                <div>
                  <label className="text-sm font-medium">Vehicule *</label>
                  <select className="select" value={form.vehicle} onChange={(e) => handleVehicleChange(e.target.value)} required>
                    <option value="">-- Selectionner --</option>
                    {vehicles.filter(v => v.statut !== 'loue').map((v) => (
                      <option key={v._id} value={v._id}>{v.modele} ({v.immatriculation})</option>
                    ))}
                  </select>
                </div>

                {/* Mode client */}
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => setClientMode('existant')}
                      className={`px-3 py-1 text-sm rounded ${clientMode === 'existant' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
                      Existant
                    </button>
                    <button type="button" onClick={() => setClientMode('nouveau')}
                      className={`px-3 py-1 text-sm rounded ${clientMode === 'nouveau' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
                      Nouveau
                    </button>
                  </div>
                  {clientMode === 'existant' ? (
                    <select className="select" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}>
                      <option value="">-- Selectionner --</option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>{c.prenom} {c.nom}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="grid gap-2">
                      <input type="text" className="input" placeholder="Prenom"
                        value={form.clientInline.prenom} onChange={(e) => setForm({ ...form, clientInline: { ...form.clientInline, prenom: e.target.value } })} />
                      <input type="text" className="input" placeholder="Nom"
                        value={form.clientInline.nom} onChange={(e) => setForm({ ...form, clientInline: { ...form.clientInline, nom: e.target.value } })} />
                      <input type="tel" className="input" placeholder="Telephone"
                        value={form.clientInline.telephone} onChange={(e) => setForm({ ...form, clientInline: { ...form.clientInline, telephone: e.target.value } })} />
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div>
                  <label className="text-sm font-medium">Date debut *</label>
                  <input type="date" className="input" value={form.debutAt} onChange={(e) => setForm({ ...form, debutAt: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Date fin *</label>
                  <input type="date" className="input" value={form.finAt} onChange={(e) => setForm({ ...form, finAt: e.target.value })} required />
                </div>

                {/* Prix */}
                <div>
                  <label className="text-sm font-medium">Prix par jour (MAD)</label>
                  <input type="number" className="input" value={form.prixParJour} onChange={(e) => setForm({ ...form, prixParJour: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Total estime</label>
                  <div className="input bg-slate-100 font-semibold">{totalEstime.toLocaleString()} MAD</div>
                </div>
              </div>

              {/* Section Paiement */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Paiement</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Statut paiement</label>
                    <select className="select" value={form.paiementStatut} onChange={(e) => setForm({ ...form, paiementStatut: e.target.value as any })}>
                      <option value="paye">Paye integralement</option>
                      <option value="partiel">Paiement partiel</option>
                      <option value="plus_tard">Payer plus tard</option>
                    </select>
                  </div>

                  {form.paiementStatut !== 'plus_tard' && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Type de paiement</label>
                        <select className="select" value={form.typePaiement} onChange={(e) => setForm({ ...form, typePaiement: e.target.value })}>
                          <option value="especes">Especes</option>
                          <option value="carte">Carte bancaire</option>
                          <option value="virement">Virement</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </div>

                      {form.paiementStatut === 'partiel' && (
                        <div>
                          <label className="text-sm font-medium">Montant paye (MAD)</label>
                          <input type="number" className="input" value={form.montantPaye}
                            onChange={(e) => setForm({ ...form, montantPaye: Number(e.target.value) })} max={totalEstime} />
                          <p className="text-xs text-slate-500 mt-1">Reste a payer: {montantRestant.toLocaleString()} MAD</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" className="bg-slate-200 text-slate-700" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creation...' : 'Creer la reservation'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des reservations */}
      <Card>
        <CardHeader title="Liste des réservations" />
        <CardContent className="p-0 sm:p-6">
          {reservations.length === 0 ? (
            <p className="text-sm text-slate-500 p-4 sm:p-0">Aucune réservation.</p>
          ) : (
            <>
              {/* Vue Desktop - Tableau */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Véhicule</th>
                      <th>Client</th>
                      <th>Période</th>
                      <th>Total</th>
                      <th>Paiement</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="font-medium">{r.vehicle}</div>
                          <div className="text-xs text-slate-500">{r.vehicleImmat}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span>{getClientDisplay(r)}</span>
                            {r.clientDossierIncomplet && <Badge variant="warning" size="sm">Incomplet</Badge>}
                          </div>
                        </td>
                        <td className="text-xs">
                          {new Date(r.debutAt).toLocaleDateString()} - {new Date(r.finAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="font-medium">{r.prix?.totalEstime?.toLocaleString() ?? '-'} MAD</div>
                          {r.paiementStatut === 'partiel' && (
                            <div className="text-xs text-orange-600">Reste: {r.montantRestant.toLocaleString()} MAD</div>
                          )}
                        </td>
                        <td>
                          <Badge variant={paiementVariant[r.paiementStatut] ?? 'danger'}>
                            {paiementLabels[r.paiementStatut] ?? r.paiementStatut}
                          </Badge>
                          <div className="flex flex-col gap-1 mt-1">
                            {r.paiementStatut === 'partiel' && (
                              <button
                                onClick={() => { setShowEncaissement(r); setEncaissementForm({ montant: r.montantRestant, type: 'especes' }); }}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Encaisser reste
                              </button>
                            )}
                            {r.statut !== 'annulee' && (
                              <button
                                onClick={() => {
                                  const total = r.prix?.totalEstime ?? 0;
                                  const reste = Math.max(0, total - (r.montantPaye ?? 0));
                                  setShowPaiementModal(r);
                                  setPaiementStatutForm(r.paiementStatut as any);
                                  setPaiementTypeForm((r.typePaiement as any) ?? 'especes');
                                  setPaiementMontantForm(reste > 0 ? String(reste) : '');
                                }}
                                className="text-xs text-slate-600 hover:underline"
                              >
                                Changer statut
                              </button>
                            )}
                          </div>
                        </td>
                        <td><Badge variant={statutVariant[r.statut] ?? 'neutral'}>{r.statut}</Badge></td>
                        <td>
                          <div className="flex flex-col gap-1">
                        {r.statut === 'en_attente' && (
                          <>
                            {!r.client && r.clientInline && (
                              <button
                                onClick={() => openCreateClient(r)}
                                disabled={actionLoading === r.id}
                                className="text-xs text-primary hover:underline"
                              >
                                Creer client
                              </button>
                            )}
                            <button onClick={() => openEditModal(r)} disabled={actionLoading === r.id}
                              className="text-xs text-blue-600 hover:underline">Modifier</button>
                            <button onClick={() => handleAccept(r.id)} disabled={actionLoading === r.id}
                              className="text-xs text-green-600 hover:underline">Confirmer</button>
                            <button onClick={() => handleReject(r.id)} disabled={actionLoading === r.id}
                              className="text-xs text-red-600 hover:underline">Refuser</button>
                          </>
                        )}
                        {r.statut === 'confirmee' && (
                          <>
                            <button onClick={() => openEditModal(r)} disabled={actionLoading === r.id}
                              className="text-xs text-blue-600 hover:underline">Modifier</button>
                            <button onClick={() => handleStartLocation(r.id)} disabled={actionLoading === r.id}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                              Demarrer location
                            </button>
                            <button onClick={() => handleReject(r.id)} disabled={actionLoading === r.id}
                              className="text-xs text-red-600 hover:underline">Annuler</button>
                          </>
                        )}
                        {r.statut === 'en_cours' && (
                          <span className="text-xs text-slate-500 italic">
                            Location en cours
                            <a href="/locations" className="block text-blue-600 hover:underline mt-1">
                              → Voir les locations
                            </a>
                          </span>
                        )}
                        {r.statut === 'terminee' && (
                          <button onClick={() => handleDownloadInvoice(r)} className="text-xs text-blue-600 hover:underline">
                            Facture PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>

              {/* Vue Mobile/Tablet - Cards */}
              <div className="lg:hidden divide-y divide-royal-100">
                {reservations.map((r) => (
                  <div key={r.id} className="p-4 space-y-3">
                    {/* Header card */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-royal-900">{r.vehicle}</div>
                        <div className="text-xs text-slate-500">{r.vehicleImmat}</div>
                      </div>
                      <Badge variant={statutVariant[r.statut] ?? 'neutral'}>{r.statut}</Badge>
                    </div>
                    
                    {/* Client */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Client:</span>
                      <span className="font-medium flex items-center gap-2">
                        {getClientDisplay(r)}
                        {r.clientDossierIncomplet && <Badge variant="warning" size="sm">!</Badge>}
                      </span>
                    </div>
                    
                    {/* Période */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Période:</span>
                      <span className="text-xs">{new Date(r.debutAt).toLocaleDateString()} → {new Date(r.finAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Prix et Paiement */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-royal-900">{r.prix?.totalEstime?.toLocaleString() ?? '-'} MAD</div>
                        {r.paiementStatut === 'partiel' && (
                          <div className="text-xs text-orange-600">Reste: {r.montantRestant.toLocaleString()} MAD</div>
                        )}
                      </div>
                      <Badge variant={paiementVariant[r.paiementStatut] ?? 'danger'}>
                        {paiementLabels[r.paiementStatut] ?? r.paiementStatut}
                      </Badge>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-royal-50">
                      {r.statut === 'en_attente' && (
                        <>
                          {!r.client && r.clientInline && (
                            <button onClick={() => openCreateClient(r)} disabled={actionLoading === r.id}
                              className="text-xs px-2 py-1 rounded bg-royal-50 text-royal-700 hover:bg-royal-100">Créer client</button>
                          )}
                          <button onClick={() => openEditModal(r)} disabled={actionLoading === r.id}
                            className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Modifier</button>
                          <button onClick={() => handleAccept(r.id)} disabled={actionLoading === r.id}
                            className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">Confirmer</button>
                          <button onClick={() => handleReject(r.id)} disabled={actionLoading === r.id}
                            className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Rejeter</button>
                        </>
                      )}
                      {r.statut === 'confirmee' && (
                        <>
                          <button onClick={() => handleStartLocation(r.id)} disabled={actionLoading === r.id}
                            className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">Démarrer</button>
                          <button onClick={() => handleReject(r.id)} disabled={actionLoading === r.id}
                            className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Annuler</button>
                        </>
                      )}
                      {r.statut === 'en_cours' && (
                        <span className="text-xs text-slate-500 italic">
                          Location en cours
                          <a href="/locations" className="block text-blue-600 hover:underline mt-1">→ Voir locations</a>
                        </span>
                      )}
                      {r.paiementStatut === 'partiel' && (
                        <button onClick={() => { setShowEncaissement(r); setEncaissementForm({ montant: r.montantRestant, type: 'especes' }); }}
                          className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Encaisser</button>
                      )}
                      {r.statut === 'terminee' && (
                        <button onClick={() => handleDownloadInvoice(r)}
                          className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Facture PDF</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Édition Réservation */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setShowEditModal(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-lg w-full sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Modifier la réservation</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Véhicule</label>
                <select className="select" value={editForm.vehicle} onChange={(e) => setEditForm({ ...editForm, vehicle: e.target.value })}>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>{v.modele} ({v.immatriculation})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Début</label>
                  <input type="date" className="input" value={editForm.debutAt} onChange={(e) => setEditForm({ ...editForm, debutAt: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Fin</label>
                  <input type="date" className="input" value={editForm.finAt} onChange={(e) => setEditForm({ ...editForm, finAt: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Prix par jour (MAD)</label>
                <input type="number" className="input" value={editForm.prixParJour} onChange={(e) => setEditForm({ ...editForm, prixParJour: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <Button type="button" className="bg-slate-200 text-slate-700 w-full sm:w-auto" onClick={() => setShowEditModal(null)}>Annuler</Button>
                <Button onClick={handleEditSubmit} disabled={actionLoading === showEditModal.id} className="w-full sm:w-auto">
                  {actionLoading === showEditModal.id ? 'Modification...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Encaissement */}
      {showEncaissement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setShowEncaissement(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-lg w-full sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Encaisser le reste</h2>
            <p className="text-sm text-slate-600 mb-4">
              Réservation: {showEncaissement.vehicle}<br />
              Montant restant: <strong>{showEncaissement.montantRestant.toLocaleString()} MAD</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Montant à encaisser (MAD)</label>
                <input type="number" className="input" value={encaissementForm.montant}
                  onChange={(e) => setEncaissementForm({ ...encaissementForm, montant: Number(e.target.value) })}
                  max={showEncaissement.montantRestant} />
              </div>
              <div>
                <label className="text-sm font-medium">Type de paiement</label>
                <select className="select" value={encaissementForm.type}
                  onChange={(e) => setEncaissementForm({ ...encaissementForm, type: e.target.value })}>
                  <option value="especes">Especes</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" className="bg-slate-200 text-slate-700" onClick={() => setShowEncaissement(null)}>Annuler</Button>
                <Button onClick={handleEncaissement} disabled={actionLoading === showEncaissement.id}>
                  {actionLoading === showEncaissement.id ? 'Encaissement...' : 'Encaisser'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création client */}
      {showCreateClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateClient(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Créer un client</h2>
            <p className="text-sm text-slate-600 mb-4">
              Cette demande vient du public. On crée un client complet (CIN/Passeport) puis on lie la réservation.
            </p>

            {createClientError && (
              <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {createClientError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  className="select"
                  value={createClientForm.type}
                  onChange={(e) => setCreateClientForm({ ...createClientForm, type: e.target.value as any })}
                >
                  <option value="particulier">Particulier</option>
                  <option value="entreprise">Entreprise</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Prénom</label>
                  <input
                    className="input"
                    value={createClientForm.prenom}
                    onChange={(e) => setCreateClientForm({ ...createClientForm, prenom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nom *</label>
                  <input
                    className="input"
                    value={createClientForm.nom}
                    onChange={(e) => setCreateClientForm({ ...createClientForm, nom: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Téléphone *</label>
                <input
                  className="input"
                  value={createClientForm.telephone}
                  onChange={(e) => setCreateClientForm({ ...createClientForm, telephone: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Type de document</label>
                  <select
                    className="select"
                    value={createClientForm.documentType}
                    onChange={(e) => setCreateClientForm({ ...createClientForm, documentType: e.target.value as any })}
                  >
                    <option value="cin">CIN</option>
                    <option value="passeport">Passeport</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Numéro *</label>
                  <input
                    className="input"
                    value={createClientForm.documentNumber}
                    onChange={(e) => setCreateClientForm({ ...createClientForm, documentNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" className="bg-slate-200 text-slate-700" onClick={() => setShowCreateClient(null)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateClientAndLink} disabled={createClientSubmitting}>
                  {createClientSubmitting ? 'Création...' : 'Créer et lier'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Changer statut paiement */}
      {showPaiementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPaiementModal(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Changer le statut de paiement</h2>
            <p className="text-sm text-slate-600 mb-4">
              Réservation: {showPaiementModal.vehicle}<br />
              Total: <strong>{showPaiementModal.prix?.totalEstime?.toLocaleString() ?? '-'} MAD</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nouveau statut</label>
                <select className="select" value={paiementStatutForm}
                  onChange={(e) => setPaiementStatutForm(e.target.value as any)}>
                  <option value="paye">Payé intégralement</option>
                  <option value="partiel">Paiement partiel</option>
                  <option value="plus_tard">Non payé</option>
                </select>
              </div>

              {paiementStatutForm !== 'plus_tard' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Type de paiement</label>
                    <select
                      className="select"
                      value={paiementTypeForm}
                      onChange={(e) => setPaiementTypeForm(e.target.value as any)}
                    >
                      <option value="especes">Espèces</option>
                      <option value="carte">Carte</option>
                      <option value="virement">Virement</option>
                      <option value="cheque">Chèque</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Montant encaissé (MAD){paiementStatutForm === 'partiel' ? ' *' : ''}
                    </label>
                    <input
                      className="input"
                      inputMode="numeric"
                      value={paiementMontantForm}
                      onChange={(e) => setPaiementMontantForm(e.target.value)}
                      placeholder={paiementStatutForm === 'paye' ? 'Laisser vide = encaisser le reste' : 'Ex: 500'}
                    />
                    {paiementStatutForm === 'paye' && (
                      <div className="text-xs text-slate-500 mt-1">Si vide, le système encaisse automatiquement le reste.</div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" className="bg-slate-200 text-slate-700" onClick={() => setShowPaiementModal(null)}>Annuler</Button>
                <Button onClick={handleChangePaiementStatut} disabled={actionLoading === showPaiementModal.id}>
                  {actionLoading === showPaiementModal.id ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
