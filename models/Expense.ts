import { Schema, model, models, Types } from 'mongoose';

const ExpenseSchema = new Schema(
  {
    type: { type: String, enum: ['entretien', 'assurance', 'carburant', 'reparation', 'vidange', 'pneus', 'lavage', 'parking', 'amende', 'autre'], required: true },
    montant: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: String,
    vehicleId: { type: Types.ObjectId, ref: 'Vehicle' },
    fournisseur: String
  },
  { timestamps: true }
);

export const Expense = models.Expense || model('Expense', ExpenseSchema);