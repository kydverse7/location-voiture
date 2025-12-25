import { Schema, model, models, Types } from 'mongoose';

const EtatDesLieuxSchema = new Schema(
  {
    vehicle: { type: Types.ObjectId, ref: 'Vehicle', required: true },
    location: { type: Types.ObjectId, ref: 'Location', required: true },
    moment: { type: String, enum: ['avant', 'apres'], required: true },
    schemaPoints: [
      {
        zone: String,
        note: String,
        severite: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
      }
    ],
    photos: [String],
    remarques: String,
    signatureDataUrl: String,
    signePar: String,
    signeLe: Date
  },
  { timestamps: true }
);

export const EtatDesLieux = models.EtatDesLieux || model('EtatDesLieux', EtatDesLieuxSchema);
