import { Schema, model, models, Types } from 'mongoose';

const PaymentSchema = new Schema(
  {
    location: { type: Types.ObjectId, ref: 'Location' },
    reservation: { type: Types.ObjectId, ref: 'Reservation' },
    type: { type: String, enum: ['especes', 'carte', 'virement', 'cheque'], required: true },
    montant: { type: Number, required: true },
    statut: { type: String, enum: ['effectue', 'en_attente', 'annule'], default: 'effectue' },
    reference: String,
    notes: String,
    categorie: { type: String, enum: ['location', 'caution', 'complement', 'autre'], default: 'location' }
  },
  { timestamps: true }
);

export const Payment = models.Payment || model('Payment', PaymentSchema);
