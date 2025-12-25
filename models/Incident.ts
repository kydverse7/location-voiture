import { Schema, model, models, Types } from 'mongoose';

const IncidentSchema = new Schema(
  {
    vehicle: { type: Types.ObjectId, ref: 'Vehicle', required: true },
    location: { type: Types.ObjectId, ref: 'Location' },
    description: { type: String, required: true },
    cout: Number,
    photos: [String],
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Incident = models.Incident || model('Incident', IncidentSchema);
