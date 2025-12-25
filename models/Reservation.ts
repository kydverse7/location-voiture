import { Schema, model, models, Types } from 'mongoose';

const ReservationSchema = new Schema(
  {
    vehicle: { type: Types.ObjectId, ref: 'Vehicle', required: true },
    client: { type: Types.ObjectId, ref: 'Client' },
    clientInline: {
      nom: String,
      prenom: String,
      telephone: String
    },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    statut: {
      type: String,
      enum: ['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee'],
      default: 'en_attente'
    },
    debutAt: { type: Date, required: true },
    finAt: { type: Date, required: true },
    prix: {
      parJour: Number,
      parSemaine: Number,
      parMois: Number,
      totalEstime: Number
    },
    // Paiement
    paiementStatut: { 
      type: String, 
      enum: ['paye', 'partiel', 'plus_tard'], 
      default: 'plus_tard' 
    },
    montantPaye: { type: Number, default: 0 },
    montantRestant: { type: Number, default: 0 },
    typePaiement: { 
      type: String, 
      enum: ['especes', 'carte', 'virement', 'cheque'], 
      default: 'especes' 
    },
    // Caution
    caution: {
      montant: Number,
      statut: { type: String, enum: ['paye', 'en_attente', 'partiel'], default: 'en_attente' }
    },
    retardMinutes: { type: Number, default: 0 },
    canal: { type: String, enum: ['interne', 'public'], default: 'interne' },
    contratPdfUrl: String,
    etatDesLieuxId: { type: Types.ObjectId, ref: 'EtatDesLieux' },
    location: { type: Types.ObjectId, ref: 'Location' },
    notifications: [
      {
        type: { type: String },
        statut: { type: String },
        sentAt: Date
      }
    ]
  },
  { timestamps: true }
);

export const Reservation = models.Reservation || model('Reservation', ReservationSchema);
