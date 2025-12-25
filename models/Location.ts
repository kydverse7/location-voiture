import { Schema, model, models, Types } from 'mongoose';

const LocationSchema = new Schema(
  {
    reservation: { type: Types.ObjectId, ref: 'Reservation', required: true },
    vehicle: { type: Types.ObjectId, ref: 'Vehicle', required: true },
    client: { type: Types.ObjectId, ref: 'Client', required: true },
    statut: { type: String, enum: ['en_cours', 'terminee', 'annulee'], default: 'en_cours' },
    debutAt: { type: Date, required: true },
    finPrevueAt: { type: Date, required: true },
    finReelleAt: Date,
    prolongations: [
      {
        nouvelleFin: Date,
        montantSup: Number,
        date: { type: Date, default: Date.now }
      }
    ],
    montantTotal: Number,
    caution: {
      montant: Number,
      statut: { type: String, enum: ['paye', 'en_attente', 'partiel'], default: 'en_attente' }
    },
    paiements: [{ type: Types.ObjectId, ref: 'Payment' }],
    contratPdfUrl: String,
    etatDesLieuxAvantId: { type: Types.ObjectId, ref: 'EtatDesLieux' },
    etatDesLieuxApresId: { type: Types.ObjectId, ref: 'EtatDesLieux' }
  },
  { timestamps: true }
);

export const Location = models.Location || model('Location', LocationSchema);
