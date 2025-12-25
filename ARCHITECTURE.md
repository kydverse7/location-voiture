# Architecture fonctionnelle et technique (MVP mono-agence)

## Stack
- Next.js 16 (App Router) + TypeScript
- UI: Tailwind CSS + composants réutilisables
- Backend: API Routes (app/api) avec Mongoose (MongoDB Atlas)
- Auth employé: email/mot de passe, rôles `admin` / `agent`
- Stockage fichiers: adaptateur local ou S3-compatible
- PDF: contrats et factures (ex: `pdfkit`)
- Notifications mock: WhatsApp/SMS/Email via adapter unique (log + queue mémoire)

## Schéma de données MongoDB (Mongoose)
- `User` { email, hash, role, name, phone, status, lastLoginAt, permissions? } 
- `AuditLog` { actor: UserRef, action, entityType, entityId, before, after, ip, userAgent, createdAt }
- `Vehicle` { marque, modele, annee, carburant, boite, immatriculation, kilometrage, statut, photos[], historique: { locations[], incidents[], maintenances[] }, alerts { vidangeAtKm, assuranceExpireLe, vignetteExpireLe, controleTechniqueExpireLe } }
- `Client` { type: 'particulier'|'entreprise', nom, prenom, documentType, documentNumber, telephone, whatsapp, permisRectoUrl, permisVersoUrl, permisExpireLe, notesInternes, blacklist: { actif, motif }, historiqueLocations[] }
- `Reservation` { vehicle: VehicleRef, client: ClientRef, createdBy: UserRef, statut: 'reserve'|'confirme'|'en_cours'|'terminee'|'annulee', debutAt, finAt, prix: { parJour, parSemaine, parMois, totalEstime }, caution: { montant, statut }, retardMinutes, canal: 'interne'|'public', paiementStatut: 'paye'|'en_attente'|'partiel', contratPdfUrl?, etatDesLieuxId?, notifications[] }
- `Location` { reservation: ReservationRef, vehicle, client, statut: 'en_cours'|'terminee'|'annulee', debutAt, finPrevueAt, finReelleAt?, prolongations[], montantTotal, caution, paiements[], contratPdfUrl, etatDesLieuxAvantId, etatDesLieuxApresId }
- `Payment` { location: LocationRef, type: 'cash'|'virement'|'carte', montant, statut, reference?, notes }
- `Maintenance` { vehicle: VehicleRef, type: 'entretien'|'assurance'|'carburant'|'reparation', description, cout, date, prochaineEcheance? }
- `Incident` { vehicle: VehicleRef, location?, description, cout, photos[], date }
- `EtatDesLieux` { vehicle: VehicleRef, location: LocationRef, moment: 'avant'|'apres', schemaPoints[], photos[], remarques, signatureDataUrl?, signePar?, signeLe }
- `Notification` { type: 'whatsapp'|'sms'|'email', canal: 'reservation'|'retard'|'rappel_retour'|'interne', payload, statut, sentAt?, to }

## Règles métier clés
- Statut véhicule: auto mis à jour par les locations (en cours -> loué, réservée -> réservé, maintenance -> en maintenance, sinon disponible).
- Blacklist client: empêche confirmation de réservation (admin peut override).
- Prolongation: met à jour `finPrevueAt` et recalcul du montant.
- AuditLog obligatoire pour actions sensibles: création/modif/suppression véhicules, paiements, contrats, utilisateurs.

## Structure Next.js (app router)
```
app/
  layout.tsx
  page.tsx (dashboard)
  vehicles/
    page.tsx
    [id]/page.tsx
  clients/
    page.tsx
    [id]/page.tsx
  reservations/
    page.tsx
    [id]/page.tsx
  finances/page.tsx
  maintenance/page.tsx
  auth/
    login/page.tsx
  public-site/
    page.tsx (catalogue + CTA WhatsApp + réservation publique)
    [vehicleId]/page.tsx
  api/
    auth/login/route.ts
    auth/logout/route.ts
    auth/me/route.ts
    users/route.ts
    vehicles/route.ts
    vehicles/[id]/route.ts
    clients/route.ts
    clients/[id]/route.ts
    reservations/route.ts
    reservations/[id]/route.ts
    locations/route.ts
    locations/[id]/route.ts
    payments/route.ts
    maintenances/route.ts
    incidents/route.ts
    etats-des-lieux/route.ts
    notifications/route.ts
    upload/route.ts (S3/local)
    pdf/contract/route.ts
    pdf/invoice/route.ts
components/
  ui/ (cards, badges, table, modal, form inputs, tag status)
  charts/
  layout/Sidebar.tsx, Topbar.tsx
lib/
  db.ts (Mongoose connect)
  auth.ts (session + role guard)
  permissions.ts
  pdf.ts (templates)
  notifications.ts (mock adapter)
  storage.ts (S3/local adapter)
  validators/ (zod schemas)
models/
  *.ts (mongoose schemas)
services/
  vehicleService.ts, reservationService.ts, paymentService.ts, maintenanceService.ts, auditService.ts
styles/
  globals.css, tailwind.css
```

## API contract (extraits)
- `POST /api/auth/login` { email, password } -> { user, token }
- `GET /api/vehicles` query: status, search | `POST` create | `PATCH /api/vehicles/[id]` | `DELETE`
- `POST /api/reservations` crée réservation (statut reserve) et bloque véhicule.
- `POST /api/locations` démarre location à partir d’une réservation => génère contrat PDF, change statut véhicule.
- `POST /api/locations/[id]/prolong` { nouvelleFin }
- `POST /api/payments` associe paiement à location, met à jour statut paiement.
- `POST /api/maintenances` ajoute entretien et peut mettre véhicule en maintenance.
- `POST /api/notifications` push mock.
- `POST /api/pdf/contract` / `invoice` retourne URL/Buffer.
- `POST /api/upload` pour photos (permis, véhicules, état lieux) -> URL stockée.

## Pages principales (admin panel)
- Dashboard: KPIs (CA jour/mois, occupation, alertes, top véhicules, clients récurrents).
- Véhicules: liste + filtres, fiche véhicule (photos, historique, alertes, état statut), upload multi photos.
- Clients: fiche complète + historique + blacklist flag.
- Réservations/Locations: calendrier, création rapide, prolongation 1 clic, génération contrat, état des lieux avant/après.
- Finances: paiements, dépôt de garantie, dépenses (entretien/assurance/carburant/réparations), synthèse comptable simple.
- Maintenance & alertes: planning, échéances (vidange, assurance, vignette, CT).
- Employés: gestion comptes, rôles, permissions fines, audit log.
- Mini-site public: catalogue, prix dynamiques, réservation publique, bouton WhatsApp direct.

## Sécurité & permissions
- Middleware auth (session cookie JWT-signed). Rôle `admin` accès total. Rôle `agent` accès limité (configurable via `permissions.ts`).
- Guards sur API routes + components server.
- AuditLog sur actions sensibles.

## Extensibilité
- i18n prêt (fr par défaut, structure extensible arabe/darija plus tard).
- Adapters pour stockage fichiers et notifications.
- PDF templates modifiables.
