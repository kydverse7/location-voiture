import { z } from 'zod';

export const vehicleSchema = z.object({
  marque: z.string().min(1),
  modele: z.string().min(1),
  annee: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  carburant: z.enum(['diesel', 'essence', 'hybride']),
  boite: z.enum(['manuelle', 'automatique']),
  immatriculation: z.string().min(3),
  kilometrage: z.number().int().nonnegative().default(0),
  statut: z.enum(['disponible', 'loue', 'reserve', 'maintenance']).optional(),
  photos: z.array(z.string()).optional(),
  backgroundPhoto: z.string().optional(),
  alerts: z.object({
    vidangeAtKm: z.number().int().nonnegative().optional(),
    assuranceExpireLe: z.coerce.date().optional(),
    vignetteExpireLe: z.coerce.date().optional(),
    controleTechniqueExpireLe: z.coerce.date().optional()
  }).optional()
});

export const clientSchema = z.object({
  type: z.enum(['particulier', 'entreprise']),
  nom: z.string().min(1),
  prenom: z.string().optional(),
  documentType: z.enum(['cin', 'passeport']).optional(),
  documentNumber: z.string().min(3).optional(),
  telephone: z.string().min(6),
  whatsapp: z.string().optional(),
  permisRectoUrl: z.string().optional(),
  permisVersoUrl: z.string().optional(),
  permisExpireLe: z.coerce.date().optional(),
  notesInternes: z.string().optional(),
  blacklist: z.object({ actif: z.boolean().default(false), motif: z.string().optional() }).optional()
});

export const reservationSchema = z.object({
  vehicle: z.string().min(1),
  client: z.string().optional(), // Client enregistré (ObjectId)
  clientInline: z.object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    telephone: z.string().min(6)
  }).optional(), // Client non enregistré
  debutAt: z.coerce.date(),
  finAt: z.coerce.date(),
  prix: z
    .object({ parJour: z.number().nonnegative(), parSemaine: z.number().optional(), parMois: z.number().optional(), totalEstime: z.number().nonnegative() })
    .optional(),
  caution: z.object({ montant: z.number().nonnegative(), statut: z.enum(['paye', 'en_attente', 'partiel']).default('en_attente') }).optional(),
  canal: z.enum(['interne', 'public']).default('interne')
}).refine(data => data.client || data.clientInline, {
  message: "Veuillez sélectionner un client ou remplir les informations du client"
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;