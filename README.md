# Location Voiture SaaS (mono-agence)

Stack: Next.js App Router (TypeScript), Tailwind CSS, MongoDB (Mongoose), API Routes, auth email/mot de passe, stockage local ou S3, PDF (pdfkit), notifications mock (WhatsApp/SMS/Email).

## Installation
1. `npm install`
2. Copier `.env.example` vers `.env.local` et renseigner `MONGODB_URI`, `JWT_SECRET`, stratégie stockage.
3. `npm run dev`

## Structure
- `app/(app)/*` : back-office (dashboard, véhicules, clients, réservations, finances, maintenance)
- `app/public-site/*` : mini-site vitrine et réservation publique
- `app/api/*` : routes API (auth, véhicules, clients, réservations, locations, paiements, maintenance, pdf, notifications, upload)
- `models/*` : schémas Mongoose
- `lib/*` : db, auth, pdf, notifications, storage
- `services/*` : audit log

## Points clés
- Rôles: `admin`, `agent` (guard dans middleware + requireRole).
- Audit log sur actions sensibles (création/maj/suppression).
- Génération contrat PDF lors du démarrage d’une location.
- Upload multi support local/S3 (route `/api/upload`).
- Notifications mock via `/api/notifications`.

## TODO rapide
- Brancher vrai calendrier et formulaires (zod + react-hook-form).
- Ajouter pages détail (vehicle/[id], client/[id], reservation/[id]).
- Finaliser UI responsive mobile/tablette.
- Ajouter seed d’utilisateurs (admin) et tests e2e.
