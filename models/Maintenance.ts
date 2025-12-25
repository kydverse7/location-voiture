import { Schema, model, models, Types } from 'mongoose';

const MaintenanceSchema = new Schema(
  {
    vehicle: { type: Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, enum: ['entretien', 'assurance', 'carburant', 'reparation'], required: true },
    description: String,
    cout: Number,
    date: { type: Date, default: Date.now },
    prochaineEcheance: Date
  },
  { timestamps: true }
);

export const Maintenance = models.Maintenance || model('Maintenance', MaintenanceSchema);
