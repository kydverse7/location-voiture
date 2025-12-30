import { Schema, model, models, Types } from 'mongoose';

const VehicleSchema = new Schema(
  {
    marque: { type: String, required: true },
    modele: { type: String, required: true },
    annee: Number,
    carburant: { type: String, enum: ['diesel', 'essence', 'hybride'], required: true },
    boite: { type: String, enum: ['manuelle', 'automatique'], required: true },
    immatriculation: { type: String, required: true, unique: true },
    kilometrage: { type: Number, default: 0 },
    statut: {
      type: String,
      enum: ['disponible', 'loue', 'reserve', 'maintenance'],
      default: 'disponible'
    },
    backgroundPhoto: String,
    photos: [String],
    alerts: {
      vidangeAtKm: Number,
      assuranceExpireLe: Date,
      vignetteExpireLe: Date,
      controleTechniqueExpireLe: Date
    },
    historique: {
      locations: [{ type: Types.ObjectId, ref: 'Location' }],
      incidents: [{ type: Types.ObjectId, ref: 'Incident' }],
      maintenances: [{ type: Types.ObjectId, ref: 'Maintenance' }]
    }
  },
  { timestamps: true }
);

export const Vehicle = models.Vehicle || model('Vehicle', VehicleSchema);
