import { Schema, model, models, Types } from 'mongoose';

const ClientSchema = new Schema(
  {
    type: { type: String, enum: ['particulier', 'entreprise'], required: true },
    nom: { type: String, required: true },
    prenom: { type: String },
    // Optionnels pour permettre la création automatique depuis une demande publique.
    // L'agence pourra compléter plus tard.
    documentType: { type: String, enum: ['cin', 'passeport'] },
    documentNumber: { type: String },
    telephone: { type: String, required: true },
    whatsapp: String,
    permisRectoUrl: String,
    permisVersoUrl: String,
    permisExpireLe: Date,
    notesInternes: String,
    blacklist: {
      actif: { type: Boolean, default: false },
      motif: String
    },
    historiqueLocations: [{ type: Types.ObjectId, ref: 'Location' }]
  },
  { timestamps: true }
);

export const Client = models.Client || model('Client', ClientSchema);
